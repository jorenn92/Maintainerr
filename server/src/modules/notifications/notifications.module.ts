import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [NotificationService],
  controllers: [NotificationsController],
  exports: [NotificationService],
})
export class NotificationsModule {}
