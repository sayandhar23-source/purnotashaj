import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SaleBannerContentDocument = SaleBannerContent & Document;

// Singleton document — text content for the homepage vector sale banner and the
// dedicated /sale page's own header. Admin-editable, no redeploy needed.
@Schema({ timestamps: true })
export class SaleBannerContent {
  @Prop({ default: 'Jagannath Rath Yatra Sale' })
  heroTitle: string;

  @Prop({ default: 'Blessed styles for the festive season — sarees, jewellery and more' })
  heroSubtitle: string;

  @Prop({ default: 'Shop the sale' })
  ctaText: string;

  @Prop({ default: 'Rath Yatra Sale' })
  pageTitle: string;

  @Prop({ default: 'Festive picks, blessed with a discount' })
  pageSubtitle: string;

  @Prop({ default: true })
  isActive: boolean; // turn the whole homepage banner off without deleting the content
}

export const SaleBannerContentSchema = SchemaFactory.createForClass(SaleBannerContent);
