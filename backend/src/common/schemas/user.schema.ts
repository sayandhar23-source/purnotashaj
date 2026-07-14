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
