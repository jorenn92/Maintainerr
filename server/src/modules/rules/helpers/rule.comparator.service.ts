import { Injectable, Logger } from '@nestjs/common';
import _ from 'lodash';
import { EPlexDataType } from '../../api/plex-api/enums/plex-data-type-enum';
import { PlexLibraryItem } from '../../api/plex-api/interfaces/library.interfaces';
import { RuleConstanstService } from '../constants/constants.service';
import {
  RuleOperators,
  RulePossibility,
  RuleType,
} from '../constants/rules.constants';
import { RuleDto } from '../dtos/rule.dto';
import { RuleDbDto } from '../dtos/ruleDb.dto';
import { RulesDto } from '../dtos/rules.dto';
import { ValueGetterService } from '../getter/getter.service';

interface IComparisonStatistics {
  plexId: number;
  result: boolean;
  sectionResults: ISectionComparisonResults[];
}

interface ISectionComparisonResults {
  id: number;
  result: boolean;
  operator?: string;
  ruleResults: IRuleComparisonResult[];
}

interface IRuleComparisonResult {
  firstValueName: string;
  firstValue: any;
  secondValueName: string;
  secondValue: any;
  action: string;
  operator?: string;
  result: boolean;
}

interface IComparatorReturnValue {
  stats: IComparisonStatistics[];
  data: PlexLibraryItem[];
}

@Injectable()
export class RuleComparatorServiceFactory {
  constructor(
    private readonly valueGetter: ValueGetterService,
    private readonly ruleConstanstService: RuleConstanstService,
  ) {}

  create(): RuleComparatorService {
    return new RuleComparatorService(
      this.valueGetter,
      this.ruleConstanstService,
    );
  }
}

@Injectable()
export class RuleComparatorService {
  private readonly logger = new Logger(RuleComparatorService.name);
  workerData: PlexLibraryItem[];
  resultData: PlexLibraryItem[];
  plexData: PlexLibraryItem[];
  plexDataType: EPlexDataType;
  statistics: IComparisonStatistics[];
  statisticWorker: IRuleComparisonResult[];
  enabledStats: boolean;

  constructor(
    private readonly valueGetter: ValueGetterService,
    private readonly ruleConstanstService: RuleConstanstService,
  ) {}

  public async executeRulesWithData(
    rulegroup: RulesDto,
    plexData: PlexLibraryItem[],
    withStats = false,
  ): Promise<IComparatorReturnValue> {
    try {
      // prepare
      this.plexData = plexData;
      this.plexDataType = rulegroup.dataType ? rulegroup.dataType : undefined;
      this.enabledStats = withStats;
      this.workerData = [];
      this.resultData = [];
      this.statistics = [];
      this.statisticWorker = [];

      // run rules
      let currentSection = 0;
      let sectionActionAnd = false;

      // prepare statistics if needed
      this.prepareStatistics();

      for (const rule of rulegroup.rules) {
        const parsedRule = JSON.parse((rule as RuleDbDto).ruleJson) as RuleDto;

        // force operator of very first rule to null, otherwise this might cause corruption
        if ((rule as RuleDbDto)?.id === (rulegroup.rules[0] as RuleDbDto)?.id) {
          parsedRule.operator = null;
        }

        if (currentSection === (rule as RuleDbDto).section) {
          // if section didn't change
          // execute and store in work array
          await this.executeRule(parsedRule, rulegroup);
        } else {
          // set the stat results of the completed section, if needed
          this.setStatisticSectionResults();

          // handle section action
          this.handleSectionAction(sectionActionAnd);

          // save new section action
          sectionActionAnd = +parsedRule.operator === 0;
          // reset first operator of new section
          parsedRule.operator = null;
          // add new section to stats
          this.addSectionToStatistics(
            (rule as RuleDbDto).section,
            sectionActionAnd,
          );
          // Execute the rule and set the new section
          await this.executeRule(parsedRule, rulegroup);
          currentSection = (rule as RuleDbDto).section;
        }
      }
      // set the stat results of the last section, if needed
      this.setStatisticSectionResults();

      // handle last section
      this.handleSectionAction(sectionActionAnd);

      // update statistics results when needed
      this.updateStatisticResults();

      // update result for matched media
      this.statistics.forEach((el) => {
        el.result = this.resultData.some((i) => +i.ratingKey === +el.plexId);
      });

      // return comparatorReturnValue
      return { stats: this.statistics, data: this.resultData };
    } catch (e) {
      this.logger.log(
        `Something went wrong while running rule ${rulegroup.name}`,
      );
      this.logger.debug(e);
    }
  }

  private updateStatisticResults() {
    if (this.enabledStats) {
      this.statistics.forEach((el) => {
        el.result = this.resultData.some((i) => +i.ratingKey === +el.plexId);
      });
    }
  }

  private setStatisticSectionResults() {
    // add the result of the last section. If media is in workerData, section = true.
    if (this.enabledStats) {
      this.statistics.forEach((stat) => {
        if (this.workerData.find((el) => +el.ratingKey === +stat.plexId)) {
          stat.sectionResults[stat.sectionResults.length - 1].result = true;
        } else {
          stat.sectionResults[stat.sectionResults.length - 1].result = false;
        }
      });
    }
  }

