import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatMessageDocument = ChatMessage & Document;

@Schema({ timestamps: true })
export class ChatMessage {
  // A per-browser id (generated client-side, stored in localStorage) that ties
  // a visitor's messages together into one conversation — no login required.
  @Prop({ required: true, index: true })
  sessionId: string;

  @Prop({ enum: ['customer', 'admin'], required: true })
  sender: string;

  @Prop({ required: true })
  text: string;

  @Prop()
  customerName?: string;

  // The Telegram message id this was sent/received as, used to match an
  // admin's reply (via Telegram's native "reply to" feature) back to the
  // right conversation.
  @Prop()
  telegramMessageId?: number;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
