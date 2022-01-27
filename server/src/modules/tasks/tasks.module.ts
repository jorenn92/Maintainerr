import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { StatusService } from './status.service';
import { TasksService } from './tasks.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [TasksService, StatusService],
  exports: [TasksService],
})
export class TasksModule {}
