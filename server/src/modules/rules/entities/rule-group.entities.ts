import { Collection } from 'src/modules/collections/entities/collection.entities';
import { ICollection } from 'src/modules/collections/interfaces/collection.interface';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Rules } from './rules.entities';

@Entity()
export class RuleGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  libraryId: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  collectionId: number;

  @OneToMany((type) => Rules, (rules) => rules.ruleGroup)
  rules: Rules[];

  @OneToOne(() => Collection, (c) => c.ruleGroup)
  @JoinColumn()
  collection: ICollection;
}
