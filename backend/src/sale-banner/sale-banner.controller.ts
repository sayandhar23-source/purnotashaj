import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SaleBannerService } from './sale-banner.service';
import { UpdateSaleBannerContentDto } from './dto/update-sale-banner-content.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('sale-banner')
export class SaleBannerController {
  constructor(private saleBannerService: SaleBannerService) {}

  // Public — the homepage and /sale page both need this to render their text.
  @Get()
  getContent() {
    return this.saleBannerService.getContent();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch()
  updateContent(@Body() dto: UpdateSaleBannerContentDto) {
    return this.saleBannerService.updateContent(dto);
  }
}
