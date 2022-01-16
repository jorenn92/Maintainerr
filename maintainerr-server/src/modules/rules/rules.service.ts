import { Injectable } from '@nestjs/common';
import { Rule, RuleConstants } from './constants/rules.constants';
import { RuleDto } from './dtos/rule.dto';
import { RulesDto } from './dtos/rules.dto';

export interface ReturnStatus {
  code: 0 | 1;
  result: string;
}
@Injectable()
export class RulesService {
  ruleConstants: RuleConstants;
  constructor() {
    this.ruleConstants = new RuleConstants();
  }
  get getRules(): RuleConstants {
    return this.ruleConstants;
  }

  setRules(params: RulesDto) {
    // {
    //   "rules" : [
    //     { "operator": null, "firstVal": [0,1], "lastVal": [3,0],"action": 2},
    //     { "operator": 0, "firstVal": [0,1], "lastVal": [3,0],"action": 2}
    //   ]
    // }

    // Rules valideren en opslaan in DB. Gewoon als json?
    let state: ReturnStatus = this.createReturnStatus(true, 'Success');
    params.rules.forEach((rule) => {
      if (state.code === 1) {
        state = this.validateRule(rule);
      }
    }, this);
    if (state.code === 1) {
      console.log(state);
      // save in DB
      // execute for the first time
      return state;
    } else {
      console.log(state);
      return state;
    }
  }

  private validateRule(rule: RuleDto): ReturnStatus {
    try {
      const val1: Rule = this.ruleConstants.rules
        .find((el) => el.id === rule.firstVal[0])
        .props.find((el) => el.id === rule.firstVal[1]);
      if (rule.lastVal) {
        const val2: Rule = this.ruleConstants.rules
          .find((el) => el.id === rule.lastVal[0])
          .props.find((el) => el.id === rule.lastVal[1]);
        if (val1.type === val2.type) {
          if (val1.type.possibilities.includes(rule.action)) {
            return this.createReturnStatus(true, 'Success');
          } else {
            return this.createReturnStatus(
              false,
              'Action is not supported on type',
            );
          }
        } else {
          return this.createReturnStatus(false, "Types don't match");
        }
      } else if (rule.customVal) {
        if (val1.type.toString() === rule.customVal.ruleTypeId.toString()) {
          if (val1.type.possibilities.includes(rule.action)) {
            return this.createReturnStatus(true, 'Success');
          } else {
            return this.createReturnStatus(
              false,
              'Action is not supported on type',
            );
          }
        }
      } else {
        return this.createReturnStatus(false, 'No second value found');
      }
      if (!val1) {
        return this.createReturnStatus(false, 'Rule not found');
      }
    } catch {
      return this.createReturnStatus(false, 'Unexpected error occurred');
    }
  }

  private createReturnStatus(succes: boolean, result: string): ReturnStatus {
    return { code: succes ? 1 : 0, result: result };
  }
}
