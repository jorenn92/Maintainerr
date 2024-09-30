import type { NotificationAgent, NotificationPayload } from './agents/agent';
import { Injectable, Logger } from '@nestjs/common';

export enum Notification {
  NONE = 0,
  MEDIA_ADDED_TO_COLLECTION = 2,
  MEDIA_HANDLED = 4,
  RULE_HANDLING_FAILED = 8,
  COLLECTION_HANDLING_FAILED = 16,
  TEST_NOTIFICATION = 32,
}

export const hasNotificationType = (
  type: Notification,
  value: Notification[],
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

  constructor() {}

  public registerAgents = (agents: NotificationAgent[]): void => {
    this.activeAgents = [...this.activeAgents, ...agents];
    this.logger.log('Registered notification agents', {
      label: 'Notifications',
    });
  };

  public sendNotification(
    type: Notification,
    payload: NotificationPayload,
  ): void {
    this.logger.log(`Sending notification(s) for ${Notification[type]}`, {
      label: 'Notifications',
      subject: payload.subject,
    });

    this.activeAgents.forEach((agent) => {
      if (agent.shouldSend()) {
        agent.send(type, payload);
      }
    });
  }
}
