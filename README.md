<p align="center">
  <img src="ui/public/logo_black.svg?raw=true" alt="Maintainerr's custom image"/>
</p>

<p align="center" >
  <a href="https://discord.gg/WP4ZW2QYwk"><img src="https://dcbadge.vercel.app/api/server/WP4ZW2QYwk?style=flat&theme=default-inverted" width="25%" alt="Discord link"/></a>
  &nbsp; 
  <picture><img src="https://ci.cyntek.be/buildStatus/icon?job=Maintainerr%2FMaintainerr-dev-build" width="17%" alt="Build status" /></picture>
    &nbsp; 
  <picture><img src="https://ci.cyntek.be/buildStatus/icon?job=Maintainerr%2FMaintainerr-release-build&subject=release" width="19%" alt="Release status" /></picture>
  &nbsp; 
  <a href="https://hub.docker.com/r/jorenn92/maintainerr"><img src="https://img.shields.io/docker/pulls/jorenn92/maintainerr" alt="Docker pulls" width="16.5%"></a>
</p>

<b>Maintainerr</b> makes managing your media easy.

- Do you hate being the janitor of your server?
- Do you have a lot of media that never gets watched?
- Do your users constantly request media, and let it sit there afterward never to be touched again?

If you answered yes to any of those questions... You NEED <b>Maintainerr</b>.
It's a one-stop-shop for handling those outlying shows and movies that take up precious space on your server.

# Features

- Configure rules specific to your needs, based off of several available options from Plex, Overseerr, Radarr, and Sonarr.
- Manually add media to a collection, in case it's not included after rule execution. (one-off items that don't match a rule set)
- Selectively exclude media from being added to a collection, even if it matches a rule.
- Show a collection, containing rule matched media, on the Plex home screen for a specific duration before deletion. Think "Leaving soon".
- Optionally, use a manual Plex collection, in case you don't want <b>Maintainerr</b> to add & remove Plex collections at will.
- Manage media straight from the collection within Plex. <b>Maintainerr</b> will sync and add or exclude media to/from the internal collection.

- Remove or unmonitor media from \*arr
- Clear requests from Overseerr
- Delete files from disk

<br />
Currently, <b>Maintainerr</b> supports rule parameters from these apps :

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
Data is saved within the container under /opt/data, it is recommended to tie a persistent volume to this location in your docker command/compose file.

For more information, visit the [installation guide](docs/2-getting-started/1-installation/Installation.md) or navigate to \<maintainerr_url\>:\<port\>/docs after starting your <b>Maintainerr</b> container.

Docker run:

```Yaml
docker run -d \
--name maintainerr \
-e TZ=Europe/Brussels \
-v <persistent-local-volume>:/opt/data \
-p 8154:80 \
--restart unless-stopped \
jorenn92/maintainerr
```

Docker-compose:

```Yaml
version: '3'

services:
  maintainerr:
    image: jorenn92/maintainerr:latest
    container_name: maintainerr
    volumes:
      - <persistent-local-volume>:/opt/data
    environment:
      - TZ=Europe/Brussels
#      - DEBUG=true # uncomment to enable verbose logs
    ports:
      - 8154:80
    restart: unless-stopped
```

# Credits

Maintainerr is heavily inspired by Overseerr. Some parts of Maintainerr's code are plain copies. Big thanks to the Overseerr team for creating and maintaining such an amazing app!

Please support them at https://github.com/sct/overseerr
