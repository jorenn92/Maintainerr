<p align="center">
  <img src="ui/public/logo_black.svg?raw=true" alt="Sublime's custom image"/>
</p>

<b>Maintainerr</b> makes managing your media easy. Create custom rules with parameters across different services, show the matching media on the Plex home screen for a given amount of days and handle the deletion.

> Maintainerr is early alpha software, expect bugs.

# Features
- Configure rules specific to your needs
- Manually add media to a collection, in case it's not included in your rules
- Exclude  media for some or all rules
- Show a plex collection, containing selected media, on the Plex home screen for a specific duration
- Remove or unmonitor media from Radarr
- Remove or unmonitor media from Sonarr
- Clear requests from Overseerr

Currently, Maintainerr supports rules across these apps :

- Plex
- Overseerr
- Radarr
- Sonarr

# Docker

Automatic builds of the main branch are availabile under the jorenn92/maintainerr:latest tag.
Data is saved under /opt/server/data, a volume should be created to make the configuration persistent.
<br><br>
Dockerfile: 

    version: '3.7'

    services:
        maintainerr:
            image: jorenn92/maintainerr:latest
            container_name: maintainerr
            volumes:
              - ./data:/opt/server/data
        environment:
          - TZ=Europe/Brussels
        ports:
          - 8154:80
        restart: unless-stopped


# Credits
Maintainerr is heavily inspired by Overseerr. Some parts of Maintainerr's code are plain copies. Big thanks to the Overseerr team for creating and maintaining such an amazing app!

Please support them at https://github.com/sct/overseerr