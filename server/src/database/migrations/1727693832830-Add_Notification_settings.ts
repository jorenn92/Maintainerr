import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationSettings1727693832830
  implements MigrationInterface
{
  name = 'AddNotificationSettings1727693832830';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE settings ADD COLUMN "notification_settings" text ',
    );

    const initialNotificationSettings =
      '{"notifications":{"agents":{"email":{"enabled":false,"options":{"emailFrom":"","emailTo":"","pgpKey":"","pgpPassword":"","smtpHost":"","smtpPort":587,"secure":false,"ignoreTls":false,"requireTls":false,"allowSelfSigned":false,"senderName":"Maintainerr"}},"discord":{"enabled":false,"types":0,"options":{"webhookUrl":"","botUsername":"","botAvatarUrl":""}},"lunasea":{"enabled":false,"types":0,"options":{"webhookUrl":""}},"slack":{"enabled":false,"types":0,"options":{"webhookUrl":""}},"telegram":{"enabled":false,"types":0,"options":{"botAPI":"","chatId":"","sendSilently":false}},"pushbullet":{"enabled":false,"types":0,"options":{"accessToken":""}},"pushover":{"enabled":false,"types":0,"options":{"accessToken":"","userToken":"","sound":""}},"webhook":{"enabled":false,"types":0,"options":{"webhookUrl":"","jsonPayload":""}},"webpush":{"enabled":false,"options":{}},"gotify":{"enabled":false,"types":0,"options":{"url":"","token":""}}}}}';

    await queryRunner.query(
      `UPDATE settings SET "notification_settings" = '${initialNotificationSettings}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE settings DROP "notification_settings"`,
    );
  }
}
