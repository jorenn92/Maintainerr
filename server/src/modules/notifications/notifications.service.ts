import { InjectRepository } from '@nestjs/typeorm';
import type { NotificationAgent, NotificationPayload } from './agents/agent';
import { Injectable, Logger } from '@nestjs/common';
import { Notification } from './entities/notification.entities';
import { DataSource, Repository } from 'typeorm';
import { RuleGroup } from '../rules/entities/rule-group.entities';
import {
  NotificationAgentKey,
  NotificationType,
} from './notifications-interfaces';
import DiscordAgent from './agents/discord';
import PushoverAgent from './agents/pushover';
import { SettingsService } from '../settings/settings.service';
import { PlexApiService } from '../api/plex-api/plex-api.service';
import { PlexMetadata } from '../api/plex-api/interfaces/media.interface';

export const hasNotificationType = (
  type: NotificationType,
  value: NotificationType[],
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
    @InjectRepository(RuleGroup)
    private readonly ruleGroupRepo: Repository<RuleGroup>,
    private readonly connection: DataSource,
    private readonly settings: SettingsService,
    private readonly plexApi: PlexApiService,
  ) {}

  public registerAgents = (
    agents: NotificationAgent[],
    skiplog = false,
  ): void => {
    this.activeAgents = [...this.activeAgents, ...agents];

    if (!skiplog) {
      this.logger.log(
        `Registered ${agents.length} notification agent${agents.length === 1 ? '' : 's'}`,
      );
    }
  };

  public sendNotification(
    type: NotificationType,
    payload: NotificationPayload,
  ): void {
    this.activeAgents.forEach((agent) => {
      if (agent.shouldSend()) {
        if (agent.getSettings().types?.includes(type))
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

  async connectNotificationConfigurationToRule(payload: {
    rulegroupId: number;
    notificationId: number;
  }) {
    try {
      if (payload.rulegroupId && payload.notificationId) {
        const ruleGroup = await this.ruleGroupRepo.findOne({
          where: { id: payload.rulegroupId },
        });

        const notificationConfig = await this.notificationRepo.findOne({
          where: { id: payload.notificationId },
        });

        if (ruleGroup && notificationConfig) {
          ruleGroup.notifications.push(notificationConfig);
          await this.ruleGroupRepo.save(ruleGroup);
          return { code: 1, result: 'success' };
        }
      }
      this.logger.warn('Adding a new notification configuration failed');
      return { code: 0, result: 'failed' };
    } catch (err) {
      this.logger.error('Adding a new notification configuration failed');
      this.logger.debug(err);
      return { code: 0, result: err };
    }
  }

  async disconnectNotificationConfigurationFromRule(payload: {
    rulegroupId: number;
    notificationId: number;
  }) {
    try {
      const ruleGroup = await this.ruleGroupRepo.findOne({
        where: { id: payload.rulegroupId },
      });

      const notificationConfig = await this.notificationRepo.findOne({
        where: { id: payload.notificationId },
      });

      if (ruleGroup && notificationConfig) {
        ruleGroup.notifications = ruleGroup.notifications.filter(
          (c) => c.id !== payload.notificationId,
        );
        await this.ruleGroupRepo.save(ruleGroup);
        return { code: 1, result: 'success' };
      }

      return { code: 0, result: 'failed' };
    } catch (err) {
      this.logger.warn('Removing a notification configuration failed');
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

  public async registerConfiguredAgents(skiplog = false) {
    const configuredAgents = await this.getNotificationConfigurations();

    const agents: NotificationAgent[] = configuredAgents.map((agent) => {
      switch (agent.name) {
        case NotificationAgentKey.DISCORD:
          return new DiscordAgent({
            enabled: agent.enabled,
            types: JSON.parse(agent.types),
            options: JSON.parse(agent.options),
          });
        case NotificationAgentKey.PUSHOVER:
          return new PushoverAgent(this.settings, {
            enabled: agent.enabled,
            types: JSON.parse(agent.types),
            options: JSON.parse(agent.options),
          });
      }
    });

    this.registerAgents(agents, skiplog);
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

  public getTypes() {
    return Object.keys(NotificationType)
      .filter((key) => isNaN(Number(key)))
      .map((key) => ({
        title: this.humanizeTitle(key),
        id: NotificationType[key],
      }));
  }

  // Helper function to convert enum keys to human-readable titles
  private humanizeTitle(key: string): string {
    return key
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
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

  public async handleNotification(
    type: NotificationType,
    mediaItems: { plexId: number }[],
    collectionName?: string,
    dayAmount?: number,
  ) {
    const payload: NotificationPayload = {
      subject: '',
      notifySystem: false,
      message: '',
    };

    payload.message = await this.transformMessageContent(
      this.getMessageContent(type, mediaItems && mediaItems.length > 1),
      mediaItems,
      collectionName,
      dayAmount,
    );

    this.sendNotification(type, payload);
  }

  private getMessageContent(type: NotificationType, multiple: boolean): string {
    let message: string;

    if (!multiple) {
      switch (type) {
        case NotificationType.TEST_NOTIFICATION:
          message =
            "\uD83D\uDD0D Test Notification: Just checking if this thing works... if you're seeing this, success! If not, well... we have a problem!";
          break;
        case NotificationType.COLLECTION_HANDLING_FAILED:
          message =
            '⚠️ Collection Handling Failed: Oops! Something went wrong while processing your collections.';
          break;
        case NotificationType.RULE_HANDLING_FAILED:
          message =
            '⚠️ Rule Handling Failed: Oops! Something went wrong while processing your rules.';
          break;
        case NotificationType.MEDIA_ABOUT_TO_BE_HANDLED:
          message =
            "⏰ Reminder: {media_title} will be handled in {days} days. If you want to keep it, make sure to take action before it's gone. Don’t miss out!";
          break;
        case NotificationType.MEDIA_ADDED_TO_COLLECTION:
          message =
            "\uD83D\uDCC2 '{media_title}' has been added to '{collection_name}'. The item will be handled in {days} days";
          break;
        case NotificationType.MEDIA_REMOVED_FROM_COLLECTION:
          message =
            "\uD83D\uDCC2 '{media_title}' has been removed from '{collection_name}'. It won't be handled anymore.";
          break;
        case NotificationType.MEDIA_HANDLED:
          message =
            "✅ Media Handled. '{media_title}' has been handled by '{collection_name}'";
          break;
      }
    } else {
      switch (type) {
        case NotificationType.MEDIA_ABOUT_TO_BE_HANDLED:
          message =
            "⏰ Reminder: These media items will be handled in {days} days. If you want to keep them, make sure to take action before they're gone. Don’t miss out! \n \n {media_items}";
          break;
        case NotificationType.MEDIA_ADDED_TO_COLLECTION:
          message =
            "\uD83D\uDCC2 These media items have been added to '{collection_name}'. The items will be handled in {days} days. \n \n {media_items}";
          break;
        case NotificationType.MEDIA_REMOVED_FROM_COLLECTION:
          message =
            "\uD83D\uDCC2 These media items have been removed from '{collection_name}'. The items will not be handled anymore. \n \n {media_items}";
          break;
        case NotificationType.MEDIA_HANDLED:
          message =
            "✅ Media Handled: These media items have been handled by '{collection_name}'. \n \n {media_items}";
          break;
      }
    }
    return message;
  }

  private async transformMessageContent(
    message: string,
    items?: { plexId: number }[],
    collectionName?: string,
    dayAmount?: number,
  ): Promise<string> {
    try {
      if (items) {
        if (items.length > 1) {
          // if multiple items
          const titles = [];

          for (const i of items) {
            const item = await this.plexApi.getMetadata(i.plexId.toString());

            titles.push(this.getTitle(item));
          }

          const result = titles
            .map((name) => `* ${name.charAt(0).toUpperCase() + name.slice(1)}`)
            .join(' \n');

          message = message.replace('{media_items}', result);
        } else {
          // if 1 item
          const item = await this.plexApi.getMetadata(
            items[0].plexId.toString(),
          );

          message = message.replace('{media_title}', this.getTitle(item));
        }
      }

      message = collectionName
        ? message.replace('{collection_name}', collectionName)
        : message;

      message =
        dayAmount && dayAmount > 0
          ? message.replace('{days}', dayAmount.toString())
          : message;

      return message;
    } catch (e) {
      this.logger.error("Couldn't transform notification message", e);
      this.logger.debug(e);
    }
  }

  private getTitle(item: PlexMetadata): string {
    return item.grandparentRatingKey
      ? `${item.grandparentTitle} - season ${item.parentIndex} - episode ${item.index}`
      : item.parentRatingKey
        ? `${item.parentTitle} - season ${item.index}`
        : item.title;
  }
}
