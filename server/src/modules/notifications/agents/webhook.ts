import axios from 'axios';
import { get } from 'lodash';
import { hasNotificationType } from '../notifications.service';
import type { NotificationAgent, NotificationPayload } from './agent';
import { SettingsService } from '../../settings/settings.service';
import { Logger } from '@nestjs/common';
import {
  NotificationAgentConfig,
  NotificationAgentKey,
  NotificationType,
} from '../notifications-interfaces';
import { Notification } from '../entities/notification.entities';

type KeyMapFunction = (
  payload: NotificationPayload,
  type: NotificationType,
) => string;

const KeyMap: Record<string, string | KeyMapFunction> = {
  notification_type: (_payload, type) => NotificationType[type],
  event: 'event',
  subject: 'subject',
  message: 'message',
  image: 'image',
};

class WebhookAgent implements NotificationAgent {
  public constructor(
    private readonly appSettings: SettingsService,
    private readonly settings: NotificationAgentConfig,
    readonly notification: Notification,
  ) {
    this.notification = notification;
  }

  private readonly logger = new Logger(WebhookAgent.name);

  getNotification = () => this.notification;

  getSettings = () => this.settings;

  getIdentifier = () => NotificationAgentKey.WEBHOOK;

  private parseKeys(
    finalPayload: Record<string, unknown>,
    payload: NotificationPayload,
    type: NotificationType,
  ): Record<string, unknown> {
    Object.keys(finalPayload).forEach((key) => {
      if (key === '{{extra}}') {
        finalPayload.extra = payload.extra ?? [];
        delete finalPayload[key];
        key = 'extra';
      }

      if (typeof finalPayload[key] === 'string') {
        Object.keys(KeyMap).forEach((keymapKey) => {
          const keymapValue = KeyMap[keymapKey as keyof typeof KeyMap];
          finalPayload[key] = (finalPayload[key] as string).replace(
            `{{${keymapKey}}}`,
            typeof keymapValue === 'function'
              ? keymapValue(payload, type)
              : (get(payload, keymapValue) ?? ''),
          );
        });
      } else if (finalPayload[key] && typeof finalPayload[key] === 'object') {
        finalPayload[key] = this.parseKeys(
          finalPayload[key] as Record<string, unknown>,
          payload,
          type,
        );
      }
    });

    return finalPayload;
  }

  private buildPayload(type: NotificationType, payload: NotificationPayload) {
    const payloadString = this.getSettings().options.jsonPayload as string;
    const parsedJSON = JSON.parse(payloadString);

    return this.parseKeys(parsedJSON, payload, type);
  }

  public shouldSend(): boolean {
    const settings = this.getSettings();

    if (settings.enabled && settings.options.webhookUrl) {
      return true;
    }

    return false;
  }

  public async send(
    type: NotificationType,
    payload: NotificationPayload,
  ): Promise<boolean> {
    const settings = this.getSettings();

    if (
      !hasNotificationType(type, settings.types ?? [0])
    ) {
      return true;
    }

    this.logger.debug('Sending webhook notification');

    try {
      await axios.post(
        settings.options.webhookUrl as string,
        this.buildPayload(type, payload),
        settings.options.authHeader
          ? {
              headers: {
                Authorization: settings.options.authHeader as string,
              },
            }
          : undefined,
      );

      return true;
    } catch (e) {
      this.logger.error('Error sending webhook notification');
      this.logger.debug(e);

      return false;
    }
  }
}

export default WebhookAgent;
