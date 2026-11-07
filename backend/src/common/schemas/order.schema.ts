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

  // Sum of item prices before any combo discount
  @Prop({ default: 0 })
  subtotalAmount: number;

  // Combo discount applied at order creation (computed server-side, never trusted from the browser)
  @Prop({ default: 0 })
  discountAmount: number;

  // What the customer actually pays: subtotalAmount - discountAmount
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

  // The provider's ORDER/SESSION id (stripe session id / razorpay order id), set when
  // the payment is created. A payment is only accepted if it is for exactly this id.
  @Prop()
  paymentReference?: string;

  // The actual payment id once paid (razorpay payment id / stripe payment intent)
  @Prop()
  paymentId?: string;

  @Prop({ type: Object })
  shippingAddress?: Record<string, string>;

  // An order becomes eligible for confirmation once payment succeeds (status = 'paid').
  // Admin must explicitly confirm it — only then is the confirmation email sent to the customer.
  @Prop({ default: false })
  adminConfirmed: boolean;

  @Prop()
  confirmedAt?: Date;

  // Referral attribution — set at order creation time if a referral cookie was
  // active. Commission itself is only credited once the order is confirmed
  // (see ReferralsService), and reversed if the order is later cancelled.
  @Prop()
  referralCode?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  referralUserId?: Types.ObjectId;

  // Claimed atomically the first time referral commission is credited, so
  // confirming an order twice can never pay the referrer twice.
  @Prop({ default: false })
  referralCredited: boolean;

  // True once this order's items have been taken out of stock (done when
  // payment succeeds). Lets cancellation put them back exactly once.
  @Prop({ default: false })
  stockDeducted: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Hot paths: "my orders", the admin list/pending badge, and payment lookups.
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1, adminConfirmed: 1 });
OrderSchema.index({ paymentReference: 1 });
OrderSchema.index({ createdAt: -1 });
