export interface VersionResponse {
  status: 1 | 0
  version: string
  commitTag: string
  updateAvailable: boolean
}
