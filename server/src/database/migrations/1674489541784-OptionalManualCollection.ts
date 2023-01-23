import { MigrationInterface, QueryRunner } from 'typeorm';

export class OptionalManualCollection1674489541784
  implements MigrationInterface
{
  name = 'OptionalManualCollection1674489541784';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE collection ADD "manualCollection" boolean NOT NULL DEFAULT (0)`,
    );

    await queryRunner.query(
      `ALTER TABLE collection ADD "manualCollectionName" varchar`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE collection DROP COLUMN manualCollection;`,
    );

    await queryRunner.query(
      `ALTER TABLE collection DROP COLUMN manualCollectionName;`,
    );
  }
}
