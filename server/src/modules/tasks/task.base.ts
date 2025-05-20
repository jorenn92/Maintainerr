import { OnApplicationBootstrap } from '@nestjs/common';
import { delay } from '../../utils/delay';
import { MaintainerrLogger } from '../logging/logs.service';
import { TasksService } from './tasks.service';

export abstract class TaskBase implements OnApplicationBootstrap {
  private jobCreationAttempts = 0;
  protected name = '';
  protected cronSchedule = '';

  constructor(
    protected readonly taskService: TasksService,
    protected readonly logger: MaintainerrLogger,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.onBootstrapHook();

    new Promise<void>(async (resolve, reject) => {
      while (this.jobCreationAttempts < 3) {
        this.jobCreationAttempts++;
        const state = await this.taskService.createJob(
          this.name,
          this.cronSchedule,
          this.execute.bind(this),
        );

        if (state.code === 1) {
          resolve();
          return;
        }

        if (this.jobCreationAttempts < 3) {
          this.logger.warn(
            `Creation of ${this.name} task failed. Retrying in 10s... (Attempt ${this.jobCreationAttempts}/3)`,
          );

          await delay(10_000);
        }
      }

      reject();
    }).catch((err) => {
      this.logger.error(
        `Creation of ${this.name} task failed after 3 attempts.`,
        err,
      );
    });
  }

  // implement this on subclasses to do things in onApplicationBootstrap
  protected onBootstrapHook() {}

  public async execute() {
    await this.prepare();
  }

  protected prepare = async () => {
    await this.taskService.setRunning(this.name);
  };

  protected finish = async () => {
    await this.taskService.clearRunning(this.name);
  };

  public updateJob(cron: string) {
    return this.taskService.updateJob(this.name, cron, this.execute.bind(this));
  }

  public async isRunning() {
    return await this.taskService.isRunning(this.name);
  }
}
