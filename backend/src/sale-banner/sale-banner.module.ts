import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SaleBannerService } from './sale-banner.service';
import { SaleBannerController } from './sale-banner.controller';
import {
  SaleBannerContent,
  SaleBannerContentSchema,
} from '../common/schemas/sale-banner-content.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SaleBannerContent.name, schema: SaleBannerContentSchema },
    ]),
  ],
  controllers: [SaleBannerController],
  providers: [SaleBannerService],
})
export class SaleBannerModule {}
