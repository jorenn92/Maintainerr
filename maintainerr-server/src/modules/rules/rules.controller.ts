import { Body, Controller, Get, Post } from '@nestjs/common';
import { RulesDto } from './dtos/rules.dto';
import { ReturnStatus, RulesService } from './rules.service';

@Controller('api/rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}
  @Get()
  getRules() {
    return this.rulesService.getRules;
  }
  @Post()
  setRules(@Body() body: RulesDto): ReturnStatus {
    return this.rulesService.setRules(body);
  }
}
