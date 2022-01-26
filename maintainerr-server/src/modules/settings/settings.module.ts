import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Settings } from './entities/settings.entities';
import { SettingsService } from './settings.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Settings])],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
