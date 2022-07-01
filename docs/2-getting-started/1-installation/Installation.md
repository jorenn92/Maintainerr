The easiest way to start Maintainerr is with Docker.

images for amd64, arm64 & armv7 are availabile under jorenn92/maintainerr.
Data is saved under /opt/data, a volume should be created to persist the configuration.

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

Define the Maintainerr service in your docker-compose.yml as follows:

```Dockerfile
version: '3'

services:
  maintainerr:
    image: jorenn92/maintainerr:latest
    container_name: maintainerr
    volumes:
      - ./data:/opt/data
    environment:
      - TZ=Europe/Brussels
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
