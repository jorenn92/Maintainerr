import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { StatusService } from './status.service';
import { TasksService } from './tasks.service';
import { TaskRunning } from '../tasks/entities/task_running.entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([TaskRunning])],
  providers: [TasksService, StatusService],
  exports: [TasksService],
})
export class TasksModule {}
