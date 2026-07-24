import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BannerDocument = Banner & Document;

@Schema({ timestamps: true })
export class Banner {
  @Prop({ required: true })
  title: string;

  @Prop()
  subtitle?: string;

  @Prop({ required: true })
  desktopImage: string;

  @Prop({ required: true })
  mobileImage: string;

  @Prop()
  linkUrl?: string;

  @Prop()
  ctaText?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop()
  startsAt?: Date;

  @Prop()
  endsAt?: Date;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
