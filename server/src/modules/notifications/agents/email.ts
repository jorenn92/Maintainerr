import type { EmailOptions } from 'email-templates';
import path from 'path';
import { MaintainerrLogger } from '../../logging/logs.service';
import { SettingsService } from '../../settings/settings.service';
import PreparedEmail from '../email/preparedEmail';
import { Notification } from '../entities/notification.entities';
import {
  NotificationAgentEmail,
  NotificationAgentKey,
  NotificationType,
} from '../notifications-interfaces';
import type { NotificationAgent, NotificationPayload } from './agent';

class EmailAgent implements NotificationAgent {
  public constructor(
    private readonly appSettings: SettingsService,
    private readonly settings: NotificationAgentEmail,
    private readonly logger: MaintainerrLogger,
    readonly notification: Notification,
  ) {
    logger.setContext(EmailAgent.name);
    this.notification = notification;
  }

  getNotification = () => this.notification;

  getSettings = () => this.settings;
  getIdentifier = () => NotificationAgentKey.EMAIL;

  public shouldSend(): boolean {
    const settings = this.getSettings();

    if (
      settings.enabled &&
      settings.options.emailFrom &&
      settings.options.emailTo &&
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
  ): Promise<string> {
    this.logger.log('Sending email notification');

    try {
      const email = new PreparedEmail(
        this.appSettings,
        this.getSettings(),
        this.getSettings().options.pgpKey,
      );
      await email.send(
        this.buildMessage(type, payload, this.getSettings().options.emailTo),
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

      return `Failure: ${e.message}`;
    }

    return 'Success';
  }
}

export default EmailAgent;
