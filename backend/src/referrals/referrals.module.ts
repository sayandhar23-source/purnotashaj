import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReferralsService } from './referrals.service';
import { ReferralsController } from './referrals.controller';
import { User, UserSchema } from '../common/schemas/user.schema';
import { ReferralEarning, ReferralEarningSchema } from '../common/schemas/referral-earning.schema';
import {
  WithdrawalRequest,
  WithdrawalRequestSchema,
} from '../common/schemas/withdrawal-request.schema';
import { StoreSettings, StoreSettingsSchema } from '../common/schemas/store-settings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ReferralEarning.name, schema: ReferralEarningSchema },
      { name: WithdrawalRequest.name, schema: WithdrawalRequestSchema },
      { name: StoreSettings.name, schema: StoreSettingsSchema },
    ]),
  ],
  controllers: [ReferralsController],
  providers: [ReferralsService],
  exports: [ReferralsService],
})
export class ReferralsModule {}
