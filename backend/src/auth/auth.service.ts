import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
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
import { secureOtp } from '../common/utils/crypto.util';

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
// After this many wrong guesses the code is destroyed. Without a cap, a 6-digit
// code (1,000,000 possibilities) could be brute-forced inside its 10-minute life.
const MAX_OTP_ATTEMPTS = 5;
// Compared against when the email isn't registered, so "no such account" takes
// as long to reject as "wrong password" — otherwise response time reveals which
// emails have accounts.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

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


  private onCooldown(user: UserDocument): boolean {
    return !!user.otpSentAt && Date.now() - user.otpSentAt.getTime() < OTP_RESEND_COOLDOWN_MS;
  }

  // Generates a fresh OTP, stores only its hash, and resets the attempt counter.
  private async issueOtp(user: UserDocument, purpose: 'register' | 'reset-password'): Promise<string> {
    const otp = secureOtp();
    user.otpCodeHash = await bcrypt.hash(otp, 10);
    user.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
    user.otpPurpose = purpose;
    user.otpAttempts = 0;
    user.otpSentAt = new Date();
    await user.save();
    return otp;
  }

  private async burnOtp(user: UserDocument) {
    // Conditional on the hash so a freshly re-issued code is never destroyed by a stale request
    await this.userModel.updateOne(
      { _id: user._id, otpCodeHash: user.otpCodeHash },
      { $unset: { otpCodeHash: 1, otpExpiresAt: 1, otpPurpose: 1 }, $set: { otpAttempts: 0 } },
    );
  }

  // Checks an OTP. The attempt is claimed with an atomic conditional increment
  // BEFORE the comparison — so even 100 simultaneous guesses can only ever get
  // MAX_OTP_ATTEMPTS comparisons in, no matter how they interleave.
  private async checkOtp(email: string, code: string, purpose: 'register' | 'reset-password'): Promise<UserDocument> {
    const noPending =
      purpose === 'register'
        ? 'No pending verification found for this email.'
        : 'Invalid or expired reset request.';

    const user = await this.userModel.findOne({ email });
    if (!user || !user.otpCodeHash || user.otpPurpose !== purpose) {
      throw new BadRequestException(noPending);
    }
    if (user.otpExpiresAt && user.otpExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    const claimed = await this.userModel.findOneAndUpdate(
      { _id: user._id, otpCodeHash: user.otpCodeHash, otpAttempts: { $lt: MAX_OTP_ATTEMPTS } },
      { $inc: { otpAttempts: 1 } },
      { new: true },
    );
    if (!claimed) {
      await this.burnOtp(user);
      throw new BadRequestException('Too many incorrect attempts. Please request a new code.');
    }

    const valid = await bcrypt.compare(code, user.otpCodeHash);
    if (!valid) {
      if ((claimed.otpAttempts ?? 0) >= MAX_OTP_ATTEMPTS) {
        await this.burnOtp(user);
        throw new BadRequestException('Too many incorrect attempts. Please request a new code.');
      }
      throw new BadRequestException('Invalid OTP code.');
    }
    return claimed;
  }

  private tooSoon() {
    return new HttpException('Please wait a minute before requesting another code.', HttpStatus.TOO_MANY_REQUESTS);
  }

  async register(dto: RegisterDto, ip: string, location: string) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing && existing.isVerified) {
      throw new ConflictException('An account with this email already exists.');
    }
    if (existing && this.onCooldown(existing)) throw this.tooSoon();

    const passwordHash = await bcrypt.hash(dto.password, 10);

    let user: UserDocument;
    if (existing) {
      // Unverified user retrying registration — update details & resend OTP
      existing.name = dto.name;
      existing.passwordHash = passwordHash;
      existing.registrationIp = ip;
      existing.registrationLocation = location;
      user = existing;
    } else {
      user = new this.userModel({
        name: dto.name,
        email: dto.email,
        passwordHash,
        isVerified: false,
        role: 'customer',
        registrationIp: ip,
        registrationLocation: location,
      });
    }
    const otp = await this.issueOtp(user, 'register');

    await this.mailService.sendOtpEmail(dto.email, otp, 'register');

    return { message: 'OTP sent to your email. Please verify to complete registration.' };
  }

  async verifyOtp(dto: VerifyOtpDto, ip: string, userAgent: string) {
    const user = await this.checkOtp(dto.email, dto.code, 'register');

    user.isVerified = true;
    user.otpCodeHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpPurpose = undefined;
    user.otpAttempts = 0;
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

    // Fire-and-forget — a failed welcome email should never block registration,
    // the account is already created and verified at this point either way.
    this.mailService.sendWelcomeEmail(user.email, user.name).catch(() => {});

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
    if (this.onCooldown(user)) throw this.tooSoon();
    const otp = await this.issueOtp(user, 'register');
    await this.mailService.sendOtpEmail(email, otp, 'register');
    return { message: 'OTP resent.' };
  }

  async login(dto: LoginDto, ip: string) {
    const user = await this.userModel.findOne({ email: dto.email });
    // Always run one bcrypt comparison — even for unknown emails — so timing
    // doesn't reveal whether the account exists. The password is also checked
    // BEFORE the verified-status, so "please verify your email" is only ever
    // shown to someone who actually knows the password.
    const valid = await bcrypt.compare(dto.password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !valid) throw new UnauthorizedException('Invalid email or password.');
    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email before logging in.');
    }

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
    const generic = { message: 'If that email exists, an OTP has been sent.' };
    const user = await this.userModel.findOne({ email: dto.email });
    // Unknown, unverified, or still on cooldown: same response, nothing sent —
    // so this endpoint reveals nothing and can't be used to flood an inbox.
    if (!user || !user.isVerified || this.onCooldown(user)) return generic;

    const otp = await this.issueOtp(user, 'reset-password');
    await this.mailService.sendOtpEmail(dto.email, otp, 'reset-password');
    return generic;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.checkOtp(dto.email, dto.code, 'reset-password');

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    // Invalidates every login token issued before this moment (see JwtStrategy)
    user.passwordChangedAt = new Date();
    user.otpCodeHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpPurpose = undefined;
    user.otpAttempts = 0;
    await user.save();

    return { message: 'Password reset successfully. You can now log in.' };
  }
}
