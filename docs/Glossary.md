## Rule glossary

This glossary describes the available rules that can be used in maintainerr.
Each rule contains the media type it applies to, the key and the data type of the returned value.

The key is used for identification in Yaml rule files.

### Plex

#### Date added

!!! info ""
    The date when the Plex item was added to the server.

- Key: Plex.addDate
- Availability: movies, shows, seasons, episodes
- Type: date

#### Viewed by (username)

!!! info ""
    List of Plex usernames who have viewed the Plex item.

- Key: Plex.seenBy
- Availability: movies, shows, seasons, episodes
- Type: text[]

#### Release date

!!! info ""
    The release date of the Plex item.

- Key: Plex.releaseDate
- Availability: movies, shows, seasons, episodes
- Type: date

#### User rating (scale 1-10)

!!! info ""
    The user rating of the Plex item on a scale of 1 to 10.

    Currently, only checks for the server owner's ratings.

- Key: Plex.rating_user
- Availability: movies, shows, seasons, episodes
- Type: number

#### People involved

!!! info ""
    List of people involved in the Plex item. This includes actors, directors,..

- Key: Plex.people
- Availability: movies, shows, seasons, episodes
- Type: text[]

#### Times viewed

!!! info ""
    The number of times the Plex item has been viewed.

- Key: Plex.viewCount
- Availability: movies, shows, seasons, episodes
- Type: number

#### Present in amount of other collections

!!! info ""
    The number of collections the Plex item is present in. For seasons and episodes, This wil **not** include the collections of the parent season and show.

- Key: Plex.collections
- Availability: movies, shows, seasons, episodes
- Type: number

#### Last view date

!!! info ""
    The date when the Plex item was last viewed.

- Key: Plex.lastViewedAt
- Availability: movies, shows, seasons, episodes
- Type: date

#### Media file resolution (4k, 1080,..)

!!! info ""
    The resolutions of the media file associated with the Plex item. Possibilities include 4k, 1080, 720, 480, 360, 240.

- Key: Plex.fileVideoResolution
- Availability: movies, shows, seasons, episodes
- Type: text

#### Media file bitrate

!!! info ""
    The bitrate of the media file associated with the Plex item.

- Key: Plex.fileBitrate
- Availability: movies, shows, seasons, episodes
- Type: number

#### Media file codec

!!! info ""
    The codec of the media file associated with the Plex item.

- Key: Plex.fileVideoCodec
- Availability: movies, shows, seasons, episodes
- Type: text

#### List of genres (Action, Adventure,..)

!!! info ""
    List of genres associated with the Plex item.

- Key: Plex.genre
- Availability: movies, shows, seasons, episodes
- Type: text[]

#### Users that saw all available episodes

!!! info ""
    List of users who have seen all available episodes of the Plex item. This rule is only available for shows.

- Key: Plex.sw_allEpisodesSeenBy
- Availability: shows, seasons
- Type: text[]

#### Newest episode view date

!!! info ""
    The date when the newest episode of the Plex item was viewed. This rule is only available for shows.

- Key: Plex.sw_lastWatched
- Availability: shows, seasons
- Type: date

#### Amount of available episodes

!!! info ""
    The total number of episodes available for the Plex item. This rule is only available for shows.

- Key: Plex.sw_episodes
- Availability: shows, seasons
- Type: number

#### Amount of watched episodes

!!! info ""
    The number of episodes that have been watched for the Plex item. This rule is only available for shows.

- Key: Plex.sw_viewedEpisodes
- Availability: shows, seasons
- Type: number

#### Last episode added at

!!! info ""
    The date when the last episode was added to the Plex item. This is not for the most recently aired episode of the show. Just the last episode that was added to Plex. This rule is only available for shows.

- Key: Plex.sw_lastEpisodeAddedAt
- Availability: shows, seasons
- Type: date

#### Last episode aired at

