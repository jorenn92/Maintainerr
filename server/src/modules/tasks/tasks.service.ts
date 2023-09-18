import { Injectable, Logger } from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { Status } from './interfaces/status.interface';
import { TaskScheduler } from './interfaces/task-scheduler.interface';
import { StatusService } from './status.service';

@Injectable()
export class TasksService implements TaskScheduler {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly status: StatusService,
  ) {}

  public createJob(
    name: string,
    cronExp: CronExpression | string,
    task: () => void,
  ): Status {
    try {
      const job = new CronJob(cronExp, () => {
        task();
      });

      this.schedulerRegistry.addCronJob(name, job);
      job.start();

      this.logger.log(`Task ${name} created successfully`);
      return this.status.createStatus(
        true,
        `Task ${name} created successfully`,
      );
    } catch (e) {
      this.logger.error(
        `An error occurred while creating the ${name} task. This is normal on first boot.`,
      );
      return this.status.createStatus(
        false,
        `An error occurred while creating the ${name} task`,
      );
    }
  }

  public updateJob(
    name: string,
    cronExp: CronExpression | string,
    task: () => void,
  ): Status {
    const output = this.removeJob(name);
    if (output.code === 1) {
      return this.createJob(name, cronExp, task);
    }
  }

  public handleJob(name: string): Status {
    try {
      const job = this.schedulerRegistry.getCronJob(name);
      job.start();
      return this.status.createStatus(
        true,
        `Task ${name} started successfully`,
      );
    } catch (e) {
      this.logger.error(
        `An error occurred while starting the ${name} task: ${e}`,
      );
      return this.status.createStatus(
        false,
        `An error occurred while starting the ${name} task`,
      );
    }
  }

  public removeJob(name: string): Status {
    try {
      this.schedulerRegistry.deleteCronJob(name);
      this.logger.warn(`job ${name} deleted!`);
      return this.status.createStatus(
        true,
        `Task ${name} removed successfully`,
      );
    } catch (e) {
      this.logger.error(
        `An error occurred while removing the ${name} task: ${e}`,
      );
      return this.status.createStatus(
        false,
        `An error occurred while removing the ${name} task`,
      );
    }
  }
}
