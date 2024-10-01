import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  NotificationTypes,
  NotificationService,
} from './notifications.service';

@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('/send')
  public sendNotification() {
    this.notificationService.sendNotification(NotificationTypes.MEDIA_HANDLED, {
      subject: 'test',
      notifySystem: true,
      message: 'This is a test message',
    });
  }

  @Get('/agents')
  getNotificationAgents() {
    return this.notificationService.getAgentSpec();
  }

  @Post('/configuration/add')
  async addNotificationConfiguration(
    @Body()
    payload: {
      agent: string;
      name: string;
      enabled: boolean;
      types: number[];
      options: {};
    },
  ) {
    return this.notificationService.addNotificationConfiguration(payload);
  }

  @Get('/configurations')
  async getNotificationConfigurations() {
    return this.notificationService.getNotificationConfigurations();
  }

  @Delete('/configuration/:id')
  async deleteNotificationConfiguration(@Param('id') notificationId: number) {
    return this.notificationService.deleteNotificationConfiguration(
      notificationId,
    );
  }
}
