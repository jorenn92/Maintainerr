import type { EmailOptions } from 'email-templates';
import path from 'path';
import { Notification } from '../notifications.service';
import type { NotificationAgent, NotificationPayload } from './agent';
import { SettingsService } from '../../settings/settings.service';
import { Logger } from '@nestjs/common';
import PreparedEmail from '../email/preparedEmail';

class EmailAgent implements NotificationAgent {
  public constructor(private readonly settings: SettingsService) {}
  private readonly logger = new Logger(EmailAgent.name);

  getSettings = () =>
    this.settings?.notification_settings?.notifications?.agents?.email;

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
    type: Notification,
    payload: NotificationPayload,
    recipientEmail: string,
    recipientName?: string,
  ): EmailOptions | undefined {
    const { applicationUrl, applicationTitle } = this.settings;

    if (type === Notification.TEST_NOTIFICATION) {
      return {
        template: path.join(__dirname, '../../../templates/email/test-email'),
        message: {
          to: recipientEmail,
        },
        locals: {
          body: payload.message,
          applicationUrl,
          applicationTitle,
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
          applicationUrl,
          applicationTitle,
          recipientName,
          recipientEmail,
        },
      };
  }

  public async send(
    type: Notification,
    payload: NotificationPayload,
  ): Promise<boolean> {
        this.logger.log('Sending email notification', {
          label: 'Notifications',
          recipient: this.settings.notification_settings.notifications.agents.email.options.emailTo,
          type: Notification[type],
          subject: payload.subject,
        });

        try {
          const email = new PreparedEmail(
            this.settings,
            this.getSettings(),
            this.settings.notification_settings.notifications.agents.email.options.pgpKey,
          );
          await email.send(
            this.buildMessage(
              type,
              payload,
              this.getSettings().options.emailTo,
            ),
          );
        } catch (e) {
          this.logger.error('Error sending email notification', {
            label: 'Notifications',
            recipient: this.getSettings().options.emailTo,
            type: Notification[type],
            subject: payload.subject,
            errorMessage: e.message,
          });

          return false;
        }
      
    return true;
  }
}

export default EmailAgent;
