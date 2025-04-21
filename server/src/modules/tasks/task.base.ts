import {
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { delay } from '../../utils/delay';
import { TasksService } from './tasks.service';

export abstract class TaskBase
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  protected logger = new Logger(TaskBase.name);
  private jobCreationAttempts = 0;
  protected name = '';
  protected cronSchedule = '';
  private abortController: AbortController | undefined;

  constructor(protected readonly taskService: TasksService) {}

  onApplicationBootstrap() {
    this.jobCreationAttempts++;
    this.onBootstrapHook();
    const state = this.taskService.createJob(
      this.name,
      this.cronSchedule,
      this.execute.bind(this),
      true,
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

  async onApplicationShutdown() {
    this.abortController?.abort();

    if (!(await this.isRunning())) return;

    this.logger.log(`Stopping the ${this.name} task`);

    while (await this.isRunning()) {
      await delay(1000);
    }

    // TODO Some max wait time?

    this.logger.log(`Task ${this.name} stopped`);
  }

  // implement this on subclasses to do things in onApplicationBootstrap
  protected onBootstrapHook() {}

  public async stopExecution() {
    if (!(await this.isRunning()) || this.abortController.signal.aborted)
      return;

    this.logger.log(`Requesting to stop the ${this.name} task`);
    this.abortController?.abort();

    while (await this.isRunning()) {
      await delay(1000);
    }

    this.logger.log(`Task ${this.name} stopped by request`);
  }

  public async execute(abortController?: AbortController) {
    if (await this.isRunning()) {
      this.logger.log(
        `Another instance of the ${this.name} task is currently running. Skipping this execution`,
      );
      return;
    }

    this.abortController = abortController || new AbortController();
    await this.taskService.setRunning(this.name);

    try {
      abortController?.signal.throwIfAborted();
      await this.executeTask(this.abortController.signal);
    } finally {
      await this.finish();
    }
  }

  protected abstract executeTask(abortSignal: AbortSignal): Promise<void>;

  private finish = async () => {
    this.abortController = undefined;
    await this.taskService.clearRunning(this.name);
  };

  public updateJob(cron: string) {
    return this.taskService.updateJob(this.name, cron, this.execute.bind(this));
  }

  public async isRunning() {
    return await this.taskService.isRunning(this.name);
  }
}
