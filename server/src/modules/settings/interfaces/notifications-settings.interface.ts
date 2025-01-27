export interface NotificationSettings {
  notifications: {
    agents: [
      {
        name: string;
        agent: string;
        enabled: boolean;
        types: number[];
        options: {
          emailFrom?: string;
          emailTo?: string;
          smtpHost?: string;
          smtpPort?: number;
          secure?: boolean;
          ignoreTls?: boolean;
          requireTls?: boolean;
          allowSelfSigned?: boolean;
          senderName?: string;
          pgpKey?: string;
          pgpPassword?: string;
          webhookUrl?: string;
          botUsername?: string;
          botAvatarUrl?: string;
          displayName?: string;
          profileName?: string;
          email?: string;
          avatar?: string;
          botAPI?: string;
          chatId?: string;
          sendSilently?: boolean;
          accessToken?: string;
          channelTag?: string;
          userToken?: string;
          sound?: string;
          jsonPayload?: string;
          authHeader?: string;
          url?: string;
          token?: string;
        };
      },
    ];
  };
}
