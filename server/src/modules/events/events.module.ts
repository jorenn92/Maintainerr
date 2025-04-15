import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';

@Module({
  providers: [],
  exports: [],
  controllers: [EventsController],
})
export class EventsModule {}
