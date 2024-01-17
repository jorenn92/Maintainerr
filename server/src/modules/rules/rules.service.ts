import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Connection, Repository } from 'typeorm';
import { PlexApiService } from '../api/plex-api/plex-api.service';
import { CollectionsService } from '../collections/collections.service';
import { Collection } from '../collections/entities/collection.entities';
import { CollectionMedia } from '../collections/entities/collection_media.entities';
import {
  Application,
  Property,
  RuleConstants,
  RulePossibility,
} from './constants/rules.constants';
import { CommunityRule } from './dtos/communityRule.dto';
import { ExclusionContextDto } from './dtos/exclusion.dto';
import { RuleDto } from './dtos/rule.dto';
import { RuleDbDto } from './dtos/ruleDb.dto';
import { RulesDto } from './dtos/rules.dto';
import { CommunityRuleKarma } from './entities/community-rule-karma.entities';
import { Exclusion } from './entities/exclusion.entities';
import { RuleGroup } from './entities/rule-group.entities';
import { Rules } from './entities/rules.entities';
import { EPlexDataType } from '../api/plex-api/enums/plex-data-type-enum';
import { Settings } from '../settings/entities/settings.entities';
import _ from 'lodash';
import { AddCollectionMedia } from '../collections/interfaces/collection-media.interface';
import { RuleYamlService } from './helpers/yaml.service';
import { RuleComparatorService } from './helpers/rule.comparator.service';
import { PlexLibraryItem } from '../api/plex-api/interfaces/library.interfaces';

export interface ReturnStatus {
  code: 0 | 1;
  result?: string;
  message?: string;
}

