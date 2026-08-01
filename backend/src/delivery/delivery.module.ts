import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { StoreSettings, StoreSettingsSchema } from '../common/schemas/store-settings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: StoreSettings.name, schema: StoreSettingsSchema }]),
  ],
  controllers: [DeliveryController],
  providers: [DeliveryService],
})
export class DeliveryModule {}
