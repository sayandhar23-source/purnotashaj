import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { PaymentsModule } from './payments/payments.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { BannersModule } from './banners/banners.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdminLogsModule } from './admin-logs/admin-logs.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MailModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    WishlistModule,
    PaymentsModule,
    NewsletterModule,
    BannersModule,
    AnalyticsModule,
    AdminLogsModule,
  ],
})
export class AppModule {}
