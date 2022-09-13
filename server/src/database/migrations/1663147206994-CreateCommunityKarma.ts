import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCommunityKarma1663146883594 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'community_karma',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
          },
          {
            name: 'community_rule_id',
            type: 'integer',
          },
        ],
      }),
      true,
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('community_karma');
  }
}