!!! info ""
    The date when the newest episode added to Plex was originally aired. This is not for the most recently aired episode of the show. Just the last episode that was added to Plex.This rule is only available for shows.

- Key: Plex.sw_lastEpisodeAiredAt
- Availability: shows, seasons
- Type: date

#### Total views

!!! info ""
    The total number of views for the Plex item. This rule is only available for shows.

- Key: Plex.sw_amountOfViews
- Availability: shows, seasons, episodes
- Type: number

#### Users that watch the show/season/episode

!!! info ""
    List of users who watch the Plex item. This rule is only available for shows.

- Key: Plex.sw_watchers
- Availability: shows, seasons, episodes
- Type: text[]

#### Collections media is present in (titles)

!!! info ""
    List of collections that the Plex item is present in. For seasons and episodes, This wil **not** include the collections of the parent season and show.

- Key: Plex.collection_names
- Availability: movies, shows, seasons, episodes
- Type: text[]

#### Present in amount of playlists

!!! info ""
    The number of playlists the Plex item is present in.

- Key: Plex.playlists
- Availability: movies, shows, seasons, episodes
- Type: number

#### Playlists media is present in (titles)

!!! info ""
    List of playlists that the Plex item is present in.

- Key: Plex.playlist_names
- Availability: movies, shows, seasons, episodes
- Type: text[]

#### Critics rating (scale 1-10)

!!! info ""
    The critics rating of the Plex item on a scale of 1 to 10. This will mostly include the rotten tomatoes critics rating.

- Key: Plex.rating_critics
- Availability: movies, shows, seasons, episodes
- Type: number

#### Audience rating (scale 1-10)

!!! info ""
    The audience rating of the Plex item on a scale of 1 to 10. This wil include the rotten tomatoes audience rating, or the imdb, tvdb, tmdb,.. rating. Depends on your server configuration.

- Key: Plex.rating_audience
- Availability: movies, shows, seasons, episodes
- Type: number

#### Labels

!!! info ""
    List of labels associated with the Plex item.

- Key: Plex.labels
- Availability: movies, shows, seasons, episodes
- Type: text[]

#### Watchlisted by (username)

!!! info ""
    List of users that have the Plex item in their watchlist. This does not work with private watchlists. This rule is experimental and might not work for all use cases.

- Key: Plex.watchlist_isListedByUsers
- Availability: movies, shows, seasons, episodes
- Type: text[]

#### Present in amount of other collections (incl. parents)

!!! info ""
    The number of collections the Plex item is present in. This will also include collections the parent season and/or episode is present in.

- Key: Plex.sw_collections_including_parent
- Availability: seasons, episodes
- Type: number

#### Collections media is present in (titles) (incl. parents)

!!! info ""
    List of collections that the Plex item is present in. This will also include collections the parent season and/or episode is present in.

- Key: Plex.sw_collection_names_including_parent
- Availability: seasons, episodes
- Type: text[]

### Radarr

#### Date added

!!! info ""
    The date when the Radarr item was added.

- Key: Radarr.addDate
- Availability: movies
- Type: date

#### Tags (Text if 1, otherwise list)

!!! info ""
    List of tags associated with the Radarr item.

- Key: Radarr.tags
- Availability: movies
- Type: text[]

#### Quality profile

!!! info ""
    The quality profile of the Radarr item.

- Key: Radarr.profile
- Availability: movies
- Type: text

#### Release date

!!! info ""
    The release date of the Radarr item.

- Key: Radarr.releaseDate
- Availability: movies
- Type: date

#### Is monitored

!!! info ""
    Indicates whether the Radarr item is monitored.

- Key: Radarr.monitored
- Availability: movies
- Type: boolean

#### In cinemas date

!!! info ""
    The date when the Radarr item was released in cinemas.

- Key: Radarr.inCinemas
- Availability: movies
- Type: date

#### File - size in MB

!!! info ""
    The size of the file associated with the Radarr item in megabytes.

