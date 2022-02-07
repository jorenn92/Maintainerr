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
            name: 'clientId',
            type: 'varchar',
          },
          {
            name: 'applicationTitle',
            type: 'varchar',
          },
          {
            name: 'applicationUrl',
            type: 'varchar',
          },
          {
            name: 'apikey',
            type: 'varchar',
          },
          {
            name: 'locale',
            type: 'varchar',
          },
          {
            name: 'cacheImages',
            type: 'integer',
          },
          {
            name: 'plex_name',
            type: 'varchar',
          },
          {
            name: 'plex_hostname',
            type: 'varchar',
          },
          {
            name: 'plex_port',
            type: 'integer',
          },
          {
            name: 'plex_ssl',
            type: 'integer',
          },
          {
            name: 'plex_auth_token',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'overseerr_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'overseerr_api_key',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'radarr_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'radarr_api_key',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'sonarr_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'sonarr_api_key',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'collection_handler_job_cron',
            type: 'varchar',
            default: `'${CronExpression.EVERY_12_HOURS}'`,
          },
          {
            name: 'rules_handler_job_cron',
            type: 'varchar',
            default: `'${CronExpression.EVERY_8_HOURS}'`,
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
