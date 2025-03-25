import axios from 'axios';
import { hasNotificationType } from '../notifications.service';
import type { NotificationAgent, NotificationPayload } from './agent';
import { SettingsService } from '../../settings/settings.service';
import { Logger } from '@nestjs/common';
import {
  NotificationAgentKey,
  NotificationAgentTelegram,
  NotificationType,
} from '../notifications-interfaces';
import { Notification } from '../entities/notification.entities';

interface TelegramMessagePayload {
  text: string;
  parse_mode: string;
  chat_id: string;
  disable_notification: boolean;
}

interface TelegramPhotoPayload {
  photo: string;
  caption: string;
  parse_mode: string;
  chat_id: string;
  disable_notification: boolean;
}

class TelegramAgent implements NotificationAgent {
  private baseUrl = 'https://api.telegram.org/';

  public constructor(
    private readonly appSettings: SettingsService,
    private readonly settings: NotificationAgentTelegram,
    readonly notification: Notification,
  ) {
    this.notification = notification;
  }

  private readonly logger = new Logger(TelegramAgent.name);

  getNotification = () => this.notification;

  getSettings = () => this.settings;

  getIdentifier = () => NotificationAgentKey.TELEGRAM;

  public shouldSend(): boolean {
    const settings = this.getSettings();

    if (settings.enabled && settings.options.botAPI) {
      return true;
    }

    return false;
  }

  private escapeText(text: string | undefined): string {
    return text ? text.replace(/[_*[\]()~>#+=|{}.!-]/gi, (x) => '\\' + x) : '';
  }

  private getNotificationPayload(
    type: NotificationType,
    payload: NotificationPayload,
  ): Partial<TelegramMessagePayload | TelegramPhotoPayload> {
    let message = `\*${this.escapeText(
      payload.event ? `${payload.event} - ${payload.subject}` : payload.subject,
    )}\*`;
    if (payload.message) {
      message += `\n${this.escapeText(payload.message)}`;
    }

    // for (const extra of payload.extra ?? []) {
    //   message += `\n\*${extra.name}:\* ${extra.value}`;
    // }

    return payload.image
      ? {
          photo: payload.image,
          caption: message,
          parse_mode: 'MarkdownV2',
        }
      : {
          text: message,
          parse_mode: 'MarkdownV2',
        };
  }

  public async send(
    type: NotificationType,
    payload: NotificationPayload,
  ): Promise<string> {
    const settings = this.getSettings();
    const endpoint = `${this.baseUrl}bot${settings.options.botAPI}/${
      payload.image ? 'sendPhoto' : 'sendMessage'
    }`;
    const notificationPayload = this.getNotificationPayload(type, payload);

    if (
      hasNotificationType(type, settings.types ?? [0]) &&
      settings.options.chatId
    ) {
      this.logger.debug('Sending Telegram notification');

      try {
        await axios.post(endpoint, {
          ...notificationPayload,
          chat_id: settings.options.chatId,
          disable_notification: !!settings.options.sendSilently,
        } as TelegramMessagePayload | TelegramPhotoPayload);
      } catch (e) {
        this.logger.error(
          `Error sending Telegram notification. Details: ${JSON.stringify({
            type: NotificationType[type],
            subject: payload.subject,
            errorMessage: e.message,
            response: e.response?.data,
          })}`,
        );
        this.logger.debug(e);
        return `Failure: ${e.message}`;
      }
    }

    return 'Success';
  }
}

export default TelegramAgent;
