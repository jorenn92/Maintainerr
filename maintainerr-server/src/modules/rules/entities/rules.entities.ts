import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { RuleGroup } from './rule-group.entities';

@Entity()
export class Rules {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ruleJson: string;

  @Column()
  ruleGroupId: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne((type) => RuleGroup, (ruleGroup) => ruleGroup.rules)
  ruleGroup: RuleGroup;
}
