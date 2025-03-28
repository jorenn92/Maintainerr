import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTorrentsSettings1755483905439 implements MigrationInterface {
  name = 'AddTorrentsSettings1755483905439';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE settings ADD COLUMN "qbittorrent_url" varchar',
    );
    await queryRunner.query(
      'ALTER TABLE settings ADD COLUMN "qbittorrent_username" varchar',
    );
    await queryRunner.query(
      'ALTER TABLE settings ADD COLUMN "qbittorrent_password" varchar',
    );
    await queryRunner.query(
      `ALTER TABLE rule_group ADD "deleteTorrents" boolean NOT NULL DEFAULT (1)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE settings DROP "qbittorrent_url"`);
    await queryRunner.query(`ALTER TABLE settings DROP "qbittorrent_username"`);
    await queryRunner.query(`ALTER TABLE settings DROP "qbittorrent_password"`);
    await queryRunner.query(`ALTER TABLE rule_group DROP "deleteTorrents"`);
  }
}
