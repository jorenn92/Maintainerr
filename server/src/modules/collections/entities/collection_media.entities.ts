import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Collection } from './collection.entities';

@Entity()
export class CollectionMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  collectionId: number;

  @Column()
  plexId: number;

  @Column({ nullable: true })
  tmdbId: number;

  @Column()
  addDate: Date;

  @Column({ nullable: true })
  image_path: string;

  @ManyToOne((type) => Collection, (collection) => collection.collectionMedia, {
    onDelete: 'CASCADE',
  })
  collection: Collection;
}
