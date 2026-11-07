import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../common/schemas/order.schema';
import { Product, ProductDocument } from '../common/schemas/product.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './dto/update-order-status.dto';
import { MailService } from '../mail/mail.service';
import { ReferralsService } from '../referrals/referrals.service';
import { NotificationsService } from '../notifications/notifications.service';
import { GeoService } from '../geo/geo.service';
import { ProductsService } from '../products/products.service';
import { ChatService } from '../chat/chat.service';
import { StoreSettings, StoreSettingsDocument } from '../common/schemas/store-settings.schema';
import { computeComboDiscount, DEFAULT_COMBO_TIERS } from '../common/utils/combo-discount';
import { clampLimit, clampPage } from '../common/utils/pagination';
import { describeProblems, priceOrderLines } from './order-pricing';

@Injectable()
export class OrdersService {
  private logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(StoreSettings.name) private settingsModel: Model<StoreSettingsDocument>,
    private mailService: MailService,
    private referralsService: ReferralsService,
    private notificationsService: NotificationsService,
    private geoService: GeoService,
    private productsService: ProductsService,
    private chatService: ChatService,
  ) {}

  async create(userId: string, dto: CreateOrderDto, ip: string | null) {
    // We don't ship outside India yet — block the order at the API level,
    // not just in the UI, so this can't be bypassed by calling the endpoint directly.
    const isIndia = await this.geoService.isIndianIp(ip);
    if (!isIndia) {
      throw new ForbiddenException(
        "We don't deliver outside India yet — international shipping is coming soon.",
      );
    }

    // Every price, title and image in the order comes from the DATABASE. The
    // request only says which products/variants/quantities — it can no longer
    // decide what gets charged. (Before this, a cart edited in the browser could
    // be checked out at any price.)
    const productIds = [...new Set(dto.items.map((i) => i.product))];
    const products = await this.productModel.find({ _id: { $in: productIds } }).lean();
    const { lines, problems } = priceOrderLines(
      dto.items.map((i) => ({ product: i.product, variantId: i.variantId, quantity: i.quantity, price: i.price })),
      products,
    );
    if (problems.length > 0) {
      // 409 with structured details so the storefront can fix the cart and let the
      // customer confirm again, instead of silently charging a different amount.
      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        code: 'CART_CHANGED',
        message: describeProblems(problems),
        problems,
      });
    }

    // Work in whole paise so rupee amounts never accumulate floating-point drift
    const subtotalPaise = lines.reduce((sum, l) => sum + Math.round(l.price * 100) * l.quantity, 0);
    const subtotal = subtotalPaise / 100;

    const settings = await this.settingsModel.findOne();
    const comboEnabled = settings?.comboDiscountEnabled !== false;
    const tiers = settings?.comboDiscountTiers?.length ? settings.comboDiscountTiers : DEFAULT_COMBO_TIERS;
    const { discount } = comboEnabled ? computeComboDiscount(subtotal, tiers) : { discount: 0 };

    const referralUserId = await this.referralsService.resolveReferrer(dto.referralCode, userId);
    return this.orderModel.create({
      items: lines,
      shippingAddress: { ...dto.shippingAddress },
      paymentProvider: dto.paymentProvider,
      currency: 'INR',
      subtotalAmount: subtotal,
      discountAmount: discount,
      totalAmount: subtotal - discount,
      user: userId,
      status: 'pending',
      referralCode: referralUserId ? dto.referralCode : undefined,
      referralUserId: referralUserId || undefined,
    });
  }

  findMyOrders(userId: string) {
    return this.orderModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('items.product');
  }

  async findOne(id: string, userId?: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Order not found');
    const filter: any = { _id: id };
    if (userId) filter.user = userId;
    const order = await this.orderModel.findOne(filter).populate('items.product');
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // The single place an order becomes "paid". The status flip is an atomic
  // pending -> paid claim, so when the browser's confirmation and the payment
  // provider's webhook arrive together (or a request is replayed), exactly one
  // of them wins and everything below — stock, alerts — happens exactly once.
  async markOrderPaid(id: string | Types.ObjectId, paymentId: string) {
    const order = await this.orderModel
      .findOneAndUpdate({ _id: id, status: 'pending' }, { $set: { status: 'paid', paymentId } }, { new: true })
      .populate('user', 'email');
    if (!order) return null; // already processed (or not payable)

    let stockWarnings: string[] = [];
    const claimed = await this.orderModel.findOneAndUpdate(
      { _id: order._id, stockDeducted: { $ne: true } },
      { $set: { stockDeducted: true } },
    );
    if (claimed) {
      try {
        stockWarnings = await this.productsService.deductStock(order.items);
      } catch (err) {
        this.logger.error(`Stock deduction failed for order ${order._id}: ${err}`);
        stockWarnings = ['Stock update failed — please check inventory manually'];
      }
    }

    const customer: any = order.user;
    // A failing email/Telegram message must never turn a successful payment into an error
    await Promise.allSettled([
      this.mailService.sendAdminNewOrderNotification(
        order._id.toString(),
        order.totalAmount,
        customer?.email || 'unknown',
      ),
      this.chatService.sendOrderAlert({
        orderId: order._id.toString(),
        customerEmail: customer?.email || 'unknown',
        items: order.items,
        discountAmount: order.discountAmount,
        totalAmount: order.totalAmount,
        stockWarnings,
      }),
    ]);

    return order;
  }

  // Cancelling puts the items back in stock — exactly once, however many times it's clicked
  private async restockOrder(order: OrderDocument) {
    const claimed = await this.orderModel.findOneAndUpdate(
      { _id: order._id, stockDeducted: true },
      { $set: { stockDeducted: false } },
    );
    if (claimed) await this.productsService.restockItems(order.items);
  }

  async updateStatus(id: string, status: OrderStatus) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Order not found');
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    if (order.status === status) return order; // idempotent — no duplicate side effects
    if (order.status === 'cancelled') {
      throw new BadRequestException(
        "A cancelled order can't be reopened — ask the customer to place a new order.",
      );
    }

    const unpaid = order.status === 'pending' || order.status === 'failed';
    if (unpaid && ['confirmed', 'shipped', 'delivered'].includes(status)) {
      throw new BadRequestException("This order hasn't been paid yet, so it can't be confirmed or shipped.");
    }

    // Confirming must go through confirmOrder so the customer email + referral
    // commission always happen, and only once.
    if (status === 'confirmed') return this.confirmOrder(id);

    if (status === 'paid') {
      if (order.status !== 'pending') {
        throw new BadRequestException('Only an unpaid (pending) order can be marked as paid.');
      }
      const paid = await this.markOrderPaid(id, 'marked-paid-by-admin');
      return paid || (await this.orderModel.findById(id));
    }

    // Atomic: only applies if the order is still in the state we just read
    const updated = await this.orderModel.findOneAndUpdate(
      { _id: id, status: order.status },
      { $set: { status } },
      { new: true },
    );
    if (!updated) {
      throw new ConflictException('This order was just updated elsewhere — refresh and try again.');
    }

    if (status === 'cancelled' || status === 'failed') {
      await this.referralsService.reverseCommission(id);
      if (status === 'cancelled') {
        await this.restockOrder(updated);
        await this.notificationsService.notifyOrderCancelled(updated.user.toString(), id);
      }
    }

    return updated;
  }

  // Admin confirms the order — this is the point at which the customer is emailed.
  // Only a PAID order can be confirmed, and only once: the pending-confirmation ->
  // confirmed change is an atomic claim, so a double-click can't send two emails
  // or credit the referrer twice (and confirming an unpaid order is refused).
  async confirmOrder(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Order not found');

    const order = await this.orderModel
      .findOneAndUpdate(
        { _id: id, status: 'paid', adminConfirmed: false },
        { $set: { adminConfirmed: true, confirmedAt: new Date(), status: 'confirmed' } },
        { new: true },
      )
      .populate('user', 'name email');

    if (!order) {
      const existing = await this.orderModel.findById(id);
      if (!existing) throw new NotFoundException('Order not found');
      if (existing.adminConfirmed) return existing; // already confirmed — nothing more to do
      throw new BadRequestException('Only a paid order can be confirmed.');
    }

    await this.referralsService.creditCommission(order);

    const customer: any = order.user;
    if (customer?.email) {
      await this.mailService.sendOrderConfirmation(customer.email, order._id.toString(), order.totalAmount);
    }
    await this.notificationsService.notifyOrderConfirmed(
      (customer?._id || order.user).toString(),
      order._id.toString(),
      order.totalAmount,
    );

    return order;
  }

  // Count of paid-but-unconfirmed orders — drives the admin dashboard notification badge
  countPendingConfirmation() {
    return this.orderModel.countDocuments({ status: 'paid', adminConfirmed: false });
  }

  // Admin
  findAll(rawPage: unknown = 1, rawLimit: unknown = 20) {
    const page = clampPage(rawPage);
    const limit = clampLimit(rawLimit, 20, 100);
    const skip = (page - 1) * limit;
    return Promise.all([
      this.orderModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email').lean(),
      this.orderModel.countDocuments(),
    ]).then(([orders, total]) => ({ orders, total, page, pages: Math.ceil(total / limit) }));
  }
}
