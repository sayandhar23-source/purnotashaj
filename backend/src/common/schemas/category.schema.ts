import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string; // Clothing, Jewellery, Ornaments, Makeup

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  image?: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive: boolean;

  // If set, this category is a subcategory of another (e.g. "T-Shirts" under "Clothing")
  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parent?: Types.ObjectId | null;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
