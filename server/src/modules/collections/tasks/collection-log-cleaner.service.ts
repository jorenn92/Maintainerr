import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { CollectionsService } from 'src/modules/collections/collections.service';
import { TasksService } from 'src/modules/tasks/tasks.service';

@Injectable()
export class CollectionLogCleanerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CollectionLogCleanerService.name);
  private jobCreationAttempts = 0;

  constructor(
    private readonly collectionService: CollectionsService,
    private readonly taskService: TasksService,
  ) {}

  onApplicationBootstrap() {
    this.jobCreationAttempts++;
    const state = this.taskService.createJob(
      'Collection Log Cleaner',
      '45 5 * * *',
      this.execute.bind(this),
    );
    if (state.code === 0) {
      if (this.jobCreationAttempts <= 3) {
        this.logger.log(
          'Creation of job Collection Log Cleaner failed. Retrying in 10s..',
        );
        setTimeout(() => {
          this.onApplicationBootstrap();
        }, 10000);
      } else {
        this.logger.error(`Creation of job Collection Log Cleaner failed.`);
      }
    }
  }

  public async execute() {
    try {
      // get all collections
      const collections = await this.collectionService.getAllCollections();

      // for each collection
      for (const collection of collections) {
        this.collectionService.removeOldCollectionLogs(collection);
      }
    } catch (e) {
      this.logger.debug(e);
    }
  }
}
