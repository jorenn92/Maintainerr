import { Body, Controller, Get, Post } from '@nestjs/common';
import { SettingDto } from "./dto's/setting.dto";
import { SettingsService } from './settings.service';

@Controller('/api/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }
  @Post()
  updateSettings(@Body() payload: SettingDto) {
    return this.settingsService.updateSettings(payload);
  }
}
