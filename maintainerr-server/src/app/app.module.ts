import { Module } from '@nestjs/common';
import { PlexApiModule } from 'src/api/plex-api/plex-api.module';
import { LoggerModule } from 'src/logger/logger.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [PlexApiModule, LoggerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
