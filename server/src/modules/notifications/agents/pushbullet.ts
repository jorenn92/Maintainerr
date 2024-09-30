import axios from 'axios';
import { hasNotificationType, Notification } from '../notifications.service';
import type { NotificationAgent, NotificationPayload } from './agent';
import { SettingsService } from '../../settings/settings.service';
import { Logger } from '@nestjs/common';

interface PushbulletPayload {
  type: string;
  title: string;
  body: string;
  channel_tag?: string;
}

class PushbulletAgent implements NotificationAgent {
  public constructor(private readonly settings: SettingsService) {}
  private readonly logger = new Logger(PushbulletAgent.name);

  getSettings = () =>
    this.settings?.notification_settings?.notifications?.agents?.pushbullet;

  public shouldSend(): boolean {
    return true;
  }

  private getNotificationPayload(
    type: Notification,
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
    type: Notification,
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
        type: Notification[type],
        subject: payload.subject,
      });

      try {
        await axios.post(
          endpoint,
          { ...notificationPayload, channel_tag: settings.options.channelTag },
          {
            headers: {
              'Access-Token': settings.options.accessToken,
            },
          },
        );
      } catch (e) {
        this.logger.error('Error sending Pushbullet notification', {
          label: 'Notifications',
          type: Notification[type],
          subject: payload.subject,
          errorMessage: e.message,
          response: e.response?.data,
        });

        return false;
      }
    }

      if (
          settings.options.accessToken
      ) {
        this.logger.debug('Sending Pushbullet notification', {
          label: 'Notifications',
          recipient: settings.options.displayName,
          type: Notification[type],
          subject: payload.subject,
        });

        try {
          await axios.post(endpoint, notificationPayload, {
            headers: {
              'Access-Token': settings.options.accessToken,
            },
          });
        } catch (e) {
          this.logger.error('Error sending Pushbullet notification', {
            label: 'Notifications',
            recipient: settings.options.displayName,
            type: Notification[type],
            subject: payload.subject,
            errorMessage: e.message,
            response: e.response?.data,
          });

          return false;
        }
      }

    return true;
  }
}

export default PushbulletAgent;
