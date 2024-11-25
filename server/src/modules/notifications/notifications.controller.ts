import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { NotificationType } from './notifications-interfaces';

@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('/test')
  public async sendTestNotification() {
    this.notificationService.handleNotification(
      NotificationType.TEST_NOTIFICATION,
      null,
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
      id?: number;
      agent: string;
      name: string;
      enabled: boolean;
      types: number[];
      aboutScale: number;
      options: object;
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
