export class SettingDto {
  id: number;

  clientId: string;

  applicationTitle: string;

  applicationUrl: string;

  apikey: string;

  locale: string;

  cacheImages: number;

  plex_name: string;

  plex_hostname: string;

  plex_port: number;

  plex_ssl: number;

  plex_auth_token: string;

  jellyfin_url: string;

  jellyfin_api_key: string;

  jellyfin_username: string;

  jellyfin_password: string;

  overseerr_url: string;

  overseerr_api_key: string;

  tautulli_url: string;

  tautulli_api_key: string;

  collection_handler_job_cron: string;

  rules_handler_job_cron: string;
}
