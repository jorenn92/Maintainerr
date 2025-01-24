import axios from 'axios';
import { hasNotificationType } from '../notifications.service';
import type { NotificationAgent, NotificationPayload } from './agent';
import { SettingsService } from '../../settings/settings.service';
import { Logger } from '@nestjs/common';
import {
  NotificationAgentKey,
  NotificationAgentPushbullet,
  NotificationType,
} from '../notifications-interfaces';
import { Notification } from '../entities/notification.entities';

interface PushbulletPayload {
  type: string;
  title: string;
  body: string;
  channel_tag?: string;
}

class PushbulletAgent implements NotificationAgent {
  public constructor(
    private readonly appSettings: SettingsService,
    private readonly settings: NotificationAgentPushbullet,
    readonly notification: Notification,
  ) {
    this.notification = notification;
  }

  private readonly logger = new Logger(PushbulletAgent.name);

  getNotification = () => this.notification;

  getSettings = () => this.settings;

  getIdentifier = () => NotificationAgentKey.PUSHBULLET;

  public shouldSend(): boolean {
    return true;
  }

  private getNotificationPayload(
    type: NotificationType,
    payload: NotificationPayload,
  ): PushbulletPayload {
    const title = payload.event
      ? `${payload.event} - ${payload.subject}`
      : payload.subject;
    let body = payload.message ?? '';

    for (const extra of payload.extra ?? []) {
      body += `\n${extra.name}: ${extra.value}`;
    }

    return {
      type: 'note',
      title,
      body,
    };
  }

  public async send(
    type: NotificationType,
    payload: NotificationPayload,
  ): Promise<boolean> {
    const settings = this.getSettings();
    const endpoint = 'https://api.pushbullet.com/v2/pushes';
    const notificationPayload = this.getNotificationPayload(type, payload);

    // Send system notification
    if (
      payload.notifySystem &&
      hasNotificationType(type, settings.types ?? [0]) &&
      settings.enabled &&
      settings.options.accessToken
    ) {
      this.logger.debug('Sending Pushbullet notification', {
        label: 'Notifications',
        type: NotificationType[type],
        subject: payload.subject,
      });

      try {
        await axios.post(
          endpoint,
          { ...notificationPayload, channel_tag: settings.options.channelTag },
          {
            headers: {
              'Access-Token': settings.options.accessToken as string,
            },
          },
        );
      } catch (e) {
        this.logger.error('Error sending Pushbullet notification');
        this.logger.debug(e);

        return false;
      }
    }

    if (settings.options.accessToken) {
      this.logger.log('Sending Pushbullet notification');

      try {
        await axios.post(endpoint, notificationPayload, {
          headers: {
            'Access-Token': settings.options.accessToken as string,
          },
        });
      } catch (e) {
        this.logger.error('Error sending Pushbullet notification');
        this.logger.debug(e);

        return false;
      }
    }

    return true;
  }
}

export default PushbulletAgent;
