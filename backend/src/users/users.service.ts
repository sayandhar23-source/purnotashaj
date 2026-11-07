import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { clampLimit, clampPage } from '../common/utils/pagination';

import { User, UserDocument } from '../common/schemas/user.schema';
import {
  ChangeEmailDto,
  ChangePasswordDto,
  UpdateProfileDto,
} from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-passwordHash -otpCodeHash -otpAttempts -otpSentAt -otpPurpose -otpExpiresAt');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: dto },
      { new: true },
    ).select('-passwordHash -otpCodeHash -otpAttempts -otpSentAt -otpPurpose -otpExpiresAt');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async changeEmail(userId: string, dto: ChangeEmailDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('Current password is incorrect.');

    const existing = await this.userModel.findOne({ email: dto.newEmail });
    if (existing) throw new ConflictException('Email already in use.');

    user.email = dto.newEmail;
    await user.save();
    return { message: 'Email updated successfully.' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('Current password is incorrect.');

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    // Signs out every other device/session (including a thief's) — see JwtStrategy
    user.passwordChangedAt = new Date();
    await user.save();
    return { message: 'Password updated successfully.' };
  }

  // Admin: list all registered users with pagination
  async listUsers(rawPage: unknown = 1, rawLimit: unknown = 20) {
    const page = clampPage(rawPage);
    const limit = clampLimit(rawLimit, 20, 100);
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userModel
        .find()
        .select('-passwordHash -otpCodeHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(),
    ]);
    return { users, total, page, pages: Math.ceil(total / limit) };
  }
}
