import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateExclusions1647858761066 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'exclusion',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
          },
          {
            name: 'plexId',
            type: 'integer',
          },
          {
            name: 'ruleGroupId',
            type: 'integer',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'exclusion',
      new TableForeignKey({
        columnNames: ['ruleGroupId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'rule_group',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('exclusion');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('ruleGroupId') !== -1,
    );
    await queryRunner.dropForeignKey('exclusion', foreignKey);
    await queryRunner.dropColumn('exclusion', 'ruleGroupId');
    await queryRunner.dropTable('exclusion');
  }
}
