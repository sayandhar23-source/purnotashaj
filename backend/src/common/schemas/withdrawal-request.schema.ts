import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WithdrawalRequestDocument = WithdrawalRequest & Document;

@Schema({ timestamps: true })
export class WithdrawalRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ enum: ['upi', 'bank'], required: true })
  method: string;

  @Prop()
  upiId?: string;

  @Prop()
  bankAccountName?: string;

  @Prop()
  bankAccountNumber?: string;

  @Prop()
  bankIfsc?: string;

  @Prop({ enum: ['pending', 'paid', 'rejected'], default: 'pending' })
  status: string;

  @Prop()
  adminNote?: string;

  @Prop()
  paidAt?: Date;
}

export const WithdrawalRequestSchema = SchemaFactory.createForClass(WithdrawalRequest);
