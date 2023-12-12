import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Exclusion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  plexId: number;

  @Column({ nullable: true })
  ruleGroupId: number;

  @Column({ nullable: true })
  parent: number;
}
