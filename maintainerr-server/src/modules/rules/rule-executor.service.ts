import { Injectable } from '@nestjs/common';
import { PlexLibraryItem } from '../api/plex-api/interfaces/library.interfaces';
import { PlexApiService } from '../api/plex-api/plex-api.service';
import {
  RuleConstants,
  RuleOperators,
  RulePossibility,
  RuleType,
} from './constants/rules.constants';
import { RuleDto } from './dtos/rule.dto';
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
  public executeAllRules() {
    this.getAllActiveRuleGroups().then((ruleGroups) => {
      if (ruleGroups) {
        ruleGroups.forEach(async (rulegroup) => {
          this.workerData = [];
          this.plexData = { page: 0, finished: false, data: [] };
          while (!this.plexData.finished) {
            await this.getPlexData(rulegroup.libraryId).then(() => {
              console.log(`length:  ${this.plexData.data.length}`);
              rulegroup.rules.forEach((rule) => {
                const parsedRule = JSON.parse(rule.ruleJson) as RuleDto;
                this.executeRule(parsedRule);
              });
            });
          }
          console.log(this.workerData.length); // TODO : Add to collection
        });
      }
    });
  }

  private async getAllActiveRuleGroups(): Promise<RulesDto[]> {
    return await this.rulesService.getRuleGroups(true);
  }

  private async getPlexData(libraryId: number): Promise<void> {
    const size = 50;
    console.log(
      `getting page ${this.plexData.page + 1}, finished is ${
        this.plexData.finished
      }`,
    );
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

  private executeRule(rule: RuleDto) {
    let data: PlexLibraryItem[];
    let firstVal: any;
    let secondVal: any;

    if (!rule.operator || rule.operator === RuleOperators.OR) {
      data = this.plexData.data;
    } else {
      data = this.workerData;
    }
    data.forEach((el) => {
      firstVal = this.valueGetter.get(rule.firstVal, el);
      if (rule.lastVal) {
        secondVal = this.valueGetter.get(rule.lastVal, el);
      } else {
        secondVal =
          rule.customVal.ruleTypeId === +RuleType.DATE
            ? new Date(+rule.customVal.value * 1000)
            : rule.customVal.ruleTypeId === +RuleType.TEXT
            ? rule.customVal.value
            : null;
      }

      if (firstVal && secondVal) {
        if (this.doRuleAction(firstVal, secondVal, rule.action)) {
          console.log(`comparing ${firstVal} to ${secondVal}`);
          this.workerData.push(el);
        }
      }
    });

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
      return val1 === val2;
    }
    if (action === RulePossibility.CONTAINS) {
      return (val1 as unknown as T[]).includes(val2);
    }
    if (action === RulePossibility.BEFORE) {
      return val1 <= val2;
    }
    if (action === RulePossibility.AFTER) {
      return val1 >= val2;
    }
    if (action === RulePossibility.IN_LAST) {
      return (
        (val1 as unknown as Date) >=
        new Date(
          new Date().setDate(
            new Date().getTime() - (val2 as unknown as number),
          ),
        )
      );
    }
    if (action === RulePossibility.IN_NEXT) {
      return (
        (val1 as unknown as Date) <=
        new Date(
          new Date().setDate(
            new Date().getDate() + (val2 as unknown as number),
          ),
        )
      );
    }
  }
}
