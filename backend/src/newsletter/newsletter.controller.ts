import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RateLimit } from '../common/throttle/rate-limit';
import { EmailDto } from './dto-email';
import { clampLimit, clampPage } from '../common/utils/pagination';

@Controller('newsletter')
export class NewsletterController {
  constructor(private newsletterService: NewsletterService) {}

  @RateLimit(6)
  @Post('subscribe')
  subscribe(@Body() dto: EmailDto) {
    return this.newsletterService.subscribe(dto.email);
  }

  @RateLimit(6)
  @Post('unsubscribe')
  unsubscribe(@Body() dto: EmailDto) {
    return this.newsletterService.unsubscribe(dto.email);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '50') {
    return this.newsletterService.findAll(clampPage(page), clampLimit(limit, 50, 200));
  }
}