- Key: Radarr.fileSize
- Availability: movies
- Type: number

#### File - audio channels

!!! info ""
    List of audio channels of the file associated with the Radarr item.

- Key: Radarr.fileAudioChannels
- Availability: movies
- Type: number[]

#### File - quality (2160, 1080,..)

!!! info ""
    List of quality levels of the file associated with the Radarr item.

- Key: Radarr.fileQuality
- Availability: movies
- Type: number[]

#### File - download date

!!! info ""
    The date when the file associated with the Radarr item was downloaded.

- Key: Radarr.fileDate
- Availability: movies
- Type: date

#### File - runtime in minutes

!!! info ""
    The runtime of the file associated with the Radarr item in minutes.

- Key: Radarr.runTime
- Availability: movies
- Type: number

#### File - file path

!!! info ""
    The path of the file associated with the Radarr item. When using Docker, this will be the path inside the container.

- Key: Radarr.filePath
- Availability: movies
- Type: text

### Sonarr

#### Date added

!!! info ""
    The date when the Sonarr item was added.

- Key: Sonarr.addDate
- Availability: shows
- Type: date

#### Files - Disk size in MB

!!! info ""
    The disk size of the entire show, season or episode in megabytes.

- Key: Sonarr.diskSizeEntireShow
- Availability: shows, seasons, episodes
- Type: number

#### Tags (show)

!!! info ""
    List of tags associated with the Sonarr item.

- Key: Sonarr.tags
- Availability: shows, seasons, episodes
- Type: text[]

#### Quality profile ID

!!! info ""
    The quality profile ID of the Sonarr item.

- Key: Sonarr.qualityProfileId
- Availability: shows, seasons, episodes
- Type: number

#### First air date

!!! info ""
    The first air date of the Sonarr item.

- Key: Sonarr.firstAirDate
- Availability: shows, seasons, episodes
- Type: date

#### Number of seasons / episodes (also unavailable)

!!! info ""
    The number of seasons or episodes for the Sonarr item. This will also count the unavailable episodes.

- Key: Sonarr.seasons
- Availability: shows, seasons
- Type: number

#### Status (continuing, ended)

!!! info ""
    The status of the Sonarr item.

- Key: Sonarr.status
- Availability: shows
- Type: text

#### Show ended

!!! info ""
    Indicates whether the Sonarr show has ended.

- Key: Sonarr.ended
- Availability: shows
- Type: boolean

#### Is monitored

!!! info ""
    Indicates whether the Sonarr item is monitored.

- Key: Sonarr.monitored
- Availability: shows, seasons, episodes
- Type: boolean

#### Has unaired episodes

!!! info ""
    Indicates whether the Sonarr show/season has unaired episodes.

- Key: Sonarr.unaired_episodes
- Availability: shows, seasons, episodes
- Type: boolean

#### Number of monitored seasons / episodes

!!! info ""
    The number of monitored seasons or episodes for the Sonarr item.

- Key: Sonarr.seasons_monitored
- Availability: shows, seasons
- Type: number

#### Season has unaired episodes

!!! info ""
    Indicates whether the Sonarr season has unaired episodes.

- Key: Sonarr.unaired_episodes_season
- Availability: episodes
- Type: boolean

#### Is (part of) latest aired/airing season

!!! info ""
    Indicates whether the Sonarr item is part of the latest aired or airing season.

- Key: Sonarr.part_of_latest_season
- Availability: seasons, episodes
- Type: boolean

#### Base file path

!!! info ""
    The base path on disk of the file associated with the Radarr item. When using Docker, this will be the path inside the container.

- Key: Sonarr.filePath
- Availability: movies, seasons, episodes
- Type: text

### Overseerr

#### Requested by user (Plex or local username)

!!! info ""
    The username of the Plex user who requested the media in Overseerr. If a local user requested it, this will be the local username.

