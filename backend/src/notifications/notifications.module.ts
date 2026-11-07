import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { User, UserSchema } from '../common/schemas/user.schema';
import { Product, ProductSchema } from '../common/schemas/product.schema';
import { Category, CategorySchema } from '../common/schemas/category.schema';
import { Notification, NotificationSchema } from '../common/schemas/notification.schema';
import {
  NotificationBroadcast,
  NotificationBroadcastSchema,
} from '../common/schemas/notification-broadcast.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: NotificationBroadcast.name, schema: NotificationBroadcastSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
