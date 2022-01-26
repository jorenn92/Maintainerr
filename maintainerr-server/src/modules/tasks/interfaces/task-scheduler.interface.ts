import { CronExpression } from '@nestjs/schedule';
import { Status } from './status.interface';

export interface TaskScheduler {
  createJob(
    name: string,
    cronExp: CronExpression | string,
    task: () => void,
  ): Status;
  updateJob(
    name: string,
    cronExp: CronExpression | string,
    task: () => void,
  ): Status;
  handleJob(name: string): Status;
  removeJob(name: string): Status;
}
