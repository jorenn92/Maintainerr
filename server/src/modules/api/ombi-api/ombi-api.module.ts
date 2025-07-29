import { forwardRef, Module } from '@nestjs/common';
import { SettingsModule } from '../../settings/settings.module';
import { OmbiApiService } from './ombi-api.service';

@Module({
  imports: [forwardRef(() => SettingsModule)],
  providers: [OmbiApiService],
  exports: [OmbiApiService],
})
export class OmbiApiModule {}