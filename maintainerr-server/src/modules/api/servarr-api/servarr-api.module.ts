import { Module } from '@nestjs/common';
import { ExternalApiModule } from '../external-api/external-api.module';
import { RadarrController } from './radarr.controller';
import { ServarrService } from './servarr.service';

@Module({
  imports: [ExternalApiModule],
  controllers: [RadarrController],
  providers: [ServarrService],
  exports: [ServarrService],
})
export class ServarrApiModule {}
