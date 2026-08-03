import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StoreSettingsDocument = StoreSettings & Document;

// Singleton document — only one of these ever exists. Holds store-wide settings
// that admins should be able to change at runtime without a redeploy.
@Schema({ timestamps: true })
export class StoreSettings {
  @Prop({ default: '' })
  whatsappNumber: string; // digits only, with country code, no + — e.g. 919999999999

  @Prop({ default: '' })
  instagramUrl: string;

  @Prop({ default: '' })
  facebookUrl: string;

  @Prop({ default: '' })
  youtubeUrl: string;

  @Prop({ default: '' })
  pinterestUrl: string;

  // Live chat widget relays visitor messages to this Telegram chat.
  // The bot token itself lives in the backend env var TELEGRAM_BOT_TOKEN,
  // not here — same pattern as other API keys (Stripe, Resend, etc.).
  @Prop({ default: '' })
  telegramChatId: string;

  // Referral program commission rate, as a whole percentage (10 = 10%).
  @Prop({ default: 10 })
  referralCommissionPercent: number;

  // Delivery estimate zones — used to compute an estimated delivery date
  // range from a customer's pincode on the product page. All admin-editable.
  @Prop({ default: 'West Bengal' })
  shippingOriginState: string;

  @Prop({ default: 3 })
  sameStateDeliveryMinDays: number;

  @Prop({ default: 6 })
  sameStateDeliveryMaxDays: number;

  @Prop({ default: 7 })
  otherStateDeliveryMinDays: number;

  @Prop({ default: 10 })
  otherStateDeliveryMaxDays: number;

  @Prop({ default: 12 })
  remoteDeliveryMinDays: number;

  @Prop({ default: 15 })
  remoteDeliveryMaxDays: number;

  @Prop({
    default: [
      'Arunachal Pradesh',
      'Nagaland',
      'Manipur',
      'Mizoram',
      'Tripura',
      'Meghalaya',
      'Sikkim',
      'Andaman and Nicobar Islands',
      'Lakshadweep',
      'Jammu and Kashmir',
      'Ladakh',
    ],
  })
  remoteStates: string[];

  // Decorative section divider shown between homepage sections. 'none' hides it entirely.
  @Prop({ default: 'none' })
  activeDivider: string;
}

export const StoreSettingsSchema = SchemaFactory.createForClass(StoreSettings);
