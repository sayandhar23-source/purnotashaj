import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StoreSettings, StoreSettingsDocument } from '../common/schemas/store-settings.schema';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { appCache, CACHE_KEYS } from '../common/utils/ttl-cache';

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

  // What the public storefront may see. Internal values (the admin's Telegram chat id)
  // are left out — the public endpoint used to return the entire settings document.
  // Read on nearly every page view, so it's cached briefly (cleared on any admin save).
  getPublicSettings() {
    return appCache.wrap(CACHE_KEYS.settings, 30_000, async () => {
      const doc = await this.getSettings();
      const { telegramChatId, __v, ...publicFields } = doc.toObject() as any;
      return publicFields;
    });
  }

  async updateSettings(dto: UpdateSettingsDto) {
    if (dto.comboDiscountTiers) {
      const thresholds = new Set<number>();
      for (const tier of dto.comboDiscountTiers) {
        if (tier.discount >= tier.minTotal) {
          throw new BadRequestException(
            `A ₹${tier.discount} discount at a ₹${tier.minTotal} cart total doesn't make sense — the discount must be smaller than the total.`,
          );
        }
        if (thresholds.has(tier.minTotal)) {
          throw new BadRequestException(`Two tiers share the same ₹${tier.minTotal} threshold.`);
        }
        thresholds.add(tier.minTotal);
      }
    }

    let settings = await this.settingsModel.findOne();
    if (!settings) {
      settings = await this.settingsModel.create(dto);
    } else {
      Object.assign(settings, dto);
      await settings.save();
    }
    appCache.del(CACHE_KEYS.settings);
    return settings;
  }
}
