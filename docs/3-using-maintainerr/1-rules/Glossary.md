## Rule glossary

This glossary describes the available rules that can be used in maintainerr.
Each rule contains the media type it applies to, the key and the data type of the returned value.

The key is used for identification in Yaml rule files.

### Plex

#### Date added

> The date when the Plex item was added to the server.

- Key: Plex.addDate
- Availability: movies, shows, seasons, episodes
- Type: date

#### Viewed by (username)

> List of Plex usernames who have viewed the Plex item.

- Key: Plex.seenBy
- Availability: movies, shows, seasons, episodes
- Type: text[]

#### Release date

> The release date of the Plex item.

- Key: Plex.releaseDate
- Availability: movies, shows, seasons, episodes
- Type: date

#### User rating (scale 1-10)

> The user rating of the Plex item on a scale of 1 to 10.

- Key: Plex.rating_user
- Availability: movies, shows, seasons, episodes
- Type: number

#### People involved

> List of people involved in the Plex item. This includes actors, directors,..

- Key: Plex.people
- Availability: movies, shows, seasons, episodes
- Type: text[]

#### Times viewed

> The number of times the Plex item has been viewed.

- Key: Plex.viewCount
- Availability: movies, shows, seasons, episodes
- Type: number

#### Present in amount of other collections

> The number of collections the Plex item is present in. For seasons and episodes, This wil **not** include the collections of the parent season and show.

- Key: Plex.collections
- Availability: movies, shows, seasons, episodes
- Type: number

#### Last view date

> The date when the Plex item was last viewed.

- Key: Plex.lastViewedAt
- Availability: movies, shows, seasons, episodes
- Type: date

#### Media file resolution (4k, 1080,..)

> The resolutions of the media file associated with the Plex item. Possibilities include 4k, 1080, 720, 480, 360, 240.

- Key: Plex.fileVideoResolution
- Availability: movies, shows, seasons, episodes
- Type: text

#### Media file bitrate

> The bitrate of the media file associated with the Plex item.

- Key: Plex.fileBitrate
- Availability: movies, shows, seasons, episodes
- Type: number

#### Media file codec

> The codec of the media file associated with the Plex item.

- Key: Plex.fileVideoCodec
- Availability: movies, shows, seasons, episodes
- Type: text

#### List of genres (Action, Adventure,..)

> List of genres associated with the Plex item.

- Key: Plex.genre
- Availability: movies, shows, seasons, episodes
- Type: text[]

#### Users that saw all available episodes

> List of users who have seen all available episodes of the Plex item. This rule is only available for shows.

- Key: Plex.sw_allEpisodesSeenBy
- Availability: shows, seasons
- Type: text[]

#### Newest episode view date

> The date when the newest episode of the Plex item was viewed. This rule is only available for shows.

- Key: Plex.sw_lastWatched
- Availability: shows, seasons
- Type: date

#### Amount of available episodes

> The total number of episodes available for the Plex item. This rule is only available for shows.

- Key: Plex.sw_episodes
- Availability: shows, seasons
- Type: number

#### Amount of watched episodes

> The number of episodes that have been watched for the Plex item. This rule is only available for shows.

- Key: Plex.sw_viewedEpisodes
- Availability: shows, seasons
- Type: number

#### Last episode added at

> The date when the last episode was added to the Plex item. This rule is only available for shows.

- Key: Plex.sw_lastEpisodeAddedAt
- Availability: shows, seasons
- Type: date

#### Total views

> The total number of views for the Plex item. This rule is only available for shows.

- Key: Plex.sw_amountOfViews
- Availability: shows, seasons, episodes
- Type: number

#### Users that watch the show/season/episode

> List of users who watch the Plex item. This rule is only available for shows.

- Key: Plex.sw_watchers
- Availability: shows, seasons, episodes
- Type: text[]

#### Collections media is present in (titles)

> List of collections that the Plex item is present in. For seasons and episodes, This wil **not** include the collections of the parent season and show.

- Key: Plex.collection_names
- Availability: movies, shows, seasons, episodes
- Type: text[]

#### Present in amount of playlists

> The number of playlists the Plex item is present in.

- Key: Plex.playlists
- Availability: movies, shows, seasons, episodes
- Type: number

#### Playlists media is present in (titles)

> List of playlists that the Plex item is present in.

- Key: Plex.playlist_names
- Availability: movies, shows, seasons, episodes
- Type: text[]

#### Critics rating (scale 1-10)

> The critics rating of the Plex item on a scale of 1 to 10. This will mostly include the rotten tomatoes critics rating.

- Key: Plex.rating_critics
- Availability: movies, shows, seasons, episodes
- Type: number

#### Audience rating (scale 1-10)

> The audience rating of the Plex item on a scale of 1 to 10. This wil include the rotten tomatoes audience rating, or the imdb, tvdb, tmdb,.. rating. Depends on your server configuration.

- Key: Plex.rating_audience
- Availability: movies, shows, seasons, episodes
- Type: number

#### Labels

> List of labels associated with the Plex item.

- Key: Plex.labels
- Availability: movies, shows, seasons, episodes
- Type: text[]

#### Present in amount of other collections (incl. parents)

> The number of collections the Plex item is present in. This will also include collections the parent season and/or episode is present in.

- Key: Plex.sw_collections_including_parent
- Availability: seasons, episodes
- Type: number

#### Collections media is present in (titles) (incl. parents)

> List of collections that the Plex item is present in. This will also include collections the parent season and/or episode is present in.

- Key: Plex.sw_collection_names_including_parent
- Availability: seasons, episodes
- Type: text[]

