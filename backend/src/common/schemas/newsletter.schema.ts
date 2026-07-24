import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NewsletterDocument = NewsletterSubscriber & Document;

@Schema({ timestamps: true })
export class NewsletterSubscriber {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ default: true })
  isSubscribed: boolean;
}

export const NewsletterSchema = SchemaFactory.createForClass(NewsletterSubscriber);
