import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { getClientIp, getLocationFromIp } from '../common/utils/ip.util';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    const ip = getClientIp(req);
    const location = getLocationFromIp(ip);
    return this.authService.register(dto, ip, location);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto, @Req() req: Request) {
    const ip = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';
    return this.authService.verifyOtp(dto, ip, userAgent);
  }

  @Post('resend-otp')
  resendOtp(@Body('email') email: string) {
    return this.authService.resendOtp(email);
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    const ip = getClientIp(req);
    return this.authService.login(dto, ip);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
