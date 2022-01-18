import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RulesDto } from './dtos/rules.dto';
import { RuleExecutorService } from './rule-executor.service';
import { ReturnStatus, RulesService } from './rules.service';

@Controller('api/rules')
export class RulesController {
  constructor(
    private readonly rulesService: RulesService,
    private readonly ruleExecutorService: RuleExecutorService,
  ) {}
  @Get('/constants')
  getRuleConstants() {
    return this.rulesService.getRuleConstants;
  }
  @Get('/:id')
  getRules(@Param('id') id: string) {
    return this.rulesService.getRules(id);
  }
  @Get()
  getRuleGroups() {
    return this.rulesService.getRuleGroups(false);
  }
  @Post('/execute')
  executeRules() {
    this.ruleExecutorService.executeAllRules();
  }
  @Post()
  async setRules(@Body() body: RulesDto): Promise<ReturnStatus> {
    return await this.rulesService.setRules(body);
  }
}
