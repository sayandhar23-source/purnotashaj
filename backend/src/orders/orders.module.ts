import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from '../common/schemas/order.schema';
import { Product, ProductSchema } from '../common/schemas/product.schema';
import { StoreSettings, StoreSettingsSchema } from '../common/schemas/store-settings.schema';
import { MailModule } from '../mail/mail.module';
import { ReferralsModule } from '../referrals/referrals.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { GeoModule } from '../geo/geo.module';
import { ProductsModule } from '../products/products.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: StoreSettings.name, schema: StoreSettingsSchema },
    ]),
    MailModule,
    ReferralsModule,
    NotificationsModule,
    GeoModule,
    ProductsModule,
    ChatModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
