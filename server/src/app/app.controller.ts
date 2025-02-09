import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigResponse } from './dto/config-response.dto';
import { VersionResponse } from './dto/version-response.dto';

@Controller('/api/app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/status')
  async getAppStatus(): Promise<VersionResponse> {
    return this.appService.getAppVersionStatus();
  }

  @Get('/config')
  getConfig(): ConfigResponse {
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dataDirectory: process.env.DATA_DIR,
    };
  }
}
