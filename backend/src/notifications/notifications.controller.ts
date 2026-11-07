import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get('me')
  getMine(@CurrentUser() user: any) {
    return this.notificationsService.getMyNotifications(user.userId);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: any) {
    return this.notificationsService.getUnreadCount(user.userId);
  }

  @Patch(':id/read')
  markAsRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user.userId, id);
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.userId);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post('admin/send')
  sendBroadcast(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendBroadcast(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('admin/history')
  getBroadcastHistory() {
    return this.notificationsService.getBroadcastHistory();
  }
}
