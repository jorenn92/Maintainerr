import { RulesDto } from 'src/modules/rules/dtos/rules.dto';
import { RuleGroup } from 'src/modules/rules/entities/rule-group.entities';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
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

  @Column({ default: 0 })
  arrAction: number;

  @Column({ default: false })
  visibleOnHome: boolean;

  @Column({ nullable: true, default: null })
  deleteAfterDays: number;

  @Column({ nullable: true, default: false })
  manualCollection: boolean;

  @Column({ nullable: true, default: '' })
  manualCollectionName: string;

  @Column({ nullable: false, default: 1 })
  type: 1 | 2;

  @OneToOne(() => RuleGroup, (rg) => rg.collection)
  ruleGroup: RulesDto;

  @OneToMany(
    (type) => CollectionMedia,
    (collectionMedia) => collectionMedia.collectionId,
    { onDelete: 'CASCADE' },
  )
  collectionMedia: CollectionMedia[];
}
