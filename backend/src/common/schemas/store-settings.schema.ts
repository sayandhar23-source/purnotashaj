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
}

export const StoreSettingsSchema = SchemaFactory.createForClass(StoreSettings);
