import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../common/schemas/order.schema';
import { OrdersService } from '../orders/orders.service';
import { safeEqual } from '../common/utils/crypto.util';

const PAID_STATES = ['paid', 'confirmed', 'shipped', 'delivered'];

@Injectable()
export class PaymentsService {
  private logger = new Logger(PaymentsService.name);
  private stripe: Stripe;
  private razorpay: Razorpay | null;

  constructor(
    private config: ConfigService,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private ordersService: OrdersService,
  ) {
    this.stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // The Razorpay SDK throws synchronously if key_id is missing, which would take
    // down the whole app on boot. Only construct it if both keys are actually set —
    // callers get a clear error instead of the server failing to start.
    const razorpayKeyId = this.config.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = this.config.get('RAZORPAY_KEY_SECRET');
    this.razorpay =
      razorpayKeyId && razorpayKeySecret
        ? new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret })
        : null;
  }

  private getRazorpay(): Razorpay {
    if (!this.razorpay) {
      throw new Error(
        'Razorpay is not configured — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to accept Razorpay payments.',
      );
    }
    return this.razorpay;
  }

  // A payment can only be started for the customer's OWN order, while it is still
  // unpaid. "Not yours" and "doesn't exist" give the same answer on purpose.
  // (Previously any logged-in user could start/overwrite a payment for any order id.)
  private async loadPayableOrder(orderId: string, userId: string, provider: 'stripe' | 'razorpay') {
    if (!Types.ObjectId.isValid(orderId)) throw new NotFoundException('Order not found');
    const order = await this.orderModel.findOne({ _id: orderId, user: userId });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'pending') {
      throw new BadRequestException('This order has already been processed.');
    }
    if (order.paymentProvider !== provider) {
      throw new BadRequestException('This order was placed for a different payment method.');
    }
    return order;
  }

  // --- Stripe ---
  async createStripeCheckoutSession(orderId: string, userId: string) {
    const order = await this.loadPayableOrder(orderId, userId, 'stripe');

    // Stripe charges per line item (not order.totalAmount like Razorpay does), so
    // the combo discount has to be applied explicitly — otherwise Stripe
    // customers would be charged the full undiscounted amount.
    let discounts: { coupon: string }[] | undefined;
    if (order.discountAmount && order.discountAmount > 0) {
      const coupon = await this.stripe.coupons.create({
        amount_off: Math.round(order.discountAmount * 100),
        currency: order.currency.toLowerCase(),
        duration: 'once',
        name: 'Combo discount',
      });
      discounts = [{ coupon: coupon.id }];
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      discounts,
      line_items: order.items.map((item) => ({
        price_data: {
          currency: order.currency.toLowerCase(),
          product_data: { name: item.title + (item.variantName ? ` - ${item.variantName}` : '') },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      success_url: `${this.config.get('FRONTEND_URL')}/checkout/success?order_id=${orderId}`,
      cancel_url: `${this.config.get('FRONTEND_URL')}/checkout/cancelled?order_id=${orderId}`,
      metadata: { orderId },
    });

    order.paymentReference = session.id;
    await order.save();

    return { checkoutUrl: session.url };
  }

  // Signed by Stripe, over the exact bytes of the request — so it needs the RAW
  // body. It used to receive the already-parsed JSON, which made the signature
  // check fail every time: Stripe payments could never be marked as paid.
  async handleStripeWebhook(rawBody: Buffer | undefined, signature: string) {
    const secret = this.config.get('STRIPE_WEBHOOK_SECRET');
    if (!secret) throw new ServiceUnavailableException('Stripe webhook is not configured.');
    if (!rawBody || !signature) throw new BadRequestException('Missing webhook payload or signature.');

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch {
      throw new BadRequestException('Invalid webhook signature.');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      // Only a session that is actually PAID counts — "completed" alone isn't proof
      if (orderId && Types.ObjectId.isValid(orderId) && session.payment_status === 'paid') {
        const order = await this.orderModel.findById(orderId);
        if (order && order.status === 'pending' && order.paymentReference === session.id) {
          const expected = Math.round(order.totalAmount * 100);
          if (session.amount_total !== expected || session.currency !== order.currency.toLowerCase()) {
            this.logger.error(
              `Stripe amount mismatch for order ${orderId}: paid ${session.amount_total} ${session.currency}, expected ${expected}`,
            );
          } else {
            await this.ordersService.markOrderPaid(order._id, String(session.payment_intent || session.id));
          }
        }
      }
    }
    return { received: true };
  }

  // --- Razorpay ---
  async createRazorpayOrder(orderId: string, userId: string) {
    const order = await this.loadPayableOrder(orderId, userId, 'razorpay');

    // Razorpay rejects orders under ₹1 (100 paise) outright — check here first
    // so the failure is a clear message, not a confusing API error.
    if (order.totalAmount < 1) {
      throw new BadRequestException('Order amount must be at least ₹1.');
    }

    let rpOrder;
    try {
      rpOrder = await this.getRazorpay().orders.create({
        amount: Math.round(order.totalAmount * 100),
        currency: order.currency || 'INR',
        receipt: orderId,
        notes: { orderId },
      });
    } catch (err: any) {
      // Razorpay's SDK throws its own error shape on auth failures, invalid
      // params, etc. — wrap it so callers get a clean message either way.
      if (err?.statusCode === 401) {
        throw new BadRequestException('Payment gateway authentication failed — check the Razorpay API keys.');
      }
      throw new InternalServerErrorException('Could not create the payment order. Please try again.');
    }

    order.paymentReference = rpOrder.id;
    await order.save();

    return {
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      keyId: this.config.get('RAZORPAY_KEY_ID'),
    };
  }

  // Called by the browser after the Razorpay popup succeeds.
  //
  // The signature only proves "Razorpay says payment P was made for Razorpay-order R".
  // Previously nothing tied R to the order being marked paid — so someone could pay
  // ₹1 for a cheap order, then present that same genuine receipt against a ₹5,000
  // order and have it marked paid. Now the receipt must be for THIS customer's
  // order AND for exactly the Razorpay order created for it.
  async verifyRazorpayPayment(
    params: { orderId: string; razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string },
    userId: string,
  ) {
    const expectedSignature = crypto
      .createHmac('sha256', this.config.get('RAZORPAY_KEY_SECRET') || '')
      .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
      .digest('hex');

    if (!safeEqual(expectedSignature, params.razorpaySignature)) {
      throw new BadRequestException('Payment verification failed — the signature did not match.');
    }

    if (!Types.ObjectId.isValid(params.orderId)) throw new NotFoundException('Order not found');
    const order = await this.orderModel.findOne({ _id: params.orderId, user: userId });
    if (!order) throw new NotFoundException('Order not found');

    if (order.paymentReference !== params.razorpayOrderId) {
      throw new BadRequestException('This payment does not belong to this order.');
    }

    // Already processed (e.g. the webhook got there first, or this is a retry): succeed quietly
    if (PAID_STATES.includes(order.status)) return { verified: true };
    if (order.status !== 'pending') {
      throw new BadRequestException('This order can no longer be paid.');
    }

    await this.ordersService.markOrderPaid(order._id, params.razorpayPaymentId);
    return { verified: true };
  }

  // Razorpay -> server notification. This is the safety net for the case where a
  // customer pays and then closes the tab before the browser can confirm: without
  // it, the money is taken but the order stays "pending" forever.
  // Requires RAZORPAY_WEBHOOK_SECRET (set when adding the webhook in the Razorpay dashboard).
  async handleRazorpayWebhook(rawBody: Buffer | undefined, signature: string) {
    const secret = this.config.get('RAZORPAY_WEBHOOK_SECRET');
    if (!secret) throw new ServiceUnavailableException('Razorpay webhook is not configured.');
    if (!rawBody || !signature) throw new BadRequestException('Missing webhook payload or signature.');

    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    if (!safeEqual(expected, signature)) throw new UnauthorizedException('Invalid webhook signature.');

    let event: any;
    try {
      event = JSON.parse(rawBody.toString('utf8'));
    } catch {
      throw new BadRequestException('Malformed webhook payload.');
    }

    if (event?.event === 'order.paid') {
      const rpOrder = event.payload?.order?.entity;
      const payment = event.payload?.payment?.entity;
      if (rpOrder?.id) {
        const order = await this.orderModel.findOne({ paymentReference: rpOrder.id });
        if (order && order.status === 'pending') {
          if (rpOrder.amount_paid !== Math.round(order.totalAmount * 100)) {
            this.logger.error(
              `Razorpay amount mismatch for order ${order._id}: paid ${rpOrder.amount_paid}, expected ${Math.round(order.totalAmount * 100)}`,
            );
          } else {
            await this.ordersService.markOrderPaid(order._id, payment?.id || rpOrder.id);
          }
        }
      }
    }
    return { received: true };
  }
}
