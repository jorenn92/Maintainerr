import { CronExpression } from '@nestjs/schedule';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSettingsTable1643209754541 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'settings',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
          },
          {
            name: 'overseerr_url',
            type: 'string',
            isNullable: true,
          },
          {
            name: 'overseerr_api_key',
            type: 'string',
            isNullable: true,
          },
          {
            name: 'radarr_url',
            type: 'string',
            isNullable: true,
          },
          {
            name: 'radarr_api_key',
            type: 'string',
            isNullable: true,
          },
          {
            name: 'sonarr_url',
            type: 'string',
            isNullable: true,
          },
          {
            name: 'sonarr_api_key',
            type: 'string',
            isNullable: true,
          },
          {
            name: 'collection_handler_job_cron',
            type: 'string',
            default: CronExpression.EVERY_12_HOURS,
          },
          {
            name: 'rules_handler_job_cron',
            type: 'string',
            default: CronExpression.EVERY_8_HOURS,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('settings');
  }
}
