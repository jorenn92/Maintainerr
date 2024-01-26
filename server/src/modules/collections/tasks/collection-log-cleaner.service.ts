import { Injectable, Logger } from '@nestjs/common';
import { CollectionsService } from '../../collections/collections.service';
import { TaskBase } from '../../tasks/task.base';
import { TasksService } from '../..//tasks/tasks.service';

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

  public async execute() {
    try {
      await super.execute();

      // start execution
      // get all collections
      const collections = await this.collectionService.getAllCollections();

      // for each collection
      for (const collection of collections) {
        this.collectionService.removeOldCollectionLogs(collection);
      }

      // clean up
      this.finish();
    } catch (e) {
      this.logger.debug(e);
      this.finish();
    }
  }
}