### Radarr

#### Date added

> The date when the Radarr item was added.

- Key: Radarr.addDate
- Availability: movies
- Type: date

#### Tags (Text if 1, otherwise list)

> List of tags associated with the Radarr item.

- Key: Radarr.tags
- Availability: movies
- Type: text[]

#### Quality profile

> The quality profile of the Radarr item.

- Key: Radarr.profile
- Availability: movies
- Type: text

#### Release date

> The release date of the Radarr item.

- Key: Radarr.releaseDate
- Availability: movies
- Type: date

#### Is monitored

> Indicates whether the Radarr item is monitored.

- Key: Radarr.monitored
- Availability: movies
- Type: boolean

#### In cinemas date

> The date when the Radarr item was released in cinemas.

- Key: Radarr.inCinemas
- Availability: movies
- Type: date

#### File - size in MB

> The size of the file associated with the Radarr item in megabytes.

- Key: Radarr.fileSize
- Availability: movies
- Type: number

#### File - audio channels

> List of audio channels of the file associated with the Radarr item.

- Key: Radarr.fileAudioChannels
- Availability: movies
- Type: number[]

#### File - quality (2160, 1080,..)

> List of quality levels of the file associated with the Radarr item.

- Key: Radarr.fileQuality
- Availability: movies
- Type: number[]

#### File - download date

> The date when the file associated with the Radarr item was downloaded.

- Key: Radarr.fileDate
- Availability: movies
- Type: date

#### File - runtime in minutes

> The runtime of the file associated with the Radarr item in minutes.

- Key: Radarr.runTime
- Availability: movies
- Type: number

#### File - file path

> The path of the file associated with the Radarr item. When using docker Radarr, this will be the path in the Radarr container.

- Key: Radarr.filePath
- Availability: movies
- Type: text

### Sonarr

#### Date added

> The date when the Sonarr item was added.

- Key: Sonarr.addDate
- Availability: shows
- Type: date

#### Files - Disk size in MB

> The disk size of the entire show, season or episode in megabytes.

- Key: Sonarr.diskSizeEntireShow
- Availability: shows, seasons, episodes
- Type: number

#### Tags (show)

> List of tags associated with the Sonarr item.

- Key: Sonarr.tags
- Availability: shows, seasons, episodes
- Type: text[]

#### Quality profile ID

> The quality profile ID of the Sonarr item.

- Key: Sonarr.qualityProfileId
- Availability: shows, seasons, episodes
- Type: number

#### First air date

> The first air date of the Sonarr item.

- Key: Sonarr.firstAirDate
- Availability: shows, seasons, episodes
- Type: date

#### Number of seasons / episodes (also unavailable)

> The number of seasons or episodes for the Sonarr item. This will also count the unavailable episodes.

- Key: Sonarr.seasons
- Availability: shows, seasons
- Type: number

#### Status (continuing, ended)

> The status of the Sonarr item.

- Key: Sonarr.status
- Availability: shows
- Type: text

#### Show ended

> Indicates whether the Sonarr show has ended.

- Key: Sonarr.ended
- Availability: shows
- Type: boolean

#### Is monitored

> Indicates whether the Sonarr item is monitored.

- Key: Sonarr.monitored
- Availability: shows, seasons, episodes
- Type: boolean

#### Has unaired episodes

> Indicates whether the Sonarr show/season has unaired episodes.

- Key: Sonarr.unaired_episodes
- Availability: shows, seasons, episodes
- Type: boolean

#### Number of monitored seasons / episodes

> The number of monitored seasons or episodes for the Sonarr item.

- Key: Sonarr.seasons_monitored
- Availability: shows, seasons
- Type: number

#### Season has unaired episodes

> Indicates whether the Sonarr season has unaired episodes.

- Key: Sonarr.unaired_episodes_season
- Availability: episodes
- Type: boolean

#### Is (part of) latest aired/airing season

> Indicates whether the Sonarr item is part of the latest aired or airing season.

- Key: Sonarr.part_of_latest_season
- Availability: seasons, episodes
- Type: boolean
- 
#### Base file path

> The base path on disk of the file associated with the Radarr item. When using docker Sonarr, this will be the path in the Sonarr container.

- Key: Sonarr.filePath
- Availability: movies, seasons, episodes
- Type: text

### Overseerr

#### Requested by user (Plex username)

> The username of the Plex user who requested the media in Overseerr.

- Key: Overseerr.addUser
- Availability: movies, shows, seasons, episodes
- Type: text

#### Request date

> The date when the media was requested in Overseerr.

- Key: Overseerr.requestDate
- Availability: movies, shows, seasons, episodes
- Type: date

#### Release/air date

> The release or air date of the media in Overseerr.

- Key: Overseerr.releaseDate
- Availability: movies, shows, seasons, episodes
- Type: date

#### Approval date

> The date when the media request was approved in Overseerr.

- Key: Overseerr.approvalDate
- Availability: movies, shows, seasons, episodes
- Type: date

#### Media downloaded date

> The date when the media was downloaded in Overseerr.

- Key: Overseerr.mediaAddedAt
- Availability: movies, shows, seasons, episodes
- Type: date

#### Amount of requests

> The total number of requests for the media in Overseerr.

- Key: Overseerr.amountRequested
- Availability: movies, shows, seasons, episodes
- Type: number

#### Requested in Overseerr

> Indicates whether the media was requested in Overseerr.

- Key: Overseerr.isRequested
- Availability: movies, shows, seasons, episodes
- Type: boolean
