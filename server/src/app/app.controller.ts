import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('/api/app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/status')
  async getAppStatus() {
    return JSON.stringify(await this.appService.getAppVersionStatus());
  }

  @Get('/timezone')
  async getAppTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
}
