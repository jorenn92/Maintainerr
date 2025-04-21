import { Injectable, Logger } from '@nestjs/common';
import { Mocked, TestBed } from '@suites/unit';
import { delay } from '../../utils/delay';
import { TaskBase } from './task.base';
import { TasksService } from './tasks.service';

@Injectable()
class TestTask extends TaskBase {
  protected logger = new Logger(TestTask.name);
  protected name = 'Test Task';
  protected cronSchedule = '0 0 0 0 0';
  public hasBootstraped = false;
  public hasAbortedDueToSignal = false;
  public taskCompleted = false;

  constructor(protected readonly taskService: TasksService) {
    super(taskService);
  }

  public async executeTask(abortSignal: AbortSignal): Promise<void> {
    // Simulate task execution
    await delay(5000);

    if (abortSignal.aborted) {
      this.hasAbortedDueToSignal = true;
      return;
    }

    this.taskCompleted = true;
  }

  public onBootstrapHook(): void {
    this.hasBootstraped = true;
  }
}

jest.useFakeTimers();

describe('TaskBase', () => {
  let task: TestTask;
  let tasksService: Mocked<TasksService>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(TestTask).compile();

    task = unit;
    tasksService = unitRef.get(TasksService);
  });

  it('should create a job on application bootstrap', () => {
    tasksService.createJob.mockReturnValue({ code: 0, message: 'OK' });

    task.onApplicationBootstrap();

    expect(tasksService.createJob).toHaveBeenCalledWith(
      'Test Task',
      '0 0 0 0 0',
      expect.any(Function),
      true,
    );
    expect(task.hasBootstraped).toBe(true);
  });

  it('should retry job creation 3 more times if it fails', () => {
    tasksService.createJob.mockReturnValue({ code: 0, message: 'Error' });

    task.onApplicationBootstrap();

    expect(tasksService.createJob).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(10000);
    expect(tasksService.createJob).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(10000);
    expect(tasksService.createJob).toHaveBeenCalledTimes(3);

    jest.advanceTimersByTime(10000);
    expect(tasksService.createJob).toHaveBeenCalledTimes(4);

    // Should have stopped retrying now
    jest.advanceTimersByTime(10000);
    expect(tasksService.createJob).toHaveBeenCalledTimes(4);
  });

  it('should stop execution when requested', async () => {
    tasksService.isRunning
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const taskPromise = task.execute();
    await jest.advanceTimersByTimeAsync(1);
    expect(task.hasAbortedDueToSignal).toBe(false);
    const stopPromise = task.stopExecution();
    await jest.advanceTimersByTimeAsync(5000);
    await taskPromise;
    expect(task.hasAbortedDueToSignal).toBe(true);
    await stopPromise;

    expect(task.taskCompleted).toBe(false);
    expect(tasksService.clearRunning).toHaveBeenCalledWith('Test Task');
  });

  it('should stop execution when shutting down', async () => {
    tasksService.isRunning
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const taskPromise = task.execute();
    await jest.advanceTimersByTimeAsync(1);
    expect(task.hasAbortedDueToSignal).toBe(false);
    const shutdownPromise = task.onApplicationShutdown();
    await jest.advanceTimersByTimeAsync(5000);
    await taskPromise;
    expect(task.hasAbortedDueToSignal).toBe(true);
    await shutdownPromise;

    expect(task.taskCompleted).toBe(false);
    expect(tasksService.clearRunning).toHaveBeenCalledWith('Test Task');
  });

  it('should log and skip execution if already running', async () => {
    tasksService.isRunning.mockResolvedValue(true);
    const logSpy = jest.spyOn(task['logger'], 'log');
    await task.execute();
    expect(logSpy).toHaveBeenCalledWith(
      'Another instance of the Test Task task is currently running. Skipping this execution',
    );
  });

  it('should execute the task and clear running state', async () => {
    const taskPromise = task.execute();
    await jest.advanceTimersByTimeAsync(1);
    expect(tasksService.setRunning).toHaveBeenCalledWith('Test Task');
    await jest.runAllTimersAsync();
    await taskPromise;
    expect(task.taskCompleted).toBe(true);
    expect(task.hasAbortedDueToSignal).toBe(false);
    expect(tasksService.clearRunning).toHaveBeenCalledWith('Test Task');
  });

  it('should update the job schedule', () => {
    task.updateJob('0 0 * * *');
    expect(tasksService.updateJob).toHaveBeenCalledWith(
      'Test Task',
      '0 0 * * *',
      expect.any(Function),
    );
  });
});
