import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../common/schemas/user.schema';
import { Product, ProductDocument } from '../common/schemas/product.schema';
import { Category, CategoryDocument } from '../common/schemas/category.schema';
import { Notification, NotificationDocument } from '../common/schemas/notification.schema';
import {
  NotificationBroadcast,
  NotificationBroadcastDocument,
} from '../common/schemas/notification-broadcast.schema';
import { SendNotificationDto } from './dto/send-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(NotificationBroadcast.name)
    private broadcastModel: Model<NotificationBroadcastDocument>,
  ) {}

  // --- Personal, system-generated notifications (order events) ---

  async notifyOrderConfirmed(userId: string, orderId: string, total: number) {
    await this.notificationModel.create({
      user: userId,
      title: 'Order Confirmed',
      message: `Your order #${orderId.slice(-8)} for ₹${total} has been confirmed and is being prepared.`,
      type: 'order_confirmed',
      linkType: 'none',
    });
  }

  async notifyOrderCancelled(userId: string, orderId: string) {
    await this.notificationModel.create({
      user: userId,
      title: 'Order Cancelled',
      message: `Your order #${orderId.slice(-8)} has been cancelled. Contact us if this wasn't expected.`,
      type: 'order_cancelled',
      linkType: 'none',
    });
  }

  // --- User-facing reads ---

  getMyNotifications(userId: string) {
    return this.notificationModel.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationModel.countDocuments({ user: userId, isRead: false });
    return { count };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.notificationModel.findOne({ _id: notificationId, user: userId });
    if (!notification) throw new NotFoundException('Notification not found');
    notification.isRead = true;
    await notification.save();
    return notification;
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany({ user: userId, isRead: false }, { isRead: true });
    return { message: 'All notifications marked as read.' };
  }

  // --- Admin: broadcast to every customer ---

  async sendBroadcast(dto: SendNotificationDto) {
    let image = dto.customImage;
    let linkType = dto.linkType || 'none';
    let linkSlug: string | undefined;

    if (dto.productSlug) {
      const product = await this.productModel.findOne({ slug: dto.productSlug });
      if (!product) throw new NotFoundException('Product not found');
      image = product.images?.[0] || image;
      linkType = 'product';
      linkSlug = product.slug;
    } else if (dto.categorySlug) {
      const category = await this.categoryModel.findOne({ slug: dto.categorySlug });
      if (!category) throw new NotFoundException('Category not found');
      image = category.image || image;
      linkType = 'category';
      linkSlug = category.slug;
    } else if (linkType === 'sale') {
      linkSlug = undefined; // /sale needs no slug
    }

    const customers = await this.userModel.find({ role: 'customer' }).select('_id');

    if (customers.length > 0) {
      await this.notificationModel.insertMany(
        customers.map((c) => ({
          user: c._id,
          title: dto.title,
          message: dto.message,
          type: dto.type,
          image,
          linkType,
          linkSlug,
          isRead: false,
        })),
      );
    }

    await this.broadcastModel.create({
      title: dto.title,
      message: dto.message,
      type: dto.type,
      image,
      linkType,
      linkSlug,
      recipientCount: customers.length,
    });

    return { message: `Sent to ${customers.length} customer(s).`, recipientCount: customers.length };
  }

  getBroadcastHistory() {
    return this.broadcastModel.find().sort({ createdAt: -1 }).limit(50);
  }
}
