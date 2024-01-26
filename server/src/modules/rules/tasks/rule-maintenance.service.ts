import { Injectable, Logger } from '@nestjs/common';
import { TasksService } from '../../tasks/tasks.service';
import { SettingsService } from '../../settings/settings.service';
import { RulesService } from '../rules.service';
import { PlexApiService } from '../../api/plex-api/plex-api.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection } from '../../collections/entities/collection.entities';
import { TaskBase } from '../../tasks/task.base';

@Injectable()
export class RuleMaintenanceService extends TaskBase {
  protected logger = new Logger(RuleMaintenanceService.name);

  protected name = 'Rule Maintenance';
  protected cronSchedule = '20 4 * * *';

  constructor(
    protected readonly taskService: TasksService,
    private readonly settings: SettingsService,
    private readonly rulesService: RulesService,
    @InjectRepository(Collection)
    private readonly collectionRepo: Repository<Collection>,
    private readonly plexApi: PlexApiService,
  ) {
    super(taskService);
  }

  public async execute() {
    await super.execute();
    try {
      this.logger.log('Starting maintenance');
      const appStatus = await this.settings.testConnections();

      if (appStatus) {
        // remove media exclusions that are no longer available
        this.removeLeftoverExclusions();
        this.removeCollectionsWithoutRule();
        this.logger.log('Maintenance done');
      } else {
        this.logger.error(
          `Maintenance skipped, not all applications were reachable.`,
        );
      }
    } catch (e) {
      this.logger.error(`Rule Maintenance failed : ${e.message}`);
    }
    this.finish();
  }

  private async removeLeftoverExclusions() {
    // get all exclusions
    const exclusions = await this.rulesService.getAllExclusions();
    // loop through exclusions
    for (const exclusion of exclusions) {
      // check if media still exists
      const resp = await this.plexApi.getMetadata(exclusion.plexId.toString());
      // remove when not
      if (!resp?.ratingKey) {
        this.rulesService.removeExclusion(exclusion.id);
      }
    }
  }

  private async removeCollectionsWithoutRule() {
    try {
      const collections = await this.collectionRepo.find(); // get all collections
      const rulegroups = await this.rulesService.getRuleGroups();

      for (const collection of collections) {
        if (
          !rulegroups.find(
            (rulegroup) => rulegroup.collection?.id === collection.id,
          )
        ) {
          await this.collectionRepo.delete({ id: collection.id });
        }
      }
    } catch (err) {
      this.logger.warn("Couldn't remove collection without rule: ");
      this.logger.debug(err);
    }
  }
}
