import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../common/schemas/user.schema';
import { Order, OrderDocument } from '../common/schemas/order.schema';
import { secureCode } from '../common/utils/crypto.util';
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

// Not a secret, but there's no reason for codes to be predictable
const randomCode = (length = 6) => secureCode(length);

@Injectable()
export class ReferralsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
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
      .sort({ createdAt: -1 })
      .limit(200);
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
  // The credit is claimed with an atomic flag on the order, so no matter how many
  // times (or how simultaneously) this is called, the referrer is paid once.
  async creditCommission(order: OrderDocument) {
    if (!order.referralUserId) return;

    const claimed = await this.orderModel.findOneAndUpdate(
      { _id: order._id, referralCredited: { $ne: true } },
      { $set: { referralCredited: true } },
    );
    if (!claimed) return; // already credited

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
  // Flipping confirmed -> reversed is the atomic claim, so it can only happen once.
  async reverseCommission(orderId: string) {
    const earning = await this.earningModel.findOneAndUpdate(
      { order: orderId, status: 'confirmed' },
      { $set: { status: 'reversed' } },
      { new: true },
    );
    if (!earning) return;

    await this.userModel.findByIdAndUpdate(earning.referrerUser, {
      $inc: { referralBalance: -earning.commissionAmount },
    });
  }

  async requestWithdrawal(userId: string, dto: WithdrawDto) {
    if (dto.method === 'upi' && !dto.upiId) {
      throw new BadRequestException('UPI ID is required for UPI withdrawals.');
    }
    if (dto.method === 'bank' && (!dto.bankAccountName || !dto.bankAccountNumber || !dto.bankIfsc)) {
      throw new BadRequestException('Full bank details are required for bank withdrawals.');
    }

    // Check-and-deduct in ONE atomic step. It used to read the balance, compare, then
    // write "balance - amount" back — so two requests sent at the same moment both
    // saw the full balance, both passed, and both paid out (a double-spend).
    const user = await this.userModel.findOneAndUpdate(
      { _id: userId, referralBalance: { $gte: dto.amount } },
      { $inc: { referralBalance: -dto.amount } },
      { new: true },
    );
    if (!user) {
      throw new BadRequestException('Withdrawal amount exceeds your available balance.');
    }

    try {
      return await this.withdrawalModel.create({ user: userId, ...dto });
    } catch (err) {
      // The request couldn't be recorded — give the money back rather than lose it
      await this.userModel.updateOne({ _id: userId }, { $inc: { referralBalance: dto.amount } });
      throw err;
    }
  }

  getMyWithdrawals(userId: string) {
    return this.withdrawalModel.find({ user: userId }).sort({ createdAt: -1 }).limit(200);
  }

  // Admin
  getAllWithdrawals() {
    return this.withdrawalModel.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(500);
  }

  async updateWithdrawal(id: string, dto: UpdateWithdrawalDto) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Withdrawal request not found');

    // Only a still-pending request can be processed, and the status change is the
    // atomic claim — two admins (or a double-click) can't both process one request,
    // which would have refunded a rejected withdrawal twice.
    const update: any = { status: dto.status };
    if (dto.adminNote) update.adminNote = dto.adminNote;
    if (dto.status === 'paid') update.paidAt = new Date();

    const withdrawal = await this.withdrawalModel.findOneAndUpdate(
      { _id: id, status: 'pending' },
      { $set: update },
      { new: true },
    );
    if (!withdrawal) {
      const exists = await this.withdrawalModel.exists({ _id: id });
      if (!exists) throw new NotFoundException('Withdrawal request not found');
      throw new BadRequestException('This withdrawal request has already been processed.');
    }

    // Rejected withdrawals return the amount to the user's balance
    if (dto.status === 'rejected') {
      await this.userModel.findByIdAndUpdate(withdrawal.user, {
        $inc: { referralBalance: withdrawal.amount },
      });
    }

    return withdrawal;
  }
}
