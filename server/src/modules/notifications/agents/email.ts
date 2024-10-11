import type { EmailOptions } from 'email-templates';
import path from 'path';
import type { NotificationAgent, NotificationPayload } from './agent';
import { Logger } from '@nestjs/common';
import PreparedEmail from '../email/preparedEmail';
import {
  NotificationAgentConfig,
  NotificationAgentEmail,
  NotificationAgentKey,
  NotificationType,
} from '../notifications-interfaces';
import { SettingsService } from '../../settings/settings.service';

class EmailAgent implements NotificationAgent {
  public constructor(
    private readonly appSettings: SettingsService,
    private readonly settings: NotificationAgentConfig,
  ) {}
  private readonly logger = new Logger(EmailAgent.name);

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
    this.logger.log('Sending email notification', {
      label: 'Notifications',
      recipient: this.settings.options.emailTo,
      type: NotificationType[type],
      subject: payload.subject,
    });

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
      this.logger.error('Error sending email notification', {
        label: 'Notifications',
        recipient: this.getSettings().options.emailTo,
        type: NotificationType[type],
        subject: payload.subject,
        errorMessage: e.message,
      });

      return false;
    }

    return true;
  }
}

export default EmailAgent;
