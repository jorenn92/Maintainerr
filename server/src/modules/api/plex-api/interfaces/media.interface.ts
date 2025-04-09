import { PlexMetadata } from '@maintainerr/contracts';

export interface PlexMetadataResponse {
  MediaContainer: {
    Metadata: PlexMetadata[];
  };
}
