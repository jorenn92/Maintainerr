import axios from 'axios';
import { hasNotificationType } from '../notifications.service';
import type { NotificationAgent, NotificationPayload } from './agent';
import { Logger } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
import {
  NotificationAgentGotify,
  NotificationAgentKey,
  NotificationType,
} from '../notifications-interfaces';
import { Notification } from '../entities/notification.entities';

interface GotifyPayload {
  title: string;
  message: string;
  priority: number;
  extras: Record<string, unknown>;
}

class GotifyAgent implements NotificationAgent {
  public constructor(
    private readonly appSettings: SettingsService,
    private readonly settings: NotificationAgentGotify,
    readonly notification: Notification,
  ) {
    this.notification = notification;
  }

  private readonly logger = new Logger(GotifyAgent.name);

  getNotification = () => this.notification;

  getSettings = () => this.settings;

  getIdentifier = () => NotificationAgentKey.GOTIFY;

  public shouldSend(): boolean {
    const settings = this.getSettings();

    if (settings.enabled && settings.options.url && settings.options.token) {
      return true;
    }

    return false;
  }

  private getNotificationPayload(
    type: NotificationType,
    payload: NotificationPayload,
  ): GotifyPayload {
    const priority = 0;

    const title = payload.event
      ? `${payload.event} - ${payload.subject}`
      : payload.subject;
    let message = payload.message ?? '';

    for (const extra of payload.extra ?? []) {
      message += `\n\n**${extra.name}**\n${extra.value}`;
    }

    return {
      extras: {
        'client::display': {
          contentType: 'text/markdown',
        },
      },
      title,
      message,
      priority,
    };
  }

  public async send(
    type: NotificationType,
    payload: NotificationPayload,
  ): Promise<boolean> {
    const settings = this.getSettings();

    if (
      !payload.notifySystem ||
      !hasNotificationType(type, settings.types ?? [0])
    ) {
      return true;
    }

    this.logger.log('Sending Gotify notification');
    try {
      const endpoint = `${settings.options.url}/message?token=${settings.options.token}`;
      const notificationPayload = this.getNotificationPayload(type, payload);

      await axios.post(endpoint, notificationPayload);

      return true;
    } catch (e) {
      this.logger.error(
        `Error sending Gotify notification. Details: ${JSON.stringify({
          type: NotificationType[type],
          subject: payload.subject,
          errorMessage: e.message,
          response: e.response?.data,
        })}`
      );
      this.logger.debug(e);

      return false;
    }
  }
}

export default GotifyAgent;
