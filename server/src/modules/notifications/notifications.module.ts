import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entities';
import { RuleGroup } from '../rules/entities/rule-group.entities';
import { PlexApiModule } from '../api/plex-api/plex-api.module';

@Module({
  imports: [PlexApiModule, TypeOrmModule.forFeature([Notification, RuleGroup])],
  providers: [NotificationService],
  controllers: [NotificationsController],
  exports: [NotificationService],
})
export class NotificationsModule {}
