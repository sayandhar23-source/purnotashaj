import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StoreSettings, StoreSettingsDocument } from '../common/schemas/store-settings.schema';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(StoreSettings.name) private settingsModel: Model<StoreSettingsDocument>,
  ) {}

  // Auto-creates the singleton settings document on first read, seeded from the
  // WHATSAPP_PHONE_NUMBER env var if present — so upgrading an existing deployment
  // doesn't lose the number that was previously hardcoded via env var.
  async getSettings() {
    let settings = await this.settingsModel.findOne();
    if (!settings) {
      settings = await this.settingsModel.create({
        whatsappNumber: process.env.WHATSAPP_PHONE_NUMBER || '',
      });
    }
    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto) {
    let settings = await this.settingsModel.findOne();
    if (!settings) {
      settings = await this.settingsModel.create(dto);
    } else {
      Object.assign(settings, dto);
      await settings.save();
    }
    return settings;
  }
}
