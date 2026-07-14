import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('newsletter')
export class NewsletterController {
  constructor(private newsletterService: NewsletterService) {}

  @Post('subscribe')
  subscribe(@Body('email') email: string) {
    return this.newsletterService.subscribe(email);
  }

  @Post('unsubscribe')
  unsubscribe(@Body('email') email: string) {
    return this.newsletterService.unsubscribe(email);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '50') {
    return this.newsletterService.findAll(Number(page), Number(limit));
  }
}
