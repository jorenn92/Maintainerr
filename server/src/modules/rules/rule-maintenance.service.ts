import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { SettingsService } from '../settings/settings.service';
import { RulesService } from './rules.service';
import { PlexApiService } from '../api/plex-api/plex-api.service';

@Injectable()
export class RuleMaintenanceService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RuleMaintenanceService.name);
  private jobCreationAttempts = 0;

  constructor(
    private readonly taskService: TasksService,
    private readonly settings: SettingsService,
    private readonly rulesService: RulesService,
    private readonly plexApi: PlexApiService,
  ) {}

  onApplicationBootstrap() {
    this.jobCreationAttempts++;
    const state = this.taskService.createJob(
      'RuleMaintenance',
      '30 3 * * 2',
      this.execute.bind(this),
    );
    if (state.code === 0) {
      if (this.jobCreationAttempts <= 3) {
        this.logger.log(
          'Creation of job RuleMaintenance failed. Retrying in 10s..',
        );
        setTimeout(() => {
          this.onApplicationBootstrap();
        }, 10000);
      } else {
        this.logger.error(`Creation of job RuleMaintenance failed.`);
      }
    }
  }

  private async execute() {
    try {
      this.logger.log('Starting maintenance');
      const appStatus = await this.settings.testConnections();

      if (appStatus) {
        // remove media exclusions that are no longer available
        this.removeLeftoverExclusions();
      }
    } catch (e) {
      this.logger.error(`RuleMaintenance failed : ${e.message}`);
    }
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
}
