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

  // Wrong guesses against the current OTP. After a handful the code is
  // thrown away — a 6-digit code is only safe if guessing is limited.
  @Prop({ default: 0 })
  otpAttempts: number;

  // When the last OTP email went out — used for a resend cooldown so the
  // OTP endpoints can't be used to flood someone's inbox (or burn the email quota).
  @Prop()
  otpSentAt?: Date;

  // Any login token issued before this moment is rejected. Set on password
  // change/reset so a stolen session stops working when the owner changes password.
  @Prop()
  passwordChangedAt?: Date;

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
