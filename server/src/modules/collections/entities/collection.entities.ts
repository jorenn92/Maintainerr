import { RulesDto } from '../../rules/dtos/rules.dto';
import { RuleGroup } from '../../rules/entities/rule-group.entities';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { CollectionMedia } from './collection_media.entities';
import { EPlexDataType } from '../../api/plex-api/enums/plex-data-type-enum';
import { CollectionLog } from 'src/modules/collections/entities/collection_log.entities';

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

  @Column({ nullable: false, default: false })
  manualCollection: boolean;

  @Column({ nullable: true, default: '' })
  manualCollectionName: string;

  @Column({ nullable: false, default: false })
  listExclusions: boolean;

  @Column({ nullable: false, default: false })
  forceOverseerr: boolean;

  @Column({ nullable: false, default: 1 })
  type: EPlexDataType;

  @Column({ nullable: false, default: 6 })
  keepLogsForMonths: number;

  @OneToOne(() => RuleGroup, (rg) => rg.collection)
  ruleGroup: RulesDto;

  @Column({ type: 'date', nullable: true, default: () => 'CURRENT_TIMESTAMP' }) // nullable = true for old collections
  addDate: Date;

  @Column({ nullable: false, default: 0 })
  handledMediaAmount: number;

  @Column({ nullable: false, default: 0 })
  lastDurationInSeconds: number;

  @OneToMany(
    (type) => CollectionMedia,
    (collectionMedia) => collectionMedia.collectionId,
    { onDelete: 'CASCADE' },
  )
  collectionMedia: CollectionMedia[];

  @OneToMany(
    (type) => CollectionLog,
    (collectionLog) => collectionLog.collection,
    { onDelete: 'CASCADE' },
  )
  collectionLog: CollectionLog[];
}
