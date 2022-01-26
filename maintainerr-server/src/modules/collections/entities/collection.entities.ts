import { CronExpression } from '@nestjs/schedule';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { CollectionMedia } from './collection_media.entities';

@Entity()
export class Collection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  plexId: number;

  @Column()
  libraryId: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  visibleOnHome: boolean;

  @Column({ nullable: true, default: null })
  deleteAfterDays: number;

  @OneToMany(
    (type) => CollectionMedia,
    (collectionMedia) => collectionMedia.collectionId,
    { onDelete: 'CASCADE' },
  )
  collectionMedia: CollectionMedia[];
}
