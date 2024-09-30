export interface NotificationSettings {
  notifications: {
    agents: {
      email: {
        enabled: boolean;
        options: {
          emailFrom: string;
          emailTo: string;
          smtpHost: string;
          smtpPort: number;
          secure: boolean;
          ignoreTls: boolean;
          requireTls: boolean;
          allowSelfSigned: boolean;
          senderName: string;
          pgpKey: string;
          pgpPassword: string;
        };
      };
      discord: {
        enabled: boolean;
        types: number[];
        options: {
          webhookUrl: string;
          botUsername?: string;
          botAvatarUrl?: string;
        };
      };
      lunasea: {
        enabled: boolean;
        types: number[];
        options: {
          webhookUrl: string;
          displayName: string;
          profileName: string;
          email: string;
          avatar: string;
        };
      };
      slack: {
        enabled: boolean;
        types: number[];
        options: {
          webhookUrl: string;
        };
      };
      telegram: {
        enabled: boolean;
        types: number[];
        options: {
          botAPI: string;
          chatId: string;
          sendSilently: boolean;
        };
      };
      pushbullet: {
        enabled: boolean;
        types: number[];
        options: {
          accessToken: string;
          channelTag: string;
          displayName: string;
        };
      };
      pushover: {
        enabled: boolean;
        types: number[];
        options: {
          accessToken: string;
          userToken: string;
          sound: string;
        };
      };
      webhook: {
        enabled: boolean;
        types: number[];
        options: {
          webhookUrl: string;
          jsonPayload: string;
          authHeader: string;
        };
      };
      webpush: {
        enabled: boolean;
        options: Record<string, unknown>;
      };
      gotify: {
        enabled: boolean;
        types: number[];
        options: {
          url: string;
          token: string;
        };
      };
    };
  };
}
