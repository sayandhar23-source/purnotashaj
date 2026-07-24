import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../common/schemas/order.schema';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private razorpay: Razorpay | null;

  constructor(
    private config: ConfigService,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private mailService: MailService,
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

  // --- Stripe ---
  async createStripeCheckoutSession(orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new Error('Order not found');

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
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

  async handleStripeWebhook(rawBody: Buffer, signature: string) {
    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      this.config.get('STRIPE_WEBHOOK_SECRET'),
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        const order = await this.orderModel
          .findByIdAndUpdate(orderId, { status: 'paid' }, { new: true })
          .populate('user', 'email');
        if (order) {
          const customer: any = order.user;
          await this.mailService.sendAdminNewOrderNotification(
            order._id.toString(),
            order.totalAmount,
            customer?.email || 'unknown',
          );
        }
      }
    }
    return { received: true };
  }

  // --- Razorpay ---
  async createRazorpayOrder(orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new Error('Order not found');

    const rpOrder = await this.getRazorpay().orders.create({
      amount: Math.round(order.totalAmount * 100),
      currency: order.currency || 'INR',
      receipt: orderId,
    });

    order.paymentReference = rpOrder.id;
    await order.save();

    return {
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      keyId: this.config.get('RAZORPAY_KEY_ID'),
    };
  }

  async verifyRazorpayPayment(params: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const body = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.config.get('RAZORPAY_KEY_SECRET'))
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === params.razorpaySignature;
    if (isValid) {
      const order = await this.orderModel
        .findByIdAndUpdate(
          params.orderId,
          { status: 'paid', paymentReference: params.razorpayPaymentId },
          { new: true },
        )
        .populate('user', 'email');
      if (order) {
        const customer: any = order.user;
        await this.mailService.sendAdminNewOrderNotification(
          order._id.toString(),
          order.totalAmount,
          customer?.email || 'unknown',
        );
      }
    }
    return { verified: isValid };
  }
}
