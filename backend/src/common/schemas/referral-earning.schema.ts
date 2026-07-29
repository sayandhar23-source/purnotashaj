import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReferralEarningDocument = ReferralEarning & Document;

// One row per commission event — a proper ledger rather than just a running
// balance, so both admin and the referrer can see exactly which order each
// rupee came from, and reversals (from cancelled orders) are auditable.
@Schema({ timestamps: true })
export class ReferralEarning {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  referrerUser: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  order: Types.ObjectId;

  @Prop({ required: true })
  orderTotal: number;

  @Prop({ required: true })
  commissionPercent: number;

  @Prop({ required: true })
  commissionAmount: number;

  @Prop({ enum: ['confirmed', 'reversed'], default: 'confirmed' })
  status: string;
}

export const ReferralEarningSchema = SchemaFactory.createForClass(ReferralEarning);
