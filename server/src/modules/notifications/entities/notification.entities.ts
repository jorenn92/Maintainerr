
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
