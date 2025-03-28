export interface JellyfinInfoResponse {
  Version: string;
}

export interface JellyfinUsageResponse {
  columns: Array<string>;
  results: Array<Array<string>>;
}

export interface JellyfinUserResponse extends Array<any> {
  Id: String;
}

export interface JellyfinItemsResponse {
  Items: Array<{
    Id: string;
  }>;
}

export interface JellyfinUserDataResponse {
  Played: boolean;
  LastPlayedDate: string;
  PlayCount: number;
}