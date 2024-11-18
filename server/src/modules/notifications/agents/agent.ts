import {
  NotificationAgentConfig,
  NotificationAgentKey,
  NotificationType,
} from '../notifications-interfaces';

export interface NotificationPayload {
  event?: string;
  subject: string;
  notifySystem: boolean;
  image?: string;
  message?: string;
  extra?: { name: string; value: string }[];
}

export interface NotificationAgent {
  shouldSend(): boolean;
  send(type: NotificationType, payload: NotificationPayload): Promise<boolean>;
  getIdentifier(): NotificationAgentKey;
  getSettings(): NotificationAgentConfig;
}
