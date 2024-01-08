The easiest way to start Maintainerr is with Docker.

images for amd64 & arm64 are available under jorenn92/maintainerr and ghcri.io/jorenn92/maintainerr.
Data is saved under /opt/data, a volume should be created to persist the configuration.

> Starting from release 2.0, you have the option to define a User and Group ID for running the container. Maintainerr will operate using this specified UID:GID, and any files it generates within your data volume will also be associated with this designated user and group. If not explicitly specified, the default UID:GID is set to 1000:1000, representing the 'node' user inside the container. Don't use this with 1.x releases, the container will fail to start.

# Run

```bash
docker run -d \
--name maintainerr \
-e TZ=Europe/Brussels \
-v ./data:/opt/data \
-p 8154:80 \
--restart unless-stopped \
jorenn92/maintainerr
```

## Updating

Stop and remove the existing container:

```bash
docker rm -f maintainerr
```

Pull the latest image:

```bash
docker pull jorenn92/maintainerr
```

Finally, run the container with the same parameters originally used to create the container.

You may alternatively use a third-party updating mechanism, such as Watchtower or Ouroboros, to keep Maintainerr up-to-date automatically.

# Compose

Define the Maintainerr service in your docker-compose.yml as follows.

```Yaml
version: '3'

services:
  maintainerr:
    image: jorenn92/maintainerr:latest # or ghcr.io/jorenn92/maintainerr:latest
    container_name: maintainerr
#    user: 1000:1000 # only use this with release 2.0 and up
    volumes:
      - ./data:/opt/data
    environment:
      - TZ=Europe/Brussels
#      - DEBUG=true # uncomment to enable verbose logs
    ports:
      - 8154:80
    restart: unless-stopped
```

Then, start all services defined in your Compose file:

```bash
docker-compose up -d
```

## Updating

Pull the latest image:

```bash
docker-compose pull
```

Then, restart all services defined in the Compose file:

```bash
docker-compose up -d
```
