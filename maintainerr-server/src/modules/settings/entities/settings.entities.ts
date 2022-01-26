import { CronExpression } from '@nestjs/schedule';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Settings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  Overseerr_url: string;

  @Column({ nullable: true })
  overseerr_api_key: string;

  @Column({ nullable: true })
  radarr_url: string;

  @Column({ nullable: true })
  radarr_api_key: string;

  @Column({ nullable: true })
  sonarr_url: string;

  @Column({ nullable: true })
  sonarr_api_key: string;

  @Column({ nullable: false, default: CronExpression.EVERY_12_HOURS })
  collection_handler_job_cron: string;

  @Column({ nullable: false, default: CronExpression.EVERY_8_HOURS })
  rules_handler_job_cron: string;
}
