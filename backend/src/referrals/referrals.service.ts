import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../common/schemas/user.schema';
import { OrderDocument } from '../common/schemas/order.schema';
import {
  ReferralEarning,
  ReferralEarningDocument,
} from '../common/schemas/referral-earning.schema';
import {
  WithdrawalRequest,
  WithdrawalRequestDocument,
} from '../common/schemas/withdrawal-request.schema';
import { StoreSettings, StoreSettingsDocument } from '../common/schemas/store-settings.schema';
import { WithdrawDto, UpdateWithdrawalDto } from './dto/withdraw.dto';

function randomCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous O/0/I/1
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

@Injectable()
export class ReferralsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(ReferralEarning.name) private earningModel: Model<ReferralEarningDocument>,
    @InjectModel(WithdrawalRequest.name) private withdrawalModel: Model<WithdrawalRequestDocument>,
    @InjectModel(StoreSettings.name) private settingsModel: Model<StoreSettingsDocument>,
  ) {}

  // Creates a referral code for this user the first time they need one —
  // not done at registration, so admin/system accounts never get one unless
  // they actually open the Referrals tab themselves.
  async getOrCreateCode(userId: string): Promise<string> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.referralCode) return user.referralCode;

    let code: string;
    let attempts = 0;
    do {
      code = randomCode();
      attempts++;
    } while ((await this.userModel.exists({ referralCode: code })) && attempts < 10);

    user.referralCode = code;
    await user.save();
    return code;
  }

  async getMe(userId: string) {
    const code = await this.getOrCreateCode(userId);
    const user = await this.userModel.findById(userId).select('referralBalance');
    const [totalEarned, pendingWithdrawalAmount] = await Promise.all([
      this.earningModel.aggregate([
        { $match: { referrerUser: new Types.ObjectId(userId), status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$commissionAmount' } } },
      ]),
      this.withdrawalModel.aggregate([
        { $match: { user: new Types.ObjectId(userId), status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    return {
      referralCode: code,
      balance: user?.referralBalance || 0,
      totalEarned: totalEarned[0]?.total || 0,
      pendingWithdrawalAmount: pendingWithdrawalAmount[0]?.total || 0,
    };
  }

  getEarnings(userId: string) {
    return this.earningModel
      .find({ referrerUser: userId })
      .populate('order', 'totalAmount status createdAt')
      .sort({ createdAt: -1 });
  }

  // Called from OrdersService when a new order is created. Validates the
  // referral code, blocks self-referral, and returns the referrer's id (or
  // null if the code is missing/invalid) — the order just stores this,
  // no money moves yet.
  async resolveReferrer(code: string | undefined, buyerId: string): Promise<Types.ObjectId | null> {
    if (!code) return null;
    const referrer = await this.userModel.findOne({ referralCode: code });
    if (!referrer) return null;
    if (referrer._id.toString() === buyerId.toString()) return null; // no self-referral
    return referrer._id as Types.ObjectId;
  }

  // Called from OrdersService.confirmOrder — this is the moment commission
  // actually gets credited, not at order creation or payment.
  async creditCommission(order: OrderDocument) {
    if (!order.referralUserId) return;

    const settings = await this.settingsModel.findOne();
    const percent = settings?.referralCommissionPercent ?? 10;
    const commissionAmount = Math.round((order.totalAmount * percent) / 100);

    await this.earningModel.create({
      referrerUser: order.referralUserId,
      order: order._id,
      orderTotal: order.totalAmount,
      commissionPercent: percent,
      commissionAmount,
      status: 'confirmed',
    });

    await this.userModel.findByIdAndUpdate(order.referralUserId, {
      $inc: { referralBalance: commissionAmount },
    });
  }

  // Called from OrdersService.updateStatus when an order moves to
  // cancelled/failed — reverses any commission already credited for it.
  async reverseCommission(orderId: string) {
    const earning = await this.earningModel.findOne({ order: orderId, status: 'confirmed' });
    if (!earning) return;

    earning.status = 'reversed';
    await earning.save();

    await this.userModel.findByIdAndUpdate(earning.referrerUser, {
      $inc: { referralBalance: -earning.commissionAmount },
    });
  }

  async requestWithdrawal(userId: string, dto: WithdrawDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (dto.amount > (user.referralBalance || 0)) {
      throw new BadRequestException('Withdrawal amount exceeds your available balance.');
    }
    if (dto.method === 'upi' && !dto.upiId) {
      throw new BadRequestException('UPI ID is required for UPI withdrawals.');
    }
    if (dto.method === 'bank' && (!dto.bankAccountName || !dto.bankAccountNumber || !dto.bankIfsc)) {
      throw new BadRequestException('Full bank details are required for bank withdrawals.');
    }

    // Deduct immediately so the same balance can't be requested twice while
    // pending — if rejected, it's added back (see updateWithdrawal below).
    user.referralBalance -= dto.amount;
    await user.save();

    return this.withdrawalModel.create({ user: userId, ...dto });
  }

  getMyWithdrawals(userId: string) {
    return this.withdrawalModel.find({ user: userId }).sort({ createdAt: -1 });
  }

  // Admin
  getAllWithdrawals() {
    return this.withdrawalModel.find().populate('user', 'name email').sort({ createdAt: -1 });
  }

  async updateWithdrawal(id: string, dto: UpdateWithdrawalDto) {
    const withdrawal = await this.withdrawalModel.findById(id);
    if (!withdrawal) throw new NotFoundException('Withdrawal request not found');
    if (withdrawal.status !== 'pending') {
      throw new BadRequestException('This withdrawal request has already been processed.');
    }

    withdrawal.status = dto.status;
    if (dto.adminNote) withdrawal.adminNote = dto.adminNote;
    if (dto.status === 'paid') withdrawal.paidAt = new Date();
    await withdrawal.save();

    // Rejected withdrawals return the amount to the user's balance
    if (dto.status === 'rejected') {
      await this.userModel.findByIdAndUpdate(withdrawal.user, {
        $inc: { referralBalance: withdrawal.amount },
      });
    }

    return withdrawal;
  }
}
