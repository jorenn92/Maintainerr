import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RuleGroup } from '../../rules/entities/rule-group.entities';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  agent: string;

  @Column({ default: false })
  enabled: boolean;

  @Column('text', { nullable: true })
  types: string;

  @Column({ type: 'simple-json', nullable: false })
  options: string;

  @Column({ default: 3, nullable: false })
  aboutScale: number;

  @ManyToMany(() => RuleGroup, (rulegroup) => rulegroup.notifications, {
    onDelete: 'CASCADE',
  })
  rulegroups: RuleGroup[];
}
