import { CronExpression } from '@nestjs/schedule';
import { Status } from './status.interface';

export interface TaskScheduler {
  createJob(
    name: string,
    cronExp: CronExpression | string,
    task: () => void,
  ): Promise<Status>;
  updateJob(
    name: string,
    cronExp: CronExpression | string,
    task: () => void,
  ): Promise<Status>;
  handleJob(name: string): Status;
  removeJob(name: string): Status;
}
