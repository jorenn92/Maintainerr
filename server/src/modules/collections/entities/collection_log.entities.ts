import { Collection } from '../../collections/entities/collection.entities';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ECollectionLogType {
  COLLECTION,
  MEDIA,
  RULES,
}

@Entity()
@Index('idx_collection_log_collection_id', ['collection'])
export class CollectionLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => Collection, (collection) => collection.collectionLog, {
    onDelete: 'CASCADE',
  })
  collection: Collection;

  @Column({
    type: 'datetime',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  timestamp: Date;

  @Column()
  message: string;

  @Column({ nullable: true })
  type: ECollectionLogType;
}
