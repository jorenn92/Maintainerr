import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTorrentsSettings1755483905439 implements MigrationInterface {
  name = 'AddTorrentsSettings1755483905439';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE settings ADD COLUMN "torrents_service" varchar',
    );
    await queryRunner.query(
      'ALTER TABLE settings ADD COLUMN "torrents_url" varchar',
    );
    await queryRunner.query(
      'ALTER TABLE settings ADD COLUMN "torrents_username" varchar',
    );
    await queryRunner.query(
      'ALTER TABLE settings ADD COLUMN "torrents_password" varchar',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE settings DROP "torrents_service"`);
    await queryRunner.query(`ALTER TABLE settings DROP "torrents_url"`);
    await queryRunner.query(`ALTER TABLE settings DROP "torrents_username"`);
    await queryRunner.query(`ALTER TABLE settings DROP "torrents_password"`);
  }
}
