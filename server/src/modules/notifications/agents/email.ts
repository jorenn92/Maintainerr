import type { EmailOptions } from 'email-templates';
import path from 'path';
import type { NotificationAgent, NotificationPayload } from './agent';
import { Logger } from '@nestjs/common';
import PreparedEmail from '../email/preparedEmail';
import {
  NotificationAgentEmail,
  NotificationAgentKey,
  NotificationType,
} from '../notifications-interfaces';
import { SettingsService } from '../../settings/settings.service';
import { Notification } from '../entities/notification.entities';

class EmailAgent implements NotificationAgent {
  public constructor(
    private readonly appSettings: SettingsService,
    private readonly settings: NotificationAgentEmail,
    readonly notification: Notification,
  ) {
    this.notification = notification;
  }

  private readonly logger = new Logger(EmailAgent.name);

  getNotification = () => this.notification;

  getSettings = () => this.settings;
  getIdentifier = () => NotificationAgentKey.EMAIL;

  public shouldSend(): boolean {
    const settings = this.getSettings();

    if (
      settings.enabled &&
      settings.options.emailFrom &&
      settings.options.smtpHost &&
      settings.options.smtpPort
    ) {
      return true;
    }

    return false;
  }

  private buildMessage(
    type: NotificationType,
    payload: NotificationPayload,
    recipientEmail: string,
    recipientName?: string,
  ): EmailOptions | undefined {
    if (type === NotificationType.TEST_NOTIFICATION) {
      return {
        template: path.join(__dirname, '../../../templates/email/test-email'),
        message: {
          to: recipientEmail,
        },
        locals: {
          body: payload.message,
          applicationTitle: 'Maintainerr',
          recipientName,
          recipientEmail,
        },
      };
    }

    return {
      template: path.join(__dirname, '../templates/email-template'),
      message: {
        to: recipientEmail,
      },
      locals: {
        event: payload.event,
        body: payload.message,
        extra: payload.extra ?? [],
        imageUrl: payload.image,
        timestamp: new Date().toTimeString(),
        applicationTitle: 'Maintainerr',
        recipientName,
        recipientEmail,
      },
    };
  }

  public async send(
    type: NotificationType,
    payload: NotificationPayload,
  ): Promise<boolean> {
    this.logger.log('Sending email notification');

    try {
      const email = new PreparedEmail(
        this.appSettings,
        this.getSettings() as NotificationAgentEmail,
        this.getSettings().options.pgpKey as string,
      );
      await email.send(
        this.buildMessage(
          type,
          payload,
          this.getSettings().options.emailTo as string,
        ),
      );
    } catch (e) {
      this.logger.error(
        `Error sending Email notification. Details: ${JSON.stringify({
          type: NotificationType[type],
          subject: payload.subject,
          errorMessage: e.message,
          response: e.response?.data,
        })}`,
      );
      this.logger.debug(e);

      return false;
    }

    return true;
  }
}

export default EmailAgent;
