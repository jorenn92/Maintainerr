export class SettingDto {
  id: number;

  clientId: string | null;

  applicationTitle: string;

  applicationUrl: string;

  apikey: string | null;

  locale: string;

  cacheImages: number;

  plex_name: string | null;

  plex_hostname: string | null;

  plex_port: number | null;

  plex_ssl: number | null;

  plex_auth_token: string | null;

  overseerr_url: string | null;

  overseerr_api_key: string | null;

  tautulli_url: string | null;

  tautulli_api_key: string | null;

  jellyseerr_url: string | null;

  jellyseerr_api_key: string | null;

  collection_handler_job_cron: string;

  rules_handler_job_cron: string;
}
