import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import _ from 'lodash';
import { isNull } from 'lodash';
import { PlexLibraryItem } from '../api/plex-api/interfaces/library.interfaces';
import { PlexApiService } from '../api/plex-api/plex-api.service';
import { CollectionsService } from '../collections/collections.service';
import { AddCollectionMedia } from '../collections/interfaces/collection-media.interface';
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
import { EPlexDataType } from '../api/plex-api/enums/plex-data-type-enum';

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
  plexDataType: EPlexDataType;
  workerData: PlexLibraryItem[];
  resultData: PlexLibraryItem[];
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
    const appStatus = await this.settings.testConnections();

    if (appStatus) {
      const ruleGroups = await this.getAllActiveRuleGroups();
      if (ruleGroups) {
        for (const rulegroup of ruleGroups) {
          if (rulegroup.useRules) {
            this.logger.log(`Executing rules for ${rulegroup.name}`);

            this.workerData = [];
            this.resultData = [];

            this.plexData = { page: 0, finished: false, data: [] };
            this.plexDataType = rulegroup.dataType
              ? rulegroup.dataType
              : undefined;
            while (!this.plexData.finished) {
              await this.getPlexData(rulegroup.libraryId);
              let currentSection = 0;
              let sectionActionAnd = false;

              for (const rule of rulegroup.rules) {
                const parsedRule = JSON.parse(
                  (rule as RuleDbDto).ruleJson,
                ) as RuleDto;
                if (currentSection === (rule as RuleDbDto).section) {
                  // if section didn't change
                  // execute and store in work array
                  await this.executeRule(parsedRule);
                } else {
                  // handle section action
                  this.handleSectionAction(sectionActionAnd);
                  // save new section action
                  sectionActionAnd = +parsedRule.operator === 0;
                  // reset first operator of new section
                  parsedRule.operator = null;
                  // Execute the rule and set the new section
                  await this.executeRule(parsedRule);
                  currentSection = (rule as RuleDbDto).section;
                }
              }
              this.handleSectionAction(sectionActionAnd); // Handle last section
            }
            await this.handleCollection(
              await this.rulesService.getRuleGroupById(rulegroup.id), // refetch to get latest changes
            );
            this.logger.log(`Execution of rules for ${rulegroup.name} done.`);
          }
          await this.syncManualPlexMediaToCollectionDB(
            await this.rulesService.getRuleGroupById(rulegroup.id), // refetch to get latest changes
          );
        }
      }
    } else {
      this.logger.log(
        'Not all applications are reachable.. Skipped rule execution.',
      );
    }
  }

  private async syncManualPlexMediaToCollectionDB(rulegroup: RuleGroup) {
    if (rulegroup && rulegroup.collectionId) {
      let collection = await this.collectionService.getCollection(
        rulegroup.collectionId,
      );

      collection = await this.collectionService.relinkManualCollection(
        collection,
      );

      if (collection && collection.plexId) {
        const collectionMedia = await this.collectionService.getCollectionMedia(
          rulegroup.collectionId,
        );

        const children = await this.plexApi.getCollectionChildren(
          collection.plexId.toString(),
        );

        // Handle manually added
        if (children && children.length > 0) {
          children.forEach(async (child) => {
            if (child && child.ratingKey)
              if (
                !collectionMedia.find((e) => {
                  return +e.plexId === +child.ratingKey;
                })
              ) {
                await this.collectionService.addToCollection(
                  collection.id,
                  [{ plexId: +child.ratingKey }] as AddCollectionMedia[],
                  true,
                );
              }
          });
        }

        // Handle manually removed
        if (collectionMedia && collectionMedia.length > 0) {
          collectionMedia.forEach(async (media) => {
            if (media && media.plexId) {
              if (
                !children ||
                !children.find((e) => +media.plexId === +e.ratingKey)
              ) {
                await this.collectionService.removeFromCollection(
                  collection.id,
                  [{ plexId: +media.plexId }] as AddCollectionMedia[],
                );
              }
            }
          });
        }

        this.logger.log(
          `Synced collection '${
            collection.manualCollection
              ? collection.manualCollectionName
              : collection.title
          }' with Plex`,
        );
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
        if (
          this.plexData.data.some((plexEl) => plexEl.ratingKey === el.ratingKey)
        ) {
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

  private async handleCollection(rulegroup: RuleGroup) {
    let collection = await this.collectionService.getCollection(
      rulegroup.collectionId,
    );
    const exclusions = await this.rulesService.getExclusions(rulegroup.id);

    // keep a record of parent/child ratingKeys for seasons & episodes
    const collectionMediaCHildren: [{ parent: number; child: number }] =
      undefined;

    // filter exclusions out of results & get correct ratingKey
    const data = this.resultData
      .filter((el) => !exclusions.find((e) => +e.plexId === +el.ratingKey))
      .map((el) => {
        return +el.ratingKey;
      });

    if (collection) {
      const collMediaData = await this.collectionService.getCollectionMedia(
        collection.id,
      );
      // Add manually added media to data
      const manualData = collMediaData
        .filter((el) => el.isManual === true)
        .map((e) => e.plexId);

      data.push(...manualData);

      let currentCollectionData = collMediaData.map((e) => {
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
          `Removing ${dataToRemove.length} media items from '${
            collection.manualCollection
              ? collection.manualCollectionName
              : collection.title
          }'.`,
        );
      }

      if (dataToAdd.length > 0) {
        this.logInfo(
          `Adding ${dataToAdd.length} media items to '${
            collection.manualCollection
              ? collection.manualCollectionName
              : collection.title
          }'.`,
        );
      }

      collection = await this.collectionService.relinkManualCollection(
        collection,
      );

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
      this.logInfo(`collection not found with id ${rulegroup.collectionId}`);
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
      this.plexDataType,
    );
    if (response) {
      this.plexData.data = response.items ? response.items : [];

      if ((+this.plexData.page + 1) * size >= response.totalSize) {
        this.plexData.finished = true;
      }
    } else {
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
      data = _.cloneDeep(this.plexData.data);
    } else {
      data = _.cloneDeep(this.workerData);
    }
    // for (const [index, el] of data.entries()) {
    for (let i = data.length - 1; i >= 0; i--) {
      firstVal = await this.valueGetter.get(
        rule.firstVal,
        data[i],
        this.plexDataType,
      );
      if (rule.lastVal) {
        secondVal = await this.valueGetter.get(
          rule.lastVal,
          data[i],
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
      }
      if (
        (firstVal !== undefined || null) &&
        (secondVal !== undefined || null)
      ) {
        if (isNull(rule.operator) || rule.operator === RuleOperators.OR) {
          if (this.doRuleAction(firstVal, secondVal, rule.action)) {
            // add to workerdata if not yet available
            if (
              this.workerData.find((e) => e.ratingKey === data[i].ratingKey) ===
              undefined
            ) {
              this.workerData.push(data[i]);
            }
          }
        } else {
          if (!this.doRuleAction(firstVal, secondVal, rule.action)) {
            // remove from workerdata
            this.workerData.splice(i, 1);
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
        if (val1.length > 0) {
          return val1.every((e) => {
            if (Array.isArray(val2)) {
              return (val2 as unknown as T[]).includes(e);
            } else {
              return e === val2;
            }
          });
        } else {
          return false;
        }
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
    if (action === RulePossibility.NOT_CONTAINS) {
      try {
        if (!Array.isArray(val2)) {
          return !(val1 as unknown as T[]).includes(val2);
        } else {
          if (val2.length > 0) {
            const test = val2.every((el) => {
              return !(val1 as unknown as T[]).includes(el);
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

  private async logInfo(message: string) {
    this.logger.log(message);
  }
}
