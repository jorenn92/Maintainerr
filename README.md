<p align="center">
  <img src="ui/public/logo_black.svg?raw=true" alt="Sublime's custom image"/>
</p>

<b>Maintainerr</b> aims to make managing the removal of your media easy. Create custom rules with parameters across different services, show the matching media on a Plex collection for a given amount of time and handle the deletion.

# Features

> Maintainerr is early alpha software, expect bugs.

By default, Maintainerr will remove media files, remove/unmonitor media in Radarr/Sonarr and clear all Overseerr requests.\
Manually adding specific media that doesn't apply to the specified rule(s) is also supported. As is excluding media.

# Support

Currently, Maintainerr supports these apps for custom rules : 
 - Plex
 - Overseerr
 - Radarr
 - Sonarr

# Docker

Automatic builds of the main branch are availabile under the jorenn92/maintainerr:alpha tag.
Data is saved under /opt/server/data, a volume should be created to make the configuration persistent.
<br><br>
Dockerfile: 

    version: '3.7'

    services:
        maintainerr:
            image: jorenn92/maintainerr:alpha
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