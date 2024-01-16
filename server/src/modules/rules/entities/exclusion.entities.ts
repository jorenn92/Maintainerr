import { PlexMetadata } from 'src/modules/api/plex-api/interfaces/media.interface';
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

  plexData: PlexMetadata; // this will be added programatically
}
