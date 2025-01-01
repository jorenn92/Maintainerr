---
status: recent
---

Docker is Maintainerr's supported method of installation.

Images for amd64 & arm64 are available under `jorenn92/maintainerr` and `ghcr.io/jorenn92/maintainerr`.
The containers data location is set as /opt/data. A docker [volume][tooltip] is strongly encouraged to persist your configuration.

[tooltip]: https://docs.docker.com/storage/volumes/#start-a-container-with-a-volume "Click here to be taken to the Docker documentation page on volumes."


!!! info
    You have the <font color="orange"> option </font> to define a User and Group ID for running the container. Maintainerr will utilize the user:group setting as it's running user (inside the container), and any files it generates within your host data volume will be associated with this designated user and group. If not explicitly specified, the default UID:GID is set to 1000:1000.
    <font color="red">See [Run](#run) and [Compose](#compose) below for examples.</font>

!!! tip annotate
      **Make sure your data volume is read/writeable by this UID:GID!**

      It is possible that you will need to change permissions on the host's data directory. (1)

1. The data directory location largely depends on how you are installing Maintainerr. If using docker, these are the two places where could you set the host data directory.

    Docker run:

          -v <your host location>:/opt/data \ 

    Docker compose: 

          volumes:
          - type: bind
            source: <your host location>
            target: /opt/data

=== "Linux Permissions Example"
          chown -R 1000:1000 /opt/data

=== "Windows Permissions"
	
		1. Right-click the file or folder you want to set permissions for and select "Properties".
		2. Navigate to the "Security" tab.
		3. Click on the "Edit" button to change permissions.
		4. In the permissions window, select a user or group from the list. Then, check or uncheck the boxes in the "Permissions for [username]" section to grant or deny specific permissions (like "Read", "Write", etc.).
		5. Click "OK" to apply the changes.


## Run

``` {.bash .annotate}
    docker run -d \
    --name maintainerr \
    -e TZ=Europe/Brussels \
    -v <yourhostlocation>:/opt/data \ # (3)!
    -u 1000:1000 \
    -p 6246:6246 \ # (1)!
    --restart unless-stopped \
    ghcr.io/jorenn92/maintainerr:latest # (2)!
```

1. This is defined as `host:container`.
2. For this line, you could also use `jorenn92/maintainerr` instead, to use the DockerHub image.
3. In Docker containers, you are able to bind a host directory to a directory inside the container. This allows for persistent data when a container is restarted or reset.

??? note "Development Versions"
    Whilst the development version contains all of the latest features and bug fixes, there is a chance things will break. By using a development version you must be willing to report any issues you come across to the development team and provide them as much information as possible to help us resolve the issue.

    Changing from a development version to a stable version is not supported.

    - `ghcr.io/jorenn92/maintainerr:main` for the develop branch
    - `jorenn92/maintainerr:develop` for the Docker Hub development image.

### Updating

Stop and remove the existing container:

```bash
docker rm -f maintainerr
```

Pull the latest image:

```bash
docker pull ghcr.io/jorenn92/maintainerr:latest
```

Finally, run the container with the same parameters you originally used to create/start the container.

You may alternatively use a third-party updating mechanism, such as [Watchtower](https://github.com/containrrr/watchtower), to keep Maintainerr up-to-date automatically.

### Enabling Debug Logging
To produce some more informational logging output, either the whole time Maintainerr is running or while you are troubleshooting a specific issue, we recommend turning on debug logging.

``` bash hl_lines="4"
    docker run -d \
    --name maintainerr \
    -e TZ=Europe/Brussels \
    -e DEBUG=true\
    -v <yourhostlocation>:/opt/data \
    -u 1000:1000 \
    -p 6246:6246 \
    --restart unless-stopped \
    ghcr.io/jorenn92/maintainerr:latest
```

## Compose

Define the Maintainerr service in your docker-compose.yml as follows.

``` yaml {.annotate}
services:
    maintainerr:
        image: ghcr.io/jorenn92/maintainerr:latest # (1)!
        user: 1000:1000
        volumes:
          - type: bind
            source: <your host location> # (3)!
            target: /opt/data
        environment:
          - TZ=Europe/Brussels
   #      - DEBUG=true # uncomment (remove the hashtag) to enable debug logs
        ports:
          - 6246:6246 # (2)!
        restart: unless-stopped
```

1. For this line, you could also use `jorenn92/maintainerr` instead, to use the DockerHub image. The `latest` tag at the end is not required, unless you want to specify which tag to use.
2. This is defined as `host:container`.
3. In Docker containers, you are able to bind a host directory to a directory inside the container. This allows for persistent data when a container is restarted or reset.

??? note "Development Versions"
    Whilst the development version contains all of the latest features and bug fixes, there is a chance things will break. By using a development version you must be willing to report any issues you come across to the development team and provide them as much information as possible to help us resolve the issue.

    Changing from a development version to a stable version is not supported.

    - `ghcr.io/jorenn92/maintainerr:main` for the develop branch
    - `jorenn92/maintainerr:develop` for the Docker Hub development image.

Save your docker-compose.yml file.
Then, while in the directory where your docker-compose file exists, start all services defined in your Compose file:

```bash
docker compose up -d
```

### Updating

Pull the latest image:

```bash
docker compose pull
```

Then, restart all services defined in the Compose file:

```bash
docker compose up -d
```

### Enabling Debug Logging
To produce some more informational logging output, either the whole time Maintainerr is running or while you are troubleshooting a specific issue, we recommend turning on debug logging.

``` yaml hl_lines="9-11"
services:
    maintainerr:
        image: ghcr.io/jorenn92/maintainerr:latest # (1)!
        user: 1000:1000
        volumes:
          - type: bind
            source: <your host location> # (3)!
            target: /opt/data
        environment:
          - TZ=Europe/Brussels
          - DEBUG=true
        ports:
          - 6246:6246 # (2)!
        restart: unless-stopped
```

:material-clock-edit: Last Updated: 11/06/24
