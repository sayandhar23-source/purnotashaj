import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop()
  variantId?: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  variantName?: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  quantity: number;

  @Prop()
  image?: string;
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({
    enum: ['pending', 'paid', 'confirmed', 'shipped', 'delivered', 'cancelled', 'failed'],
    default: 'pending',
  })
  status: string;

  @Prop({ enum: ['stripe', 'razorpay'], required: true })
  paymentProvider: string;

  @Prop()
  paymentReference?: string; // stripe session id / razorpay order id

  @Prop({ type: Object })
  shippingAddress?: Record<string, string>;

  // An order becomes eligible for confirmation once payment succeeds (status = 'paid').
  // Admin must explicitly confirm it — only then is the confirmation email sent to the customer.
  @Prop({ default: false })
  adminConfirmed: boolean;

  @Prop()
  confirmedAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
