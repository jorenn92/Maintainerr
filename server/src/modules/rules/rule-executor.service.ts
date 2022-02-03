import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { isNull } from 'lodash';
import { PlexLibraryItem } from '../api/plex-api/interfaces/library.interfaces';
import { PlexApiService } from '../api/plex-api/plex-api.service';
import { CollectionsService } from '../collections/collections.service';
import { SettingsService } from '../settings/settings.service';
import { TasksService } from '../tasks/tasks.service';
import {
  RuleConstants,
  RuleOperators,
  RulePossibility,
  RuleType,
} from './constants/rules.constants';
import { RuleDto } from './dtos/rule.dto';
import { RuleDbDto } from './dtos/ruleDb.dto';
import { RulesDto } from './dtos/rules.dto';
import { RuleGroup } from './entities/rule-group.entities';
import { ValueGetterService } from './getter/getter.service';
import { RulesService } from './rules.service';

interface PlexData {
  page: number;
  finished: boolean;
  data: PlexLibraryItem[];
}

@Injectable()
export class RuleExecutorService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RuleExecutorService.name);
  private jobCreationAttempts = 0;

  ruleConstants: RuleConstants;
  userId: string;
  plexData: PlexData;
  workerData: PlexLibraryItem[];
  constructor(
    private readonly rulesService: RulesService,
    private readonly valueGetter: ValueGetterService,
    private readonly plexApi: PlexApiService,
    private readonly collectionService: CollectionsService,
    private readonly taskService: TasksService,
    private readonly settings: SettingsService,
  ) {
    this.ruleConstants = new RuleConstants();
    this.plexData = { page: 1, finished: false, data: [] };
  }

  onApplicationBootstrap() {
    this.jobCreationAttempts++;
    const state = this.taskService.createJob(
      'RuleHandler',
      this.settings.rules_handler_job_cron,
      this.executeAllRules.bind(this),
    );
    if (state.code === 0) {
      if (this.jobCreationAttempts <= 3) {
        this.logger.log(
          'Creation of job RuleHandler failed. Retrying in 10s..',
        );
        setTimeout(() => {
          this.onApplicationBootstrap();
        }, 10000);
      } else {
        this.logger.error(`Creation of job RuleHandler failed.`);
      }
    }
  }

  public updateJob(cron: string) {
    return this.taskService.updateJob(
      'RuleHandler',
      cron,
      this.executeAllRules.bind(this),
    );
  }

  public async executeAllRules() {
    this.logger.log('Starting Execution of all active rules.');
    const ruleGroups = await this.getAllActiveRuleGroups();
    if (ruleGroups) {
      for (const rulegroup of ruleGroups) {
        this.logger.log(`Executing ${rulegroup.name}`);

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
        await this.handleCollection(
          await this.rulesService.getRuleGroupById(rulegroup.id),
        );
        this.logger.log(`Execution of rule ${rulegroup.name} done.`);
      }
    }
  }

  private async handleCollection(rulegroup: RuleGroup) {
    let collection = await this.collectionService.getCollection(
      rulegroup.collectionId,
    );
    const data = this.workerData.map((e) => {
      return +e.ratingKey;
    });

    if (collection) {
      let currentCollectionData = (
        await this.collectionService.getCollectionMedia(collection.id)
      )?.map((e) => {
        return e.plexId;
      });

      currentCollectionData = currentCollectionData
        ? currentCollectionData
        : [];

      const dataToAdd = data
        .filter((el) => !currentCollectionData.includes(el))
        .map((el) => {
          return { plexId: el };
        });

      const dataToRemove = currentCollectionData
        .filter((el) => !data.includes(el))
        .map((el) => {
          return { plexId: el };
        });

      if (dataToRemove.length > 0) {
        this.logInfo(
          `Removing ${dataToRemove.length} media items from '${collection.title}'.`,
        );
      }

      if (dataToAdd.length > 0) {
        this.logInfo(
          `Adding ${dataToAdd.length} media items to '${collection.title}'.`,
        );
      }

      collection = await this.collectionService.addToCollection(
        collection.id,
        dataToAdd,
      );

      collection = await this.collectionService.removeFromCollection(
        collection.id,
        dataToRemove,
      );
      return collection;
    } else {
      // log error: Collection not found
      console.log(`collection not found with id ${rulegroup.collectionId}`);
    }
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
    const indexesToSplice: number[] = [];

    if (isNull(rule.operator) || +rule.operator === +RuleOperators.OR) {
      data = this.plexData.data;
    } else {
      data = this.workerData;
    }
    // for (const [index, el] of data.entries()) {
    for (let i = data.length - 1; i >= 0; i--) {
      firstVal = await this.valueGetter.get(rule.firstVal, data[i]);
      if (rule.lastVal) {
        secondVal = await this.valueGetter.get(rule.lastVal, data[i]);
      } else {
        secondVal =
          rule.customVal.ruleTypeId === +RuleType.DATE
            ? new Date(+rule.customVal.value * 1000)
            : rule.customVal.ruleTypeId === +RuleType.TEXT
            ? rule.customVal.value
            : rule.customVal.ruleTypeId === +RuleType.NUMBER
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
      }
      if (firstVal && secondVal) {
        if (isNull(rule.operator) || rule.operator === RuleOperators.OR) {
          if (this.doRuleAction(firstVal, secondVal, rule.action)) {
            this.workerData.push(data[i]);
          }
        } else {
          if (!this.doRuleAction(firstVal, secondVal, rule.action)) {
            data.splice(i, 1);
          }
        }
      }
    }
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
        return val1.every((e) => {
          if (Array.isArray(val2)) {
            return (val2 as unknown as T[]).includes(e);
          } else {
            return e === val2;
          }
        });
      }
    }
    if (action === RulePossibility.NOT_EQUALS) {
      if (!Array.isArray(val1)) {
        return val1 !== val2;
      } else {
        return val1.every((e) => {
          if (Array.isArray(val2)) {
            return !(val2 as unknown as T[]).includes(e);
          } else {
            return e !== val2;
          }
        });
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

  private async logInfo(message: string) {
    this.logger.log(message, {
      label: 'Rule Worker',
    });
  }
}
