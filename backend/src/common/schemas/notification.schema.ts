import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

// One row per (user, notification) — including admin broadcasts, which are
// fanned out into one row per recipient at send time. Simple to query ("all
// my notifications") and simple to track read/unread per user, and the
// recipient count for this store's scale doesn't make that fan-out costly.
@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    enum: ['order_confirmed', 'order_cancelled', 'price_drop', 'new_deal', 'general'],
    required: true,
  })
  type: string;

  @Prop()
  image?: string;

  @Prop({ enum: ['product', 'category', 'sale', 'none'], default: 'none' })
  linkType: string;

  @Prop()
  linkSlug?: string; // product or category slug — unused when linkType is 'sale' or 'none'

  @Prop({ default: false })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
