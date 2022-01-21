import { Collection } from 'src/modules/collections/entities/collection.entities';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
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

  @OneToOne(() => Collection)
  @JoinColumn()
  collection: number;

  @OneToMany((type) => Rules, (rules) => rules.ruleGroup)
  rules: Rules[];
}
