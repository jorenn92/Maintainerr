import { forwardRef, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalApiModule } from '../api/internal-api/internal-api.module';
import { JellyfinApiModule } from '../api/jellyfin-api/jellyfin-api.module';
import { JellyseerrApiModule } from '../api/jellyseerr-api/jellyseerr-api.module';
import { OverseerrApiModule } from '../api/overseerr-api/overseerr-api.module';
import { PlexApiModule } from '../api/plex-api/plex-api.module';
import { QbittorrentApiModule } from '../api/qbittorrent-api/qbittorrent-api.module';
import { ServarrApiModule } from '../api/servarr-api/servarr-api.module';
import { TautulliApiModule } from '../api/tautulli-api/tautulli-api.module';
import { RadarrSettings } from './entities/radarr_settings.entities';
import { Settings } from './entities/settings.entities';
import { SonarrSettings } from './entities/sonarr_settings.entities';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Global()
@Module({
  imports: [
    forwardRef(() => PlexApiModule),
    forwardRef(() => ServarrApiModule),
    forwardRef(() => OverseerrApiModule),
    forwardRef(() => JellyseerrApiModule),
    forwardRef(() => TautulliApiModule),
    forwardRef(() => InternalApiModule),
    forwardRef(() => JellyfinApiModule),
    forwardRef(() => QbittorrentApiModule),
    TypeOrmModule.forFeature([Settings, RadarrSettings]),
    TypeOrmModule.forFeature([Settings, SonarrSettings]),
  ],
  providers: [SettingsService],
  exports: [SettingsService],
  controllers: [SettingsController],
})
export class SettingsModule {}
