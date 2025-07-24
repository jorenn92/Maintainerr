import { forwardRef, Module } from '@nestjs/common';
import { SettingsModule } from '../../settings/settings.module';
import { OmbiApi } from './helpers/ombi-api.helper';
import { OmbiApiService } from './ombi-api.service';

@Module({
  imports: [forwardRef(() => SettingsModule)],
  providers: [OmbiApiService, OmbiApi],
  exports: [OmbiApiService],
})
export class OmbiApiModule {}