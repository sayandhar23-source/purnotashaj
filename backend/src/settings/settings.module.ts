import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { StoreSettings, StoreSettingsSchema } from '../common/schemas/store-settings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: StoreSettings.name, schema: StoreSettingsSchema }]),
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
