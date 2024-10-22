import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SonarrSettingDto } from "../dto's/sonarr-setting.dto";
import { Collection } from '../../collections/entities/collection.entities';

@Entity()
export class SonarrSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  serverName: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  apiKey: string;

  @Column({ default: false })
  isDefault: boolean;

  @OneToMany(() => Collection, (collection) => collection.sonarrSettings)
  collections: Collection[];
}
