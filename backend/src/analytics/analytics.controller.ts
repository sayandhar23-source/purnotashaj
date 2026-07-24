import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('summary')
  summary() {
    return this.analyticsService.summary();
  }

  @Get('range')
  range(@Query('start') start: string, @Query('end') end: string) {
    return this.analyticsService.range(start, end);
  }

  // period=week|month|year|custom
  // for custom: aStart, aEnd, bStart, bEnd
  @Get('compare')
  compare(
    @Query('period') period: 'week' | 'month' | 'year' | 'custom',
    @Query('aStart') aStart?: string,
    @Query('aEnd') aEnd?: string,
    @Query('bStart') bStart?: string,
    @Query('bEnd') bEnd?: string,
  ) {
    const customA = aStart && aEnd ? { start: aStart, end: aEnd } : undefined;
    const customB = bStart && bEnd ? { start: bStart, end: bEnd } : undefined;
    return this.analyticsService.compare(period, customA, customB);
  }
}
