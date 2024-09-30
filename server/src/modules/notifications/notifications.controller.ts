import { Controller, Get, Post } from '@nestjs/common';
import { Notification, NotificationService } from './notifications.service';
import DiscordAgent from './agents/discord';
import { SettingsService } from '../settings/settings.service';
import PushoverAgent from './agents/pushover';

@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService, private readonly settingsService: SettingsService) {}

  @Post('/send')
  public sendNotification() {
    this.notificationService.registerAgents([new PushoverAgent(this.settingsService)]);
    this.notificationService.sendNotification(Notification.MEDIA_HANDLED, {
      subject: 'test',
      notifySystem: true,
      message: 'This is a test message',
    });
  }
}
