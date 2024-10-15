import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { NotificationType } from './notifications-interfaces';

@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('/test')
  public async sendNotification() {
    // this.notificationService.handleNotification(NotificationType.TEST_NOTIFICATION, null);
    this.notificationService.handleNotification(
      NotificationType.MEDIA_HANDLED,
      [{ plexId: 22423 }, { plexId: 22424 }], 'My name is Josh', 7
    );
  }

  @Get('/agents')
  getNotificationAgents() {
    return this.notificationService.getAgentSpec();
  }

  @Get('/types')
  getNotificationTypes() {
    return this.notificationService.getTypes();
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

  @Post('/configuration/connect')
  async connectNotificationConfiguration(
    @Body()
    payload: {
      rulegroupId: number;
      notificationId: number;
    },
  ) {
    return this.notificationService.connectNotificationConfigurationToRule(
      payload,
    );
  }

  @Post('/configuration/disconnect')
  async disconnectionNotificationConfiguration(
    @Body()
    payload: {
      rulegroupId: number;
      notificationId: number;
    },
  ) {
    return this.notificationService.disconnectNotificationConfigurationFromRule(
      payload,
    );
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
