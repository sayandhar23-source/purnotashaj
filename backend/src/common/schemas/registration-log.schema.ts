import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RegistrationLogDocument = RegistrationLog & Document;

@Schema({ timestamps: true })
export class RegistrationLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  ip: string;

  @Prop()
  location?: string; // "City, Region, Country"

  @Prop()
  userAgent?: string;
}

export const RegistrationLogSchema = SchemaFactory.createForClass(RegistrationLog);
