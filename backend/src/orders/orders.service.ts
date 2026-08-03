import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../common/schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { MailService } from '../mail/mail.service';
import { ReferralsService } from '../referrals/referrals.service';
import { NotificationsService } from '../notifications/notifications.service';
import { GeoService } from '../geo/geo.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private mailService: MailService,
    private referralsService: ReferralsService,
    private notificationsService: NotificationsService,
    private geoService: GeoService,
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

    const { referralCode, ...rest } = dto;
    const referralUserId = await this.referralsService.resolveReferrer(referralCode, userId);
    return this.orderModel.create({
      ...rest,
      user: userId,
      status: 'pending',
      referralCode: referralUserId ? referralCode : undefined,
      referralUserId: referralUserId || undefined,
    });
  }

  findMyOrders(userId: string) {
    return this.orderModel.find({ user: userId }).sort({ createdAt: -1 }).populate('items.product');
  }

  async findOne(id: string, userId?: string) {
    const filter: any = { _id: id };
    if (userId) filter.user = userId;
    const order = await this.orderModel.findOne(filter).populate('items.product');
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: string, paymentReference?: string) {
    const update: any = { status };
    if (paymentReference) update.paymentReference = paymentReference;
    const order = await this.orderModel.findByIdAndUpdate(id, update, { new: true });
    if (!order) throw new NotFoundException('Order not found');

    if (status === 'cancelled' || status === 'failed') {
      await this.referralsService.reverseCommission(id);
      if (status === 'cancelled') {
        await this.notificationsService.notifyOrderCancelled(order.user.toString(), id);
      }
    }

    return order;
  }

  // Called after a successful payment (Stripe webhook / Razorpay verify).
  // Notifies the admin by email that a new order needs confirmation — it does NOT
  // notify the customer yet, that only happens once the admin explicitly confirms.
  async notifyAdminOfNewOrder(id: string) {
    const order = await this.orderModel.findById(id).populate('user', 'name email');
    if (!order) return;
    const customer: any = order.user;
    await this.mailService.sendAdminNewOrderNotification(
      order._id.toString(),
      order.totalAmount,
      customer?.email || 'unknown',
    );
  }

  // Admin confirms the order — this is the point at which the customer is emailed.
  async confirmOrder(id: string) {
    const order = await this.orderModel.findById(id).populate('user', 'name email');
    if (!order) throw new NotFoundException('Order not found');

    order.adminConfirmed = true;
    order.confirmedAt = new Date();
    if (order.status === 'paid') order.status = 'confirmed' as any;
    await order.save();

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
  findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return Promise.all([
      this.orderModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email'),
      this.orderModel.countDocuments(),
    ]).then(([orders, total]) => ({ orders, total, page, pages: Math.ceil(total / limit) }));
  }
}
