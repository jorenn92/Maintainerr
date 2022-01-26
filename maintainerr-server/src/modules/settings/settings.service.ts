import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './entities/settings.entities';

@Injectable()
export class SettingsService implements OnModuleInit {
  id: number;

  Overseerr_url: string;

  overseerr_api_key: string;

  radarr_url: string;

  radarr_api_key: string;

  sonarr_url: string;

  sonarr_api_key: string;

  collection_handler_job_cron: string;

  rules_handler_job_cron: string;

  constructor(
    @InjectRepository(Settings)
    private readonly settings: Repository<Settings>,
  ) {}

  onModuleInit() {
    this.init();
  }
  public async init() {
    const settingsDb = await this.settings.findOne();
    if (settingsDb) {
      this.id = settingsDb?.id;
      this.Overseerr_url = settingsDb?.Overseerr_url;
      this.overseerr_api_key = settingsDb?.overseerr_api_key;
      this.radarr_url = settingsDb?.radarr_url;
      this.radarr_api_key = settingsDb?.radarr_api_key;
      this.sonarr_url = settingsDb?.sonarr_url;
      this.sonarr_api_key = settingsDb?.sonarr_api_key;
      this.collection_handler_job_cron =
        settingsDb?.collection_handler_job_cron;
      this.rules_handler_job_cron = settingsDb?.rules_handler_job_cron;
    } else {
      await this.settings.insert({});
      this.init();
    }
  }
}
