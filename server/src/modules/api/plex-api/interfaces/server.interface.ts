import { PlexUserAccount } from './library.interfaces';

export interface PlexStatusResponse {
  MediaContainer: {
    machineIdentifier: string;
    version: string;
  };
}

export interface PlexAccountsResponse {
  MediaContainer: { Account: PlexUserAccount[] };
}