@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);
  private readonly communityUrl = 'https://jsonbin.org/maintainerr/rules';
  private readonly key = 'e26bd648-2bb5-4092-b4f1-90d8bc9e3148';

  ruleConstants: RuleConstants;
  constructor(
    @InjectRepository(Rules)
    private readonly rulesRepository: Repository<Rules>,
    @InjectRepository(RuleGroup)
    private readonly ruleGroupRepository: Repository<RuleGroup>,
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(CollectionMedia)
    private readonly collectionMediaRepository: Repository<CollectionMedia>,
    @InjectRepository(CommunityRuleKarma)
    private readonly communityRuleKarmaRepository: Repository<CommunityRuleKarma>,
    @InjectRepository(Exclusion)
    private readonly exclusionRepo: Repository<Exclusion>,
    @InjectRepository(Settings)
    private readonly settingsRepo: Repository<Settings>,
    private readonly collectionService: CollectionsService,
    private readonly plexApi: PlexApiService,
    private readonly connection: Connection,
    private readonly ruleYamlService: RuleYamlService,
    private readonly RuleComparatorService: RuleComparatorService,
  ) {
    this.ruleConstants = new RuleConstants();
  }
  async getRuleConstants(): Promise<RuleConstants> {
    const settings = await this.settingsRepo.findOne({ where: {} });
    const localConstants = _.cloneDeep(this.ruleConstants);
    if (settings) {
      // remove overseerr if not configured
      if (!settings.overseerr_api_key || !settings.overseerr_url) {
        localConstants.applications = localConstants.applications.filter(
          (el) => el.id !== Application.OVERSEERR,
        );
      }

      // remove radarr if not configured
      if (!settings.radarr_url || !settings.radarr_api_key) {
        localConstants.applications = localConstants.applications.filter(
          (el) => el.id !== Application.RADARR,
        );
      }

      // remove sonarr if not configured
      if (!settings.sonarr_url || !settings.sonarr_api_key) {
        localConstants.applications = localConstants.applications.filter(
          (el) => el.id !== Application.SONARR,
        );
      }
    }

    return localConstants;
  }
  async getRules(ruleGroupId: string): Promise<Rules[]> {
    try {
      return await this.connection
        .getRepository(Rules)
        .createQueryBuilder('rules')
        .where('ruleGroupId = :id', { id: ruleGroupId })
        .getMany();
    } catch (e) {
      this.logger.warn(`Rules - Action failed : ${e.message}`);
      this.logger.debug(e);
      return undefined;
    }
  }
  async getRuleGroups(
    activeOnly = false,
    libraryId?: number,
    typeId?: number,
  ): Promise<RulesDto[]> {
    try {
      const rulegroups = await this.connection
        .createQueryBuilder('rule_group', 'rg')
        .innerJoinAndSelect('rg.rules', 'r')
        .orderBy('r.id')
        .innerJoinAndSelect('rg.collection', 'c')
        .where(
          activeOnly ? 'rg.isActive = true' : 'rg.isActive in (true, false)',
        )
        .andWhere(
          libraryId !== undefined
            ? `rg.libraryId = ${libraryId}`
            : typeId !== undefined
              ? `c.type = ${typeId}`
              : 'rg.libraryId != -1',
        )
        // .where(typeId !== undefined ? `c.type = ${typeId}` : '')
        .getMany();
      return rulegroups as RulesDto[];
    } catch (e) {
      this.logger.warn(`Rules - Action failed : ${e.message}`);
      this.logger.debug(e);
      return undefined;
    }
  }

  async getRuleGroupById(ruleGroupId: number): Promise<RuleGroup> {
    try {
      return await this.ruleGroupRepository.findOne({
        where: { id: ruleGroupId },
      });
    } catch (e) {
      this.logger.warn(`Rules - Action failed : ${e.message}`);
      this.logger.debug(e);
      return undefined;
    }
  }

  async getRuleGroupByCollectionId(id: number) {
    try {
      return await this.ruleGroupRepository.findOne({
        where: { collectionId: id },
      });
    } catch (e) {
      this.logger.warn(`Rules - Action failed : ${e.message}`);
      this.logger.debug(e);
      return undefined;
    }
  }

  async deleteRuleGroup(ruleGroupId: number): Promise<ReturnStatus> {
    try {
      const group = await this.ruleGroupRepository.findOne({
        where: { id: ruleGroupId },
      });

      await this.exclusionRepo.delete({ ruleGroupId: ruleGroupId });
      await this.ruleGroupRepository.delete(ruleGroupId);

      if (group.collectionId) {
        // DB cascade doesn't work.. So do it manually
        await this.collectionService.deleteCollection(group.collectionId);
      }
      this.logger.log(
        `Removed rulegroup with id ${ruleGroupId} from the database`,
      );
      return this.createReturnStatus(true, 'Success');
    } catch (err) {
      this.logger.warn('Rulegroup deletion failed');
      this.logger.debug(err);
      return this.createReturnStatus(false, 'Delete Failed');
    }
  }

  async setRules(params: RulesDto) {
    try {
      let state: ReturnStatus = this.createReturnStatus(true, 'Success');
      params.rules.forEach((rule) => {
        if (state.code === 1) {
          state = this.validateRule(rule);
        }
      }, this);

      if (state.code === 1) {
        // create the collection
        const lib = (await this.plexApi.getLibraries()).find(
          (el) => +el.key === +params.libraryId,
        );
        const collection = (
          await this.collectionService.createCollection({
            libraryId: +params.libraryId,
            type:
              lib.type === 'movie'
                ? EPlexDataType.MOVIES
                : params.dataType !== undefined
                  ? params.dataType
                  : EPlexDataType.SHOWS,
            title: params.name,
            description: params.description,
            arrAction: params.arrAction ? params.arrAction : 0,
            isActive: params.isActive,
            listExclusions: params.listExclusions
              ? params.listExclusions
              : false,
            forceOverseerr: params.forceOverseerr
              ? params.forceOverseerr
              : false,
            visibleOnHome: params.collection?.visibleOnHome,
            deleteAfterDays: +params.collection?.deleteAfterDays,
            manualCollection: params.collection?.manualCollection,
            manualCollectionName: params.collection?.manualCollectionName,
          })
        ).dbCollection;
        // create group
        const groupId = await this.createNewGroup(
          params.name,
          params.description,
          params.libraryId,
          collection.id,
          params.useRules !== undefined ? params.useRules : true,
          params.isActive !== undefined ? params.isActive : true,
          params.dataType !== undefined ? params.dataType : undefined,
        );
        // create rules
        if (params.useRules) {
          for (const rule of params.rules) {
            const ruleJson = JSON.stringify(rule);
            await this.rulesRepository.save([
              {
                ruleJson: ruleJson,
                ruleGroupId: groupId,
                section: (rule as RuleDbDto).section,
              },
            ]);
          }
        } else {
          // empty rule if not using rules
          await this.rulesRepository.save([
            {
              ruleJson: JSON.stringify(''),
              ruleGroupId: groupId,
              section: 0,
            },
          ]);
        }
        return state;
      } else {
        return state;
      }
    } catch (e) {
      this.logger.warn(`Rules - Action failed : ${e.message}`);
      this.logger.debug(e);
      return undefined;
    }
  }

  async setExclusion(data: ExclusionContextDto) {
    let handleMedia: AddCollectionMedia[] = [];

    if (data.collectionId) {
      const group = await this.ruleGroupRepository.findOne({
        where: {
          collectionId: data.collectionId,
        },
      });
      // get media
      handleMedia = (await this.plexApi.getAllIdsForContextAction(
        group ? group.dataType : undefined,
        data.context
          ? data.context
          : { type: group.dataType, id: data.mediaId },
        { plexId: data.mediaId },
      )) as unknown as AddCollectionMedia[];
      data.ruleGroupId = group.id;
    } else {
      // get type from metadata
      const metaData = await this.plexApi.getMetadata(data.mediaId.toString());
      const type =
        metaData.type === 'movie' ? EPlexDataType.MOVIES : EPlexDataType.SHOWS;

      handleMedia = (await this.plexApi.getAllIdsForContextAction(
        undefined,
        data.context ? data.context : { type: type, id: data.mediaId },
        { plexId: data.mediaId },
      )) as unknown as AddCollectionMedia[];
    }
    try {
      // add all items
      for (const media of handleMedia) {
        const metaData = await this.plexApi.getMetadata(
          media.plexId.toString(),
        );

        const old = await this.exclusionRepo.findOne({
          where: {
            plexId: media.plexId,
            ...(data.ruleGroupId !== undefined
              ? { ruleGroupId: data.ruleGroupId }
              : { ruleGroupId: null }),
          },
        });

        await this.exclusionRepo.save([
          {
            ...old,
            plexId: media.plexId,
            // ruleGroupId is only set if it's available
            ...(data.ruleGroupId !== undefined
              ? { ruleGroupId: data.ruleGroupId }
              : { ruleGroupId: null }),
            // set parent
            parent: data.mediaId ? data.mediaId : null,
            // set media type
            type:
              metaData.type === 'movie'
                ? 1
                : metaData.type === 'show'
                  ? 2
                  : metaData.type === 'season'
                    ? 3
                    : metaData.type === 'episode'
                      ? 4
                      : undefined,
          },
        ]);
        this.logger.log(
          `Added ${
            data.ruleGroupId === undefined ? 'global ' : ''
          }exclusion for media with id ${media.plexId} ${
            data.ruleGroupId !== undefined
              ? `and rulegroup id ${data.ruleGroupId}`
              : ''
          } `,
        );
      }

      return this.createReturnStatus(true, 'Success');
    } catch (e) {
      this.logger.warn(
        `Adding exclusion for Plex ID ${data.mediaId} and rulegroup id ${data.ruleGroupId} failed.`,
      );
      this.logger.debug(e);
      return this.createReturnStatus(false, 'Failed');
    }
  }

  async removeExclusion(id: number) {
    try {
      await this.exclusionRepo.delete(id);
      this.logger.log(`Removed exclusion with id ${id}`);
      return this.createReturnStatus(true, 'Success');
    } catch (e) {
      this.logger.warn(`Removing exclusion with id ${id} failed.`);
      this.logger.debug(e);
      return this.createReturnStatus(false, 'Failed');
    }
  }

  async removeExclusionWitData(data: ExclusionContextDto) {
    let handleMedia: AddCollectionMedia[] = [];

    if (data.collectionId) {
      const group = await this.ruleGroupRepository.findOne({
        where: {
          collectionId: data.collectionId,
        },
      });

      data.ruleGroupId = group.id;
      // get media
      handleMedia = (await this.plexApi.getAllIdsForContextAction(
        group ? group.dataType : undefined,
        data.context
          ? data.context
          : { type: group.libraryId, id: data.mediaId },
        { plexId: data.mediaId },
      )) as unknown as AddCollectionMedia[];
    } else {
      // get type from metadata
      handleMedia = (await this.plexApi.getAllIdsForContextAction(
        undefined,
        { type: data.context.type, id: data.context.id },
        { plexId: data.mediaId },
      )) as unknown as AddCollectionMedia[];
    }

    try {
      for (const media of handleMedia) {
        await this.exclusionRepo.delete({
          plexId: media.plexId,
          ...(data.ruleGroupId !== undefined
            ? { ruleGroupId: data.ruleGroupId }
            : {}),
        });
        this.logger.log(
          `Removed ${
            data.ruleGroupId === undefined ? 'global ' : ''
          }exclusion for media with id ${media.plexId} ${
            data.ruleGroupId !== undefined
              ? `and rulegroup id ${data.ruleGroupId}`
              : ''
          } `,
        );
      }
      return this.createReturnStatus(true, 'Success');
    } catch (e) {
      this.logger.warn(
        `Removing exclusion for media with id ${data.mediaId} failed.`,
      );
      this.logger.debug(e);
      return this.createReturnStatus(false, 'Failed');
    }
  }

  async removeAllExclusion(plexId: number) {
    // get type from metadata
    let handleMedia: AddCollectionMedia[] = [];

    const metaData = await this.plexApi.getMetadata(plexId.toString());
    const type =
      metaData.type === 'movie' ? EPlexDataType.MOVIES : EPlexDataType.SHOWS;

    handleMedia = (await this.plexApi.getAllIdsForContextAction(
      undefined,
      { type: type, id: plexId },
      { plexId: plexId },
    )) as unknown as AddCollectionMedia[];

    try {
      for (const media of handleMedia) {
        await this.exclusionRepo.delete({ plexId: media.plexId });
      }
      return this.createReturnStatus(true, 'Success');
    } catch (e) {
      this.logger.warn(`Removing all exclusions with plexId ${plexId} failed.`);
      this.logger.debug(e);
      return this.createReturnStatus(false, 'Failed');
    }
  }

  async getExclusions(
    rulegroupId?: number,
    plexId?: number,
  ): Promise<Exclusion[]> {
    try {
      if (rulegroupId || plexId) {
        let exclusions: Exclusion[] = [];
        if (rulegroupId) {
          exclusions = await this.exclusionRepo.find({
            where: { ruleGroupId: rulegroupId },
          });
        } else {
          exclusions = await this.exclusionRepo
            .createQueryBuilder('exclusion')
            .where('exclusion.plexId = :plexId OR exclusion.parent = :plexId', {
              plexId,
            })
            .getMany();
        }

        return rulegroupId
          ? exclusions.concat(
              await this.exclusionRepo.find({
                where: {
                  ruleGroupId: null,
                },
              }),
            )
          : exclusions;
      }
      return [];
    } catch (e) {
      this.logger.warn(`Rules - Action failed : ${e.message}`);
      this.logger.debug(e);
      return undefined;
    }
  }

  async getAllExclusions(): Promise<Exclusion[]> {
    try {
      return await this.exclusionRepo.find();
    } catch (e) {
      this.logger.warn(`Rules - Action failed : ${e.message}`);
      this.logger.debug(e);
      return [];
    }
  }

  private validateRule(rule: RuleDto): ReturnStatus {
    try {
      const val1: Property = this.ruleConstants.applications
        .find((el) => el.id === rule.firstVal[0])
        .props.find((el) => el.id === rule.firstVal[1]);
      if (rule.lastVal) {
        const val2: Property = this.ruleConstants.applications
          .find((el) => el.id === rule.lastVal[0])
          .props.find((el) => el.id === rule.lastVal[1]);
        if (val1.type === val2.type) {
          if (val1.type.possibilities.includes(+rule.action)) {
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
          if (val1.type.possibilities.includes(+rule.action)) {
            return this.createReturnStatus(true, 'Success');
          } else {
            return this.createReturnStatus(
              false,
              'Action is not supported on type',
            );
          }
        }
        if (
          (rule.action === RulePossibility.IN_LAST ||
            RulePossibility.IN_NEXT) &&
          rule.customVal.ruleTypeId === 0
        ) {
          return this.createReturnStatus(true, 'Success');
        } else {
          return this.createReturnStatus(false, 'Validation failed');
        }
      } else {
        return this.createReturnStatus(false, 'No second value found');
      }
    } catch (e) {
      this.logger.debug(e);
      return this.createReturnStatus(false, 'Unexpected error occurred');
    }
  }

  private createReturnStatus(succes: boolean, result: string): ReturnStatus {
    return { code: succes ? 1 : 0, result: result };
  }

  private async createNewGroup(
    name: string,
    description: string,
    libraryId: number,
    collectionId: number,
    useRules = true,
    isActive = true,
    dataType = undefined,
  ): Promise<number> {
    try {
      const groupId = await this.connection
        .createQueryBuilder()
        .insert()
        .into(RuleGroup)
        .values([
          {
            name: name,
            description: description,
            libraryId: +libraryId,
            collectionId: +collectionId,
            isActive: isActive,
            useRules: useRules,
            dataType: dataType,
          },
        ])
        .execute();
      return groupId.identifiers[0].id;
    } catch (e) {
      this.logger.warn(`Rules - Action failed : ${e.message}`);
      this.logger.debug(e);
      return undefined;
    }
  }

  async getCommunityRules(): Promise<CommunityRule[] | ReturnStatus> {
    return await axios
      .get(this.communityUrl, {
        headers: {
          Authorization: 'token ' + this.key,
        },
      })
      .then((response) => {
        return response.data as CommunityRule[];
      })
      .catch((e) => {
        this.logger.warn(
          `Rules - Loading community rules failed : ${e.message}`,
        );
        this.logger.debug(e);
        return this.createReturnStatus(false, 'Failed');
      });
  }

  public async addToCommunityRules(rule: CommunityRule): Promise<ReturnStatus> {
    const rules = await this.getCommunityRules();
    const appVersion = process.env.npm_package_version
      ? process.env.npm_package_version
      : '0.0.0';
    if (!('code' in rules)) {
      // Check if we got a CommunityRule[]
      if (
        (rules as CommunityRule[]).find((r) => r.name === rule.name) ===
        undefined
      ) {
        return axios
          .patch(
            this.communityUrl,
            { id: rules.length, karma: 0, appVersion: appVersion, ...rule },
            {
              headers: {
                Authorization: 'token ' + this.key,
              },
            },
          )
          .then(() => {
            this.logger.log(`Rules - successfully saved community rule`);
            return this.createReturnStatus(true, 'Succes');
          })
          .catch((e) => {
            if (e.message.includes('422')) {
              // Due to a bug in jsonbin, it returns the wrong status code
              this.logger.log(`Rules - successfully saved community rule`);
              return this.createReturnStatus(true, 'Succes');
            } else {
              this.logger.warn(
                `Rules - Saving community rule failed : ${e.message}`,
              );
              return this.createReturnStatus(
                false,
                'Saving community rule failed',
              );
            }
          });
      } else {
        this.logger.log(
          `Rules - Tried to register a community rule with a name that already exists, this is not allowed`,
        );
        return this.createReturnStatus(false, 'Name already exists');
      }
    } else {
      this.logger.warn(
        `Rules - There was a problem fetching the community rules JSON`,
      );
      return this.createReturnStatus(false, 'Connection failed');
    }
  }

  public async getCommunityRuleKarmaHistory(): Promise<CommunityRuleKarma[]> {
    return await this.communityRuleKarmaRepository.find();
  }

  public async updateCommunityRuleKarma(
    id: number,
    karma: number,
  ): Promise<ReturnStatus> {
    const rules = await this.getCommunityRules();
    const history = await this.communityRuleKarmaRepository.find({
      where: {
        community_rule_id: id,
      },
    });
    if (history.length <= 0) {
      if (!('code' in rules)) {
        if (karma <= 990) {
          if (rules.find((r) => r.id === id) === undefined) {
            this.logger.log(
              `Rules - Tried to edit the karma of rule with id ` +
                id +
                `, but it doesn't exist`,
            );
            return this.createReturnStatus(
              false,
              'Rule with given id does not exist',
            );
          }
          rules.map((r) => {
            if (r.id === id) {
              r.karma = karma;
            }
          });
          this.communityRuleKarmaRepository.save([
            {
              community_rule_id: id,
            },
          ]);
          return axios
            .post(this.communityUrl, rules, {
              headers: {
                Authorization: 'token ' + this.key,
              },
            })
            .then(() => {
              this.logger.log(
                `Rules - successfully updated community rule karma `,
              );
              return this.createReturnStatus(true, 'Succes');
            })
            .catch((e) => {
              if (e.message.includes('422')) {
                // Due to a bug in jsonbin, it returns the wrong status code
                this.logger.log(
                  `Rules - successfully updated community rule karma`,
                );
                return this.createReturnStatus(true, 'Succes');
              } else {
                this.logger.warn(
                  `Rules - Saving community rule failed : ${e.message}`,
                );
                return this.createReturnStatus(
                  false,
                  'Saving community rule failed',
                );
              }
            });
        } else {
          this.logger.log(`Rules - Max Karma reached for rule with id: ` + id);
          return this.createReturnStatus(true, 'Succes, but Max Karma reached');
        }
      } else {
        this.logger.warn(
          `Rules - There was a problem fetching the community rules JSON`,
        );
        return this.createReturnStatus(false, 'Connection failed');
      }
    } else {
      this.logger.log(`Rules - You can only update Karma of a rule once`);
      return this.createReturnStatus(
        false,
        'Already updated Karma for this rule',
      );
    }
  }

  public encodeToYaml(rules: RuleDto[], mediaType: number): ReturnStatus {
    return this.ruleYamlService.encode(rules, mediaType);
  }

  public decodeFromYaml(yaml: string, mediaType: number): ReturnStatus {
    return this.ruleYamlService.decode(yaml, mediaType);
  }

  public async testRuleGroupWithData(
    rulegroupId: number,
    mediaId: string,
  ): Promise<any> {
    const mediaResp = await this.plexApi.getMetadata(mediaId);
    const group = await this.getRuleGroupById(rulegroupId);
    if (group && mediaResp) {
      group.rules = await this.getRules(group.id.toString());
      const result = await this.RuleComparatorService.executeRulesWithData(
        group as RulesDto,
        [mediaResp as unknown as PlexLibraryItem],
        true,
      );
      return { code: 1, result: result.stats };
    }
    return { code: 0, result: 'Invalid input' };
  }
}
