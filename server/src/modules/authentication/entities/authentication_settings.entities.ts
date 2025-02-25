import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('auth_settings')
export class AuthenticationSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean', default: false })
  authEnabled: boolean;

  @Column({ type: 'text', nullable: true })
  username: string | null;

  @Column({ type: 'text', nullable: true })
  passwordHash: string | null;

  @Column({ type: 'text', nullable: true })
  apiKey: string;
}