  private addSectionToStatistics(id: number, isAND: boolean) {
    if (this.enabledStats) {
      this.statistics.forEach((data) => {
        data.sectionResults.push({
          id: id,
          result: undefined,
          operator: isAND ? 'AND' : 'OR',
          ruleResults: [],
        });
      });
    }
  }

  private async executeRule(rule: RuleDto, ruleGroup: RulesDto) {
    let data: PlexLibraryItem[];
    let firstVal: any;
    let secondVal: any;

    if (rule.operator === null || +rule.operator === +RuleOperators.OR) {
      data = _.cloneDeep(this.plexData);
    } else {
      data = _.cloneDeep(this.workerData);
    }

    // loop media items
    for (let i = data.length - 1; i >= 0; i--) {
      // fetch values
      firstVal = await this.valueGetter.get(
        rule.firstVal,
        data[i],
        ruleGroup,
        this.plexDataType,
      );
      secondVal = await this.getSecondValue(rule, data[i], ruleGroup, firstVal);

      if (
        (firstVal !== undefined || null) &&
        (secondVal !== undefined || null)
      ) {
        // do action
        const comparisonResult = this.doRuleAction(
          firstVal,
          secondVal,
          rule.action,
        );

        // add stats if enabled
        this.addStatistictoParent(
          rule,
          firstVal,
          secondVal,
          +data[i].ratingKey,
          comparisonResult,
        );

        // alter workerData
        if (rule.operator === null || +rule.operator === +RuleOperators.OR) {
          if (comparisonResult) {
            // add to workerdata if not yet available
            if (
              this.workerData.find((e) => e.ratingKey === data[i].ratingKey) ===
              undefined
            ) {
              this.workerData.push(data[i]);
            }
          }
        } else {
          if (!comparisonResult) {
            // remove from workerdata
            this.workerData.splice(i, 1);
          }
        }
      }
    }
  }

  private async getSecondValue(
    rule: RuleDto,
    data: PlexLibraryItem,
    rulegroup: RulesDto,
    firstVal: any,
  ): Promise<any> {
    let secondVal;
    if (rule.lastVal) {
      secondVal = await this.valueGetter.get(
        rule.lastVal,
        data,
        rulegroup,
        this.plexDataType,
      );
    } else {
      secondVal =
        rule.customVal.ruleTypeId === +RuleType.DATE
          ? rule.customVal.value.includes('-')
            ? new Date(rule.customVal.value)
            : new Date(+rule.customVal.value * 1000)
          : rule.customVal.ruleTypeId === +RuleType.TEXT
            ? rule.customVal.value
            : rule.customVal.ruleTypeId === +RuleType.NUMBER ||
                rule.customVal.ruleTypeId === +RuleType.BOOL
              ? +rule.customVal.value
              : null;
      if (
        firstVal instanceof Date &&
        rule.customVal.ruleTypeId === +RuleType.NUMBER
      ) {
        if (
          [RulePossibility.IN_LAST, RulePossibility.BEFORE].includes(
            rule.action,
          )
        ) {
          secondVal = new Date(new Date().getTime() - +secondVal * 1000);
        } else {
          secondVal = new Date(new Date().getTime() + +secondVal * 1000);
        }
      } else if (
        firstVal instanceof Date &&
        rule.customVal.ruleTypeId === +RuleType.DATE
      ) {
        secondVal = new Date(+secondVal);
      }
      if (
        // if custom secondval is text, check if it's parsable as an array
        rule.customVal.ruleTypeId === +RuleType.TEXT &&
        this.isStringParsableToArray(secondVal as string)
      ) {
        secondVal = JSON.parse(secondVal);
      }
    }
    return secondVal;
  }

  private prepareStatistics() {
    if (this.enabledStats) {
      this.plexData.forEach((data) => {
        this.statistics.push({
          plexId: +data.ratingKey,
          result: false,
          sectionResults: [
            {
              id: 0,
              result: undefined,
              ruleResults: [],
            },
          ],
        });
      });
    }
  }

  private addStatistictoParent(
    rule: RuleDto,
    firstVal: any,
    secondVal: any,
    plexId: number,
    result: boolean,
  ) {
    if (this.enabledStats) {
      const index = this.statistics.findIndex((el) => +el.plexId === +plexId);
      const sectionIndex = this.statistics[index].sectionResults.length - 1;

      // push result to currently last section
      this.statistics[index].sectionResults[sectionIndex].ruleResults.push({
        operator:
          rule.operator === null || rule.operator === undefined
            ? RuleOperators[1]
            : RuleOperators[rule.operator],
        action: RulePossibility[rule.action].toLowerCase(),
        firstValueName: this.ruleConstanstService.getValueHumanName(
          rule.firstVal,
        ),
        firstValue: firstVal,
        secondValueName: rule.lastVal
          ? this.ruleConstanstService.getValueHumanName(rule.lastVal)
          : this.ruleConstanstService.getCustomValueIdentifier(rule.customVal)
              .type,
        secondValue: secondVal,
        result: result,
      });

      // If it's the first rule of a section (but not the first one) then add the operator to the sectionResult
      if (
        index > 0 &&
        this.statistics[index].sectionResults[sectionIndex].ruleResults
          .length === 1
      ) {
        this.statistics[index].sectionResults[sectionIndex].operator =
          rule.operator === null || rule.operator === undefined
            ? RuleOperators[1]
            : RuleOperators[rule.operator];
      }
    }
  }

