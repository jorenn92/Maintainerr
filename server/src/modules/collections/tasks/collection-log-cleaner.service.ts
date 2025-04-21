import { Injectable, Logger } from '@nestjs/common';
import { TasksService } from '../..//tasks/tasks.service';
import { CollectionsService } from '../../collections/collections.service';
import { TaskBase } from '../../tasks/task.base';

@Injectable()
export class CollectionLogCleanerService extends TaskBase {
  protected logger = new Logger(CollectionLogCleanerService.name);

  protected name = 'Collection Log Cleaner';
  protected cronSchedule = '45 5 * * *';

  constructor(
    private readonly collectionService: CollectionsService,
    protected readonly taskService: TasksService,
  ) {
    super(taskService);
  }

  protected async executeTask() {
    try {
      // start execution
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
