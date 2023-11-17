import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { SettingDto } from "./dto's/setting.dto";
import { SettingsService } from './settings.service';
import { CronScheduleDto } from "./dto's/cron.schedule.dto";

@Controller('/api/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }
  @Get('/version')
  getVersion() {
    return this.settingsService.appVersion();
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
  @Get('/test/setup')
  testSetup() {
    return this.settingsService.testSetup();
  }
  @Get('/test/overseerr')
  testOverseerr() {
    return this.settingsService.testOverseerr();
  }
  @Get('/test/radarr')
  testRadarr() {
    return this.settingsService.testRadarr();
  }
  @Get('/test/sonarr')
  testSonarr() {
    return this.settingsService.testSonarr();
  }
  @Get('/test/plex')
  testPlex() {
    return this.settingsService.testPlex();
  }

  @Post('/cron/validate')
  validateSingleCron(@Body() payload: CronScheduleDto) {
    return this.settingsService.cronIsValid(payload.schedule)
      ? { status: 'OK', code: 1, message: 'Success' }
      : { status: 'NOK', code: 0, message: 'Failure' };
  }
}