  private handleSectionAction(sectionActionAnd: boolean) {
    if (!sectionActionAnd) {
      // section action is OR, then push in result array
      this.resultData.push(...this.workerData);
    } else {
      // section action is AND, then filter media not in work array out of result array
      this.resultData = this.resultData.filter((el) => {
        // If in current data.. Otherwise we're removing previously added media
        if (this.plexData.some((plexEl) => plexEl.ratingKey === el.ratingKey)) {
          return this.workerData.some(
            (workEl) => workEl.ratingKey === el.ratingKey,
          );
        } else {
          // If not in current data, skip check
          return true;
        }
      });
    }
    // empty workerdata. prepare for execution of new section
    this.workerData = [];
  }

  private doRuleAction<T>(val1: T, val2: T, action: RulePossibility): boolean {
    if (typeof val1 === 'string') {
      val1 = val1.toLowerCase() as T;
    }

    if (typeof val2 === 'string') {
      val2 = val2.toLowerCase() as T;
    }

    if (Array.isArray(val1)) {
      val1 = val1.map((el) =>
        typeof el == 'string' ? el.toLowerCase() : el,
      ) as T;
    }

    if (Array.isArray(val2)) {
      val2 = val2.map((el) =>
        typeof el == 'string' ? el.toLowerCase() : el,
      ) as T;
    }

    if (action === RulePossibility.BIGGER) {
      return val1 > val2;
    }

    if (action === RulePossibility.SMALLER) {
      return val1 < val2;
    }

    if (action === RulePossibility.EQUALS) {
      if (!Array.isArray(val1)) {
        if (val1 instanceof Date && val2 instanceof Date) {
          return (
            new Date(val1.toDateString()).valueOf() ===
            new Date(val2.toDateString()).valueOf()
          );
        }

        if (typeof val1 === 'boolean') {
          return val1 == val2;
        }

        return val1 === val2;
      } else {
        const val2Array = Array.isArray(val2) ? val2 : [val2];

        if (val1.length === val2Array.length) {
          const set1 = new Set(val1);
          const set2 = new Set(val2Array);
          return [...set1].every((value) => set2.has(value));
        } else {
          return false;
        }
      }
    }

    if (action === RulePossibility.NOT_EQUALS) {
      return !this.doRuleAction(val1, val2, RulePossibility.EQUALS);
    }

    if (action === RulePossibility.CONTAINS) {
      try {
        if (!Array.isArray(val2)) {
          return (val1 as unknown as T[])?.includes(val2);
        } else {
          if (val2.length > 0) {
            return val2.some((el) => {
              return (val1 as unknown as T[])?.includes(el);
            });
          } else {
            return false;
          }
        }
      } catch (_err) {
        return null;
      }
    }

    if (action === RulePossibility.CONTAINS_PARTIAL) {
      try {
        if (!Array.isArray(val2)) {
          return (
            (Array.isArray(val1) ? (val1 as unknown as T[]) : [val1]).some(
              (line) => {
                return typeof line === 'string' &&
                  val2 != undefined &&
                  String(val2).length > 0
                  ? line.includes(String(val2))
                  : line == val2
                    ? true
                    : false;
              },
            ) || false
          );
        } else {
          if (val2.length > 0) {
            return val2.some((el) => {
              return (
                (val1 as unknown as T[]).some((line) => {
                  return typeof line === 'string' &&
                    el != undefined &&
                    el.length > 0
                    ? line.includes(String(el))
                    : line == el
                      ? true
                      : false;
                }) || false
              );
            });
          } else {
            return false;
          }
        }
      } catch (_err) {
        return null;
      }
    }

    if (action === RulePossibility.NOT_CONTAINS) {
      return !this.doRuleAction(val1, val2, RulePossibility.CONTAINS);
    }

    if (action === RulePossibility.NOT_CONTAINS_PARTIAL) {
      return !this.doRuleAction(val1, val2, RulePossibility.CONTAINS_PARTIAL);
    }

    if (action === RulePossibility.BEFORE) {
      return val1 && val2 ? val1 <= val2 : false;
    }

    if (action === RulePossibility.AFTER) {
      return val1 && val2 ? val1 >= val2 : false;
    }

    if (action === RulePossibility.IN_LAST) {
      return (
        val1 >= val2 && // time in s
        (val1 as unknown as Date) <= new Date()
      );
    }

    if (action === RulePossibility.IN_NEXT) {
      return (
        val1 <= val2 && //  time in s
        (val1 as unknown as Date) >= new Date()
      );
    }
  }

  private isStringParsableToArray(str: string) {
    try {
      const array = JSON.parse(str);
      return Array.isArray(array);
    } catch (error) {
      return false;
    }
  }
}
