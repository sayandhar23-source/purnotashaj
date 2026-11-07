import { Body, Controller, Get, Header, Patch, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  // Public — the storefront needs this (WhatsApp links, social links, combo tiers, divider).
  // Deliberately excludes admin-only values such as the Telegram chat id.
  @Header('Cache-Control', 'public, max-age=30')
  @Get()
  getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  // Admin settings screen: the complete document, uncached
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin')
  getAdminSettings() {
    return this.settingsService.getSettings();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch()
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(dto);
  }
}
