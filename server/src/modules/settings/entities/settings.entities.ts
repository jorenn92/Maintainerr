import { CronExpression } from '@nestjs/schedule';
import { randomUUID } from 'crypto';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { SettingDto } from "../dto's/setting.dto";

@Entity()
export class Settings implements SettingDto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: String, nullable: true, default: randomUUID() })
  clientId: string | null;

  @Column({ nullable: false, default: 'Maintainerr' })
  applicationTitle: string;

  @Column({ nullable: false, default: 'localhost' })
  applicationUrl: string;

  @Column({ type: String, nullable: true })
  apikey: string | null;

  @Column({ type: String, nullable: true })
  overseerr_url: string | null;

  @Column({ nullable: false, default: 'en' })
  locale: string;

  @Column({ nullable: false, default: true })
  cacheImages: number;

  @Column({ type: String, nullable: true })
  plex_name: string | null;

  @Column({ type: String, nullable: true })
  plex_hostname: string | null;

  @Column({ type: Number, nullable: true, default: 32400 })
  plex_port: number | null;

  @Column({ type: Number, nullable: true })
  plex_ssl: number | null;

  @Column({ type: String, nullable: true })
  plex_auth_token: string | null;

  @Column({ type: String, nullable: true })
  overseerr_api_key: string | null;

  @Column({ type: String, nullable: true })
  tautulli_url: string | null;

  @Column({ type: String, nullable: true })
  tautulli_api_key: string | null;

  @Column({ type: String, nullable: true })
  jellyseerr_url: string | null;

  @Column({ type: String, nullable: true })
  jellyseerr_api_key: string | null;

  @Column({ nullable: false, default: CronExpression.EVERY_12_HOURS })
  collection_handler_job_cron: string;

  @Column({ nullable: false, default: CronExpression.EVERY_8_HOURS })
  rules_handler_job_cron: string;
}
