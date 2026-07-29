import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ enum: ['customer', 'admin'], default: 'customer' })
  role: string;

  // Referral program — code is auto-generated the first time the user opens
  // their Referrals tab, not at registration (keeps admin/system users clean).
  @Prop({ unique: true, sparse: true })
  referralCode?: string;

  @Prop({ default: 0 })
  referralBalance: number;

  @Prop()
  otpCodeHash?: string;

  @Prop()
  otpExpiresAt?: Date;

  @Prop()
  otpPurpose?: string; // 'register' | 'reset-password'

  @Prop()
  resetPasswordTokenHash?: string;

  @Prop()
  resetPasswordExpiresAt?: Date;

  @Prop()
  registrationIp?: string;

  @Prop()
  registrationLocation?: string; // city, region, country from geoip

  @Prop()
  lastLoginIp?: string;

  @Prop()
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
