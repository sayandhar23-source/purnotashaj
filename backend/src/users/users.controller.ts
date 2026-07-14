import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  ChangeEmailDto,
  ChangePasswordDto,
  UpdateProfileDto,
} from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/email')
  changeEmail(@CurrentUser() user: any, @Body() dto: ChangeEmailDto) {
    return this.usersService.changeEmail(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.userId, dto);
  }

  // Admin only — list all registered users
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  listUsers(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.usersService.listUsers(Number(page), Number(limit));
  }
}
