import { InjectRepository } from '@nestjs/typeorm';
import type { NotificationAgent, NotificationPayload } from './agents/agent';
import { Injectable, Logger } from '@nestjs/common';
import { Notification } from './entities/notification.entities';
import { DataSource, Repository } from 'typeorm';
import { getEnabledCategories } from 'trace_events';

export enum NotificationTypes {
  NONE = 0,
  MEDIA_ADDED_TO_COLLECTION = 2,
  MEDIA_HANDLED = 4,
  RULE_HANDLING_FAILED = 8,
  COLLECTION_HANDLING_FAILED = 16,
  TEST_NOTIFICATION = 32,
}

export const hasNotificationType = (
  type: NotificationTypes,
  value: NotificationTypes[],
): boolean => {
  // If we are not checking any notifications, bail out and return true
  if (type === 0) {
    return true;
  }

  return value.includes(type);
};

@Injectable()
export class NotificationService {
  private activeAgents: NotificationAgent[] = [];
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly connection: DataSource,
  ) {}

  public registerAgents = (agents: NotificationAgent[]): void => {
    this.activeAgents = [...this.activeAgents, ...agents];
    this.logger.log('Registered notification agents', {
      label: 'Notifications',
    });
  };

  public sendNotification(
    type: NotificationTypes,
    payload: NotificationPayload,
  ): void {
    this.logger.log(`Sending notification(s) for ${NotificationTypes[type]}`, {
      label: 'Notifications',
      subject: payload.subject,
    });

    this.activeAgents.forEach((agent) => {
      if (agent.shouldSend()) {
        agent.send(type, payload);
      }
    });
  }

  async addNotificationConfiguration(payload: {
    agent: string;
    name: string;
    enabled: boolean;
    types: number[];
    options: {};
  }) {
    try {
      await this.connection
        .createQueryBuilder()
        .insert()
        .into(Notification)
        .values({
          name: payload.name,
          agent: payload.agent,
          enabled: payload.enabled,
          types: JSON.stringify(payload.types),
          options: JSON.stringify(payload.options),
        })
        .execute();
      return { code: 1, result: 'success' };
    } catch (err) {
      this.logger.warn('Adding a new notification configuration failed');
      this.logger.debug(err);
      return { code: 0, result: err };
    }
  }

  async getNotificationConfigurations() {
    try {
      return await this.notificationRepo.find();
    } catch (err) {
      this.logger.warn('Fetching Notification configurations failed');
      this.logger.debug(err);
    }
  }

  async deleteNotificationConfiguration(notificationId: number) {
    try {
      await this.notificationRepo.delete(notificationId);
      return { code: 1, result: 'success' };
    } catch (err) {
      this.logger.warn('Notification configuration removal failed');
      this.logger.debug(err);
      return { code: 0, result: err };
    }
  }

  public getAgentSpec() {
    return [
      {
        name: 'email',
        options: [
          { field: 'emailFrom', type: 'text', required: true, extraInfo: '' },
          { field: 'emailTo', type: 'text', required: true, extraInfo: '' },
          { field: 'smtpHost', type: 'text', required: true, extraInfo: '' },
          { field: 'smtpPort', type: 'number', required: true, extraInfo: '' },
          {
            field: 'secure',
            type: 'checkbox',
            required: false,
            extraInfo: 'TLS: Use implicit TLS',
          },
          {
            field: 'ignoreTls',
            type: 'checkbox',
            required: false,
            extraInfo: 'TLS: None',
          },
          {
            field: 'requireTls',
            type: 'checkbox',
            required: false,
            extraInfo: 'TLS: Always use STARTLS',
          },
          {
            field: 'allowSelfSigned',
            type: 'checkbox',
            required: false,
            extraInfo: '',
          },
          { field: 'senderName', type: 'text', required: false, extraInfo: '' },
          { field: 'pgpKey', type: 'text', required: false, extraInfo: '' },
          {
            field: 'pgpPassword',
            type: 'password',
            required: false,
            extraInfo: '',
          },
        ],
      },
      {
        name: 'discord',
        options: [
          { field: 'webhookUrl', type: 'text', required: true, extraInfo: '' },
          {
            field: 'botUsername',
            type: 'text',
            required: false,
            extraInfo: '',
          },
          {
            field: 'botAvatarUrl',
            type: 'text',
            required: false,
            extraInfo: '',
          },
        ],
      },
      {
        name: 'lunasea',
        options: [
          { field: 'webhookUrl', type: 'text', required: true, extraInfo: '' },
          {
            field: 'profileName',
            type: 'text',
            required: false,
            extraInfo: 'Only required if not using the default profile',
          },
        ],
      },
      {
        name: 'slack',
        options: [
          { field: 'webhookUrl', type: 'text', required: true, extraInfo: '' },
        ],
      },
      {
        name: 'telegram',
        options: [
          {
            field: 'botAuthToken',
            type: 'text',
            required: true,
            extraInfo: '',
          },
          {
            field: 'botUsername',
            type: 'text',
            required: false,
            extraInfo:
              'Allow users to also start a chat with your bot and configure their own notifications',
          },
          {
            field: 'chatId',
            type: 'text',
            required: true,
            extraInfo:
              'Start a chat with your bot, add @get_id_bot, and issue the /my_id command',
          },
          {
            field: 'sendSilently',
            type: 'checkbox',
            required: false,
            extraInfo: 'Send notifications with no sound',
          },
        ],
      },
      {
        name: 'pushbullet',
        options: [
          { field: 'accessToken', type: 'text', required: true, extraInfo: '' },
          { field: 'channelTag', type: 'text', required: false, extraInfo: '' },
        ],
      },
      {
        name: 'pushover',
        options: [
          { field: 'accessToken', type: 'text', required: true, extraInfo: '' },
          {
            field: 'userToken',
            type: 'text',
            required: true,
            extraInfo: 'Your 30-character user or group identifier',
          },
          { field: 'sound', type: 'text', required: false, extraInfo: '' },
        ],
      },
      {
        name: 'webhook',
        options: [
          { field: 'webhookUrl', type: 'text', required: true, extraInfo: '' },
          { field: 'jsonPayload', type: 'text', required: true, extraInfo: '' },
          { field: 'authHeader', type: 'text', required: false, extraInfo: '' },
        ],
      },
      {
        name: 'gotify',
        options: [
          { field: 'url', type: 'text', required: true, extraInfo: '' },
          { field: 'token', type: 'text', required: true, extraInfo: '' },
        ],
      },
    ];
  }
}
