import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { WithdrawDto, UpdateWithdrawalDto } from './dto/withdraw.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('referrals')
export class ReferralsController {
  constructor(private referralsService: ReferralsService) {}

  @Get('me')
  getMe(@CurrentUser() user: any) {
    return this.referralsService.getMe(user.userId);
  }

  @Get('earnings')
  getEarnings(@CurrentUser() user: any) {
    return this.referralsService.getEarnings(user.userId);
  }

  @Post('withdraw')
  requestWithdrawal(@CurrentUser() user: any, @Body() dto: WithdrawDto) {
    return this.referralsService.requestWithdrawal(user.userId, dto);
  }

  @Get('withdrawals')
  getMyWithdrawals(@CurrentUser() user: any) {
    return this.referralsService.getMyWithdrawals(user.userId);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('admin/withdrawals')
  getAllWithdrawals() {
    return this.referralsService.getAllWithdrawals();
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch('admin/withdrawals/:id')
  updateWithdrawal(@Param('id') id: string, @Body() dto: UpdateWithdrawalDto) {
    return this.referralsService.updateWithdrawal(id, dto);
  }
}
