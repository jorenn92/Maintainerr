import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJellyfinSettings1755083905438 implements MigrationInterface {
  name = 'AddJellyfinSettings1755083905438';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE settings ADD COLUMN "jellyfin_url" varchar',
    );
    await queryRunner.query(
      'ALTER TABLE settings ADD COLUMN "jellyfin_api_key" varchar',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE settings DROP "jellyfin_url"`);
    await queryRunner.query(`ALTER TABLE settings DROP "jellyfin_api_key"`);
  }
}
