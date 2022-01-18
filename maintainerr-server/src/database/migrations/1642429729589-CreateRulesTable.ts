import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateRulesTable1642429729589 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'rule_group',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'text',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'libraryId',
            type: 'integer',
          },
          {
            name: 'isActive',
            type: 'integer',
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'rules',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
          },
          {
            name: 'ruleJson',
            type: 'text',
          },
          {
            name: 'isActive',
            type: 'integer',
          },
          {
            name: 'ruleGroupId',
            type: 'integer',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'rules',
      new TableForeignKey({
        columnNames: ['ruleGroupId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'rule_group',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('rules');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('ruleGroupId') !== -1,
    );
    await queryRunner.dropForeignKey('rules', foreignKey);
    await queryRunner.dropColumn('rules', 'ruleGroupId');
    await queryRunner.dropTable('rules');
    await queryRunner.dropTable('rule_group');
  }
}
