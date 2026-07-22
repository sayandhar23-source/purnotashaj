import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StoreSettingsDocument = StoreSettings & Document;

// Singleton document — only one of these ever exists. Holds store-wide settings
// that admins should be able to change at runtime without a redeploy.
@Schema({ timestamps: true })
export class StoreSettings {
  @Prop({ default: '' })
  whatsappNumber: string; // digits only, with country code, no + — e.g. 919999999999
}

export const StoreSettingsSchema = SchemaFactory.createForClass(StoreSettings);