- Key: Overseerr.addUser
- Availability: movies, shows, seasons, episodes
- Type: text

#### Request date

!!! info ""
    The date when the media was requested in Overseerr.

- Key: Overseerr.requestDate
- Availability: movies, shows, seasons, episodes
- Type: date

#### Release/air date

!!! info ""
    The release or air date of the media in Overseerr.

- Key: Overseerr.releaseDate
- Availability: movies, shows, seasons, episodes
- Type: date

#### Approval date

!!! info ""
    The date when the media request was approved in Overseerr.

- Key: Overseerr.approvalDate
- Availability: movies, shows, seasons, episodes
- Type: date

#### Media downloaded date

!!! info ""
    The date when the media was downloaded in Overseerr.

- Key: Overseerr.mediaAddedAt
- Availability: movies, shows, seasons, episodes
- Type: date

#### Amount of requests

!!! info ""
    The total number of requests for the media in Overseerr.

- Key: Overseerr.amountRequested
- Availability: movies, shows, seasons, episodes
- Type: number

#### Requested in Overseerr

!!! info ""
    Indicates whether the media was requested in Overseerr.

- Key: Overseerr.isRequested
- Availability: movies, shows, seasons, episodes
- Type: boolean

### Tautulli

#### Viewed by (username)

!!! info ""
    List of Plex usernames who have viewed (according to Tautulli) the Plex item. The percentage for the item to be considered as viewed is configured in the Tautulli settings.

- Key: Tautulli.seenBy
- Availability: movies, shows, seasons, episodes
- Type: text[]

#### Users that saw all available episodes

!!! info ""
    List of users who have seen (according to Tautulli) all available episodes of the Plex item. The percentage for an episode to be considered as viewed is configured in the Tautulli settings.

- Key: Tautulli.sw_allEpisodesSeenBy
- Availability: shows, seasons
- Type: text[]

#### Users that watch the show/season/episode

!!! info ""
    List of users who watch (according to Tautulli) the Plex item. The percentage for an episode to be considered as viewed is configured in the Tautulli settings. This rule is only available for shows.

- Key: Tautulli.sw_watchers
- Availability: shows, seasons, episodes
- Type: text[]

#### Date added

!!! info ""
    The date when the Plex item was added to the server.

- Key: Tautulli.addDate
- Availability: movies, shows, seasons, episodes
- Type: date

#### Times viewed

!!! info ""
    The number of times the Plex item has been viewed (according to Tautulli). The percentage for the Plex item to be considered as viewed is configured in the Tautulli settings.

- Key: Tautulli.viewCount
- Availability: movies, shows, seasons, episodes
- Type: number

#### Total views

!!! info ""
    The total number of views (according to Tautulli) for the Plex item. The percentage for an episode to be considered as viewed is configured in the Tautulli settings. This rule is only available for shows.

- Key: Tautulli.sw_amountOfViews
- Availability: shows, seasons, episodes
- Type: number

#### Last view date

!!! info ""
    The date when the Plex item was last viewed (according to Tautulli). The percentage for the Plex item to be considered as viewed is configured in the Tautulli settings.

- Key: Tautulli.lastViewedAt
- Availability: movies, shows, seasons, episodes
- Type: date

#### Amount of watched episodes

!!! info ""
    The number of episodes that have been watched (according to Tautulli) for the Plex item. The percentage for an episode to be considered as viewed is configured in the Tautulli settings. This rule is only available for shows.

- Key: Tautulli.sw_viewedEpisodes
- Availability: shows, seasons
- Type: number

#### Newest episode view date

!!! info ""
    The date when the newest episode of the Plex item was viewed (according to Tautulli). The percentage for an episode to be considered as viewed is configured in the Tautulli settings. This rule is only available for shows.

- Key: Tautulli.sw_lastWatched
- Availability: shows, seasons
- Type: date


:material-clock-edit: Last Updated: 10/10/24
