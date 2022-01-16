import { Module } from '@nestjs/common';
import { RulesService } from './rules.service';
import { RulesController } from './rules.controller';

@Module({
  providers: [RulesService],
  controllers: [RulesController],
})
export class RulesModule {}
