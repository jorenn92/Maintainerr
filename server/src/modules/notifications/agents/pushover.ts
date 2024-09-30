import axios from 'axios';
import { hasNotificationType, Notification } from '../notifications.service';
import type { NotificationAgent, NotificationPayload } from './agent';
import { SettingsService } from '../../settings/settings.service';
import { Logger } from '@nestjs/common';

interface PushoverImagePayload {
  attachment_base64: string;
  attachment_type: string;
}

interface PushoverPayload extends PushoverImagePayload {
  token: string;
  user: string;
  title: string;
  message: string;
  url: string;
  url_title: string;
  priority: number;
  html: number;
}

class PushoverAgent implements NotificationAgent {
  public constructor(private readonly settings: SettingsService) {}
  private readonly logger = new Logger(PushoverAgent.name);

  getSettings = () =>
    this.settings?.notification_settings?.notifications?.agents?.pushover;

  public shouldSend(): boolean {
    return true;
  }

  private async getImagePayload(
    imageUrl: string,
  ): Promise<Partial<PushoverImagePayload>> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });
      const base64 = Buffer.from(response.data, 'binary').toString('base64');
      const contentType = (
        response.headers['Content-Type'] || response.headers['content-type']
      )?.toString();

      return {
        attachment_base64: base64,
        attachment_type: contentType,
      };
    } catch (e) {
      this.logger.error('Error getting image payload', {
        label: 'Notifications',
        errorMessage: e.message,
        response: e.response?.data,
      });
      return {};
    }
  }

  private async getNotificationPayload(
    type: Notification,
    payload: NotificationPayload,
  ): Promise<Partial<PushoverPayload>> {
    const { applicationUrl, applicationTitle } = this.settings;

    const title = payload.event ?? payload.subject;
    let message = payload.event ? `<b>${payload.subject}</b>` : '';
    let priority = 0;

    if (payload.message) {
      message += `<small>${message ? '\n' : ''}${payload.message}</small>`;
    }

    for (const extra of payload.extra ?? []) {
      message += `<small>\n<b>${extra.name}:</b> ${extra.value}</small>`;
    }

    let attachment_base64;
    let attachment_type;
    if (payload.image) {
      const imagePayload = await this.getImagePayload(payload.image);
      if (imagePayload.attachment_base64 && imagePayload.attachment_type) {
        attachment_base64 = imagePayload.attachment_base64;
        attachment_type = imagePayload.attachment_type;
      }
    }

    return {
      title,
      message,
      priority,
      html: 1,
      attachment_base64,
      attachment_type,
    };
  }

  public async send(
    type: Notification,
    payload: NotificationPayload,
  ): Promise<boolean> {
    const settings = this.getSettings();
    const endpoint = 'https://api.pushover.net/1/messages.json';
    const notificationPayload = await this.getNotificationPayload(
      type,
      payload,
    );

    // Send system notification
    if (
      payload.notifySystem &&
      hasNotificationType(type, settings.types ?? [0]) &&
      settings.enabled &&
      settings.options.accessToken &&
      settings.options.userToken
    ) {
      this.logger.log('Sending Pushover notification', {
        label: 'Notifications',
        type: Notification[type],
        subject: payload.subject,
      });

      try {
        await axios.post(endpoint, {
          ...notificationPayload,
          token: settings.options.accessToken,
          user: settings.options.userToken,
          sound: settings.options.sound,
        } as PushoverPayload);
      } catch (e) {
        this.logger.error('Error sending Pushover notification', {
          label: 'Notifications',
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

export default PushoverAgent;
