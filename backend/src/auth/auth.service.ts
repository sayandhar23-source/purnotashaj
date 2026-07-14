import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { User, UserDocument } from '../common/schemas/user.schema';
import {
  RegistrationLog,
  RegistrationLogDocument,
} from '../common/schemas/registration-log.schema';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(RegistrationLog.name)
    private logModel: Model<RegistrationLogDocument>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  private signToken(user: UserDocument) {
    return this.jwtService.sign({
      sub: user._id,
      email: user.email,
      role: user.role,
    });
  }

  async register(dto: RegisterDto, ip: string, location: string) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing && existing.isVerified) {
      throw new ConflictException('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const otp = generateOtp();
    const otpCodeHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    let user: UserDocument;
    if (existing) {
      // Unverified user retrying registration — update details & resend OTP
      existing.name = dto.name;
      existing.passwordHash = passwordHash;
      existing.otpCodeHash = otpCodeHash;
      existing.otpExpiresAt = otpExpiresAt;
      existing.otpPurpose = 'register';
      existing.registrationIp = ip;
      existing.registrationLocation = location;
      user = await existing.save();
    } else {
      user = await this.userModel.create({
        name: dto.name,
        email: dto.email,
        passwordHash,
        isVerified: false,
        role: 'customer',
        otpCodeHash,
        otpExpiresAt,
        otpPurpose: 'register',
        registrationIp: ip,
        registrationLocation: location,
      });
    }

    await this.mailService.sendOtpEmail(dto.email, otp, 'register');

    return { message: 'OTP sent to your email. Please verify to complete registration.' };
  }

  async verifyOtp(dto: VerifyOtpDto, ip: string, userAgent: string) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user || !user.otpCodeHash || user.otpPurpose !== 'register') {
      throw new BadRequestException('No pending verification found for this email.');
    }
    if (user.otpExpiresAt && user.otpExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }
    const isValid = await bcrypt.compare(dto.code, user.otpCodeHash);
    if (!isValid) {
      throw new BadRequestException('Invalid OTP code.');
    }

    user.isVerified = true;
    user.otpCodeHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpPurpose = undefined;
    user.lastLoginIp = ip;
    user.lastLoginAt = new Date();
    await user.save();

    await this.logModel.create({
      user: user._id,
      email: user.email,
      ip,
      location: user.registrationLocation,
      userAgent,
    });

    const token = this.signToken(user);
    return {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    };
  }

  async resendOtp(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user || user.isVerified) {
      throw new BadRequestException('No pending verification found for this email.');
    }
    const otp = generateOtp();
    user.otpCodeHash = await bcrypt.hash(otp, 10);
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await this.mailService.sendOtpEmail(email, otp, 'register');
    return { message: 'OTP resent.' };
  }

  async login(dto: LoginDto, ip: string) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new UnauthorizedException('Invalid email or password.');
    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email before logging in.');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password.');

    user.lastLoginIp = ip;
    user.lastLoginAt = new Date();
    await user.save();

    const token = this.signToken(user);
    return {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    // Do not reveal whether the email exists
    if (!user) return { message: 'If that email exists, an OTP has been sent.' };

    const otp = generateOtp();
    user.otpCodeHash = await bcrypt.hash(otp, 10);
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.otpPurpose = 'reset-password';
    await user.save();

    await this.mailService.sendOtpEmail(dto.email, otp, 'reset-password');
    return { message: 'If that email exists, an OTP has been sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user || !user.otpCodeHash || user.otpPurpose !== 'reset-password') {
      throw new BadRequestException('Invalid or expired reset request.');
    }
    if (user.otpExpiresAt && user.otpExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }
    const valid = await bcrypt.compare(dto.code, user.otpCodeHash);
    if (!valid) throw new BadRequestException('Invalid OTP code.');

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    user.otpCodeHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpPurpose = undefined;
    await user.save();

    return { message: 'Password reset successfully. You can now log in.' };
  }
}
