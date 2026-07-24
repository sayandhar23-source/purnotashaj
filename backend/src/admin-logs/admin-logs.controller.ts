import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminLogsService } from './admin-logs.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/registration-logs')
export class AdminLogsController {
  constructor(private service: AdminLogsService) {}

  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '50') {
    return this.service.findAll(Number(page), Number(limit));
  }
}
