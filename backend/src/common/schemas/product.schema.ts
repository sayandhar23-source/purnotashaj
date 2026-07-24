import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ _id: true })
export class ProductVariant {
  @Prop({ required: true })
  name: string; // e.g. "Small / Gold", "Red - M"

  @Prop({ type: Object, default: {} })
  attributes: Record<string, string>; // { size: 'M', color: 'Red' }

  @Prop({ required: true })
  price: number;

  @Prop()
  compareAtPrice?: number;

  @Prop({ default: 0 })
  stock: number;

  @Prop()
  sku?: string;

  @Prop()
  image?: string;
}

export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  images: string[];

  // A product demo video — either a YouTube link (recommended: upload as
  // "Unlisted") or a direct link to an MP4/WebM file from a proper video host.
  // Google Drive links do NOT work reliably for video — see docs.
  @Prop()
  videoUrl?: string;

  @Prop({ required: true })
  basePrice: number;

  @Prop()
  compareAtPrice?: number;

  // Auto-generated if not provided — used when the product has no variants
  @Prop()
  sku?: string;

  @Prop({ type: [ProductVariantSchema], default: [] })
  variants: ProductVariant[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  // Merchandising flags — control which homepage sections a product appears in.
  // Set from the admin product form; each is independent (a product can be in more than one).
  @Prop({ default: false })
  isNewArrival: boolean;

  @Prop({ default: false })
  isBestSeller: boolean;

  @Prop({ default: false })
  isHotDeal: boolean;

  // Shows this product on the dedicated /sale page, independent of its category's
  // own showOnSalePage flag (either one is enough to include it there).
  @Prop({ default: false })
  showOnSalePage: boolean;

  // Per-product flash sale: a discounted price active for a specific time window,
  // toggled on/off from the admin product form. The discount percentage and
  // remaining time are computed at read-time, not stored.
  @Prop({ default: false })
  saleEnabled: boolean;

  @Prop()
  salePrice?: number;

  @Prop()
  saleStartsAt?: Date;

  @Prop()
  saleEndsAt?: Date;

  @Prop({ default: 0 })
  totalStock: number;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
