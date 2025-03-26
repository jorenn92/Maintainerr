import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  providers: [EventsService],
  exports: [EventsService],
  controllers: [EventsController],
})
export class EventsModule {}
