The easiest way to start Maintainerr is with Docker.

Automatic builds of the main branch are availabile under the 'latest' tag.
Data is saved under /opt/server/data, a volume should be created to make the configuration persistent.

# Run

```bash
docker run -d \
--name maintainerr \
-e TZ=Europe/Brussels \
-v ./data:/opt/server/data \
-p 8154:80 \
--restart unless-stopped \
jorenn92/maintainerr
```

## Updating

Stop and remove the existing container:

```bash
docker stop maintainerr && docker rm maintainerr
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
              - ./data:/opt/server/data
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
