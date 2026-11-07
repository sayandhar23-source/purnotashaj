import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { RateLimit } from '../common/throttle/rate-limit';
import { getClientIp, getLocationFromIp } from '../common/utils/ip.util';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @RateLimit(6)
  @Post('register')
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    const ip = getClientIp(req);
    const location = getLocationFromIp(ip);
    return this.authService.register(dto, ip, location);
  }

  @RateLimit(12)
  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto, @Req() req: Request) {
    const ip = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';
    return this.authService.verifyOtp(dto, ip, userAgent);
  }

  @RateLimit(4)
  @Post('resend-otp')
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto.email);
  }

  @RateLimit(12)
  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    const ip = getClientIp(req);
    return this.authService.login(dto, ip);
  }

  @RateLimit(4)
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @RateLimit(10)
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
