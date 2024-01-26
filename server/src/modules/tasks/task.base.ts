import { Logger, OnApplicationBootstrap } from '@nestjs/common';
import { TasksService } from './tasks.service';

export class TaskBase implements OnApplicationBootstrap {
  protected logger = new Logger(TaskBase.name);
  private jobCreationAttempts = 0;
  protected name = '';
  protected cronSchedule = '';

  constructor(protected readonly taskService: TasksService) {}

  onApplicationBootstrap() {
    this.jobCreationAttempts++;
    this.onBootstrapHook();
    const state = this.taskService.createJob(
      this.name,
      this.cronSchedule,
      this.execute.bind(this),
    );
    if (state.code === 0) {
      if (this.jobCreationAttempts <= 3) {
        this.logger.log(
          `Creation of ${this.name} task failed. Retrying in 10s..`,
        );
        setTimeout(() => {
          this.onApplicationBootstrap();
        }, 10000);
      } else {
        this.logger.error(`Creation of ${this.name} task failed.`);
      }
    }
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

  protected async isRunning() {
    return await this.taskService.isRunning(this.name);
  }
}
