import { Injectable } from '@nestjs/common';
import { isNull } from 'lodash';
import { PlexLibraryItem } from '../api/plex-api/interfaces/library.interfaces';
import { PlexApiService } from '../api/plex-api/plex-api.service';
import {
  RuleConstants,
  RuleOperators,
  RulePossibility,
  RuleType,
} from './constants/rules.constants';
import { RuleDto } from './dtos/rule.dto';
import { RuleDbDto } from './dtos/ruleDB.dto';
import { RulesDto } from './dtos/rules.dto';
import { ValueGetterService } from './getter/getter.service';
import { RulesService } from './rules.service';

interface PlexData {
  page: number;
  finished: boolean;
  data: PlexLibraryItem[];
}
@Injectable()
export class RuleExecutorService {
  ruleConstants: RuleConstants;
  userId: string;
  plexData: PlexData;
  workerData: PlexLibraryItem[];
  constructor(
    private rulesService: RulesService,
    private valueGetter: ValueGetterService,
    private plexApi: PlexApiService,
  ) {
    this.ruleConstants = new RuleConstants();
    this.plexData = { page: 1, finished: false, data: [] };
  }
  public async executeAllRules() {
    await this.getAllActiveRuleGroups().then(async (ruleGroups) => {
      if (ruleGroups) {
        for (const rulegroup of ruleGroups) {
          this.workerData = [];
          this.plexData = { page: 0, finished: false, data: [] };
          while (!this.plexData.finished) {
            await this.getPlexData(rulegroup.libraryId);
            for (const rule of rulegroup.rules) {
              const parsedRule = JSON.parse(
                (rule as RuleDbDto).ruleJson,
              ) as RuleDto;
              await this.executeRule(parsedRule);
            }
          }
          console.log(this.workerData.map((e) => e.title)); // TODO : Add to collection
        }
      }
    });
  }

  private async getAllActiveRuleGroups(): Promise<RulesDto[]> {
    return await this.rulesService.getRuleGroups(true);
  }

  private async getPlexData(libraryId: number): Promise<void> {
    const size = 50;
    const response = await this.plexApi.getLibraryContents(
      libraryId.toString(),
      {
        offset: +this.plexData.page * size,
        size: size,
      },
    );
    this.plexData.data = response.items;

    if ((+this.plexData.page + 1) * size >= response.totalSize) {
      this.plexData.finished = true;
    }
    this.plexData.page++;
  }

  private async executeRule(rule: RuleDto) {
    let data: PlexLibraryItem[];
    let firstVal: any;
    let secondVal: any;

    if (isNull(rule.operator) || +rule.operator === +RuleOperators.OR) {
      data = this.plexData.data;
    } else {
      data = this.workerData;
    }
    for (const [index, el] of data.entries()) {
      firstVal = await this.valueGetter.get(rule.firstVal, el);
      if (rule.lastVal) {
        secondVal = await this.valueGetter.get(rule.lastVal, el);
      } else {
        secondVal =
          rule.customVal.ruleTypeId === +RuleType.DATE
            ? new Date(+rule.customVal.value * 1000)
            : rule.customVal.ruleTypeId === +RuleType.TEXT
            ? rule.customVal.value
            : rule.customVal.ruleTypeId === +RuleType.NUMBER
            ? +rule.customVal.value
            : null;
      }
      if (firstVal && secondVal) {
        if (isNull(rule.operator) || rule.operator === RuleOperators.OR) {
          if (this.doRuleAction(firstVal, secondVal, rule.action)) {
            this.workerData.push(el);
          }
        } else {
          if (!this.doRuleAction(firstVal, secondVal, rule.action)) {
            this.workerData.splice(index);
          }
        }
      }
    }

    // alle plexLibraryItems uiteindelijk in workerdata steken.
  }

  private doRuleAction<T>(val1: T, val2: T, action: RulePossibility): boolean {
    if (action === RulePossibility.BIGGER) {
      return val1 > val2;
    }
    if (action === RulePossibility.SMALLER) {
      return val1 < val2;
    }
    if (action === RulePossibility.EQUALS) {
      if (!Array.isArray(val1)) {
        return val1 === val2;
      } else {
        return val1.every((e) => (val2 as unknown as T[]).includes(e));
      }
    }
    if (action === RulePossibility.CONTAINS) {
      try {
        if (!Array.isArray(val2)) {
          return (val1 as unknown as T[]).includes(val2);
        } else {
          if (val2.length > 0) {
            const test = val2.every((el) => {
              return (val1 as unknown as T[]).includes(el);
            });
            return test;
          } else {
            return false;
          }
        }
      } catch (_err) {
        return null;
      }
    }
    if (action === RulePossibility.BEFORE) {
      return val1 <= val2;
    }
    if (action === RulePossibility.AFTER) {
      return val1 >= val2;
    }
    if (action === RulePossibility.IN_LAST) {
      return (
        (val1 as unknown as Date) >= (val2 as unknown as Date) &&
        (val1 as unknown as Date) <= new Date() // Frontend moet berekening maken en epoch time in s meegeven
      );
    }
    if (action === RulePossibility.IN_NEXT) {
      return (
        (val1 as unknown as Date) <= (val2 as unknown as Date) && // Frontend moet berekening maken en epoch time in s meegeven
        (val1 as unknown as Date) >= new Date()
      );
    }
  }
}
