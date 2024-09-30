import axios from 'axios';
import { hasNotificationType, Notification } from '../notifications.service';
import type { NotificationAgent, NotificationPayload } from './agent';
import { Logger } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';

interface GotifyPayload {
  title: string;
  message: string;
  priority: number;
  extras: Record<string, unknown>;
}

class GotifyAgent implements NotificationAgent {
  public constructor(private readonly settings: SettingsService) {}
  private readonly logger = new Logger(GotifyAgent.name);

  getSettings = () =>
    this.settings?.notification_settings?.notifications?.agents?.gotify;

  public shouldSend(): boolean {
    const settings = this.getSettings();

    if (settings.enabled && settings.options.url && settings.options.token) {
      return true;
    }

    return false;
  }

  private getNotificationPayload(
    type: Notification,
    payload: NotificationPayload,
  ): GotifyPayload {
    const { applicationUrl, applicationTitle } = this.settings;
    let priority = 0;

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
    type: Notification,
    payload: NotificationPayload,
  ): Promise<boolean> {
    const settings = this.getSettings();

    if (
      !payload.notifySystem ||
      !hasNotificationType(type, settings.types ?? [0])
    ) {
      return true;
    }

    this.logger.debug('Sending Gotify notification', {
      label: 'Notifications',
      type: Notification[type],
      subject: payload.subject,
    });
    try {
      const endpoint = `${settings.options.url}/message?token=${settings.options.token}`;
      const notificationPayload = this.getNotificationPayload(type, payload);

      await axios.post(endpoint, notificationPayload);

      return true;
    } catch (e) {
      this.logger.error('Error sending Gotify notification', {
        label: 'Notifications',
        type: Notification[type],
        subject: payload.subject,
        errorMessage: e.message,
        response: e.response?.data,
      });

      return false;
    }
  }
}

export default GotifyAgent;
