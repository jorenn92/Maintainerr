<p align="center">
  <img src="ui/public/logo_black.svg?raw=true" alt="Sublime's custom image"/>
</p>

<div align="center">

![Build Status](https://ci.cyntek.be/buildStatus/icon?job=Maintainerr%2FMaintainerr-dev-build)

[![](https://dcbadge.vercel.app/api/server/WP4ZW2QYwk)](https://discord.gg/WP4ZW2QYwk)

</div>

<b>Maintainerr</b> makes managing your media easy. 
 - Do you have a lot of media that you probably don't even need anymore?
 - Do people request stuff to be added to your server, then never watch it?
 - Have people requested some 6 episode show to be added, watch the show, and then the media just sits there never to be touched again?
 
 If you answered yes to any of those questions, or a similar scenario has happened... You NEED <b>Maintainerr</b>.

In <b>Maintainerr</b> you create custom rules with your own specified parameters. <b>Maintainerr</b> will scrape your media for any matches to your set rules, create a collection in Plex, show you the collection in <b>Maintainerr</b>, and after a custom specified amount of time...handle the deletion. It's literally a one-stop-shop for handling those outlying shows and movies that are taking up precious and valuable space on your server.

# Features
- Configure rules specific to your needs, based off of several available options from Plex, Overseerr, Radarr, and Sonarr.
- Manually add media to a collection, in case it's not included after rule execution. (one-off items that don't match a rule set)
- Selectively exclude media from being added to a collection, even if it matches a rule.
- Show a collection, containing  rule matched media, on the Plex home screen for a specific duration before deletion. Think "soon to be going away".
- Remove or unmonitor media from Radarr
- Remove or unmonitor media from Sonarr
- Clear requests from Overseerr
- Delete files from disk

Currently, <b>Maintainerr</b> supports using rule parameters from these apps :

- Plex
- Overseerr
- Radarr
- Sonarr
  
# Preview  
![image](https://github.com/ydkmlt84/Maintainerr/assets/2887742/8edabd29-ed98-4a9f-b41f-251b2e7d309c)
![image](https://github.com/ydkmlt84/Maintainerr/assets/2887742/c9916c90-4c67-4341-a0c1-32613518aa20)
![image](https://github.com/ydkmlt84/Maintainerr/assets/2887742/00740a16-e4fe-4429-a769-64ffcd568cba)



# Installation

Docker images for amd64, arm64 & armv7 are available under jorenn92/maintainerr. <br />
Data is saved within the container under /opt/data, it is recommended to tie a persistant volume to this location in your docker command/compose file.

For more information visit the [installation guide](docs/2-getting-started/1-installation/Installation.md) or navigate to \<maintainerr_url\>:\<port\>/docs after starting your <b>Maintainerr</b> container.

Docker-compose: 
```Yaml
version: '3'

services:
  maintainerr:
    image: jorenn92/maintainerr:latest
    container_name: maintainerr
    volumes:
      - <persistant-local-file-directory>:/opt/data
    environment:
      - TZ=Europe/Brussels
    ports:
      - 8154:80
    restart: unless-stopped
```

# Credits
Maintainerr is heavily inspired by Overseerr. Some parts of Maintainerr's code are plain copies. Big thanks to the Overseerr team for creating and maintaining such an amazing app!

Please support them at https://github.com/sct/overseerr
