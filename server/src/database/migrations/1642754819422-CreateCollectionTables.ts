import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateCollectionTables1642754819422 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'collection',
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
            name: 'libraryId',
            type: 'integer',
          },
          {
            name: 'title',
            type: 'text',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'integer',
          },
          {
            name: 'VisibleOnHome',
            type: 'integer',
            default: false,
          },
          {
            name: 'deleteAfterDays',
            type: 'integer',
            isNullable: true,
            default: null,
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'collection_media',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
          },
          {
            name: 'collectionId',
            type: 'integer',
          },
          {
            name: 'plexId',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'tmdbId',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'addDate',
            type: 'text',
          },
          {
            name: 'image_path',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'collection_media',
      new TableForeignKey({
        columnNames: ['collectionId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'collection',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('collection_media');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('collectionId') !== -1,
    );
    await queryRunner.dropForeignKey('collection_media', foreignKey);
    await queryRunner.dropColumn('collection_media', 'collectionId');
    await queryRunner.dropTable('collection_media');
    await queryRunner.dropTable('collection');
  }
}
