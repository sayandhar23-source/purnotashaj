import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationBroadcastDocument = NotificationBroadcast & Document;

// A lightweight log of each admin "send" action, purely for the admin's own
// history view — separate from the fanned-out per-user Notification rows,
// so the history list shows one entry per broadcast, not one per recipient.
@Schema({ timestamps: true })
export class NotificationBroadcast {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  type: string;

  @Prop()
  image?: string;

  @Prop({ default: 'none' })
  linkType: string;

  @Prop()
  linkSlug?: string;

  @Prop({ required: true })
  recipientCount: number;
}

export const NotificationBroadcastSchema = SchemaFactory.createForClass(NotificationBroadcast);
