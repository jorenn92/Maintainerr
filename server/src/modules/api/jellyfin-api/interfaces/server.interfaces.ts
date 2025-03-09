export interface JellyfinInfoResponse {
  Version: string;
}

export interface JellyfinUsageResponse {
  columns: Array<string>;
  results: Array<Array<string>>;
}
