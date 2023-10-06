import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Collection } from './collection.entities';
import { PlexMetadata } from '../../api/plex-api/interfaces/media.interface';

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

  @Column({ default: false, nullable: true })
  isManual: boolean;

  @ManyToOne((type) => Collection, (collection) => collection.collectionMedia, {
    onDelete: 'CASCADE',
  })
  collection: Collection;

  plexData: PlexMetadata; // this will be added programatically
}
