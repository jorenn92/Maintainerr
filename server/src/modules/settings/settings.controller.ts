import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { SettingDto } from "./dto's/setting.dto";
import { SettingsService } from './settings.service';

@Controller('/api/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }
  @Get('/api/generate')
  generateApiKey() {
    return this.settingsService.generateApiKey();
  }

  @Delete('/plex/auth')
  deletePlexApiAuth() {
    return this.settingsService.deletePlexApiAuth();
  }
  @Post()
  updateSettings(@Body() payload: SettingDto) {
    return this.settingsService.updateSettings(payload);
  }
}
