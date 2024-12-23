---
title: Testing
status: new
---
# Testing Pull Requests

We have implemented a way to test a specific pull request (new feature), using *Docker*. This can help us to find bugs and issues before being pushed to the develop image and eventually, the latest release.

!!! danger
      :fire::fire: These PR images are HIGHLY volatile and should not be used in production. These are only created to test a specific feature that we are working on, and can break at any moment.

## Testing

### Install Method

In order to test these PR images, a dev would first need to create one. After the image is created, you can see its image name at the GHCR link here -> [GHCR images](https://github.com/jorenn92/Maintainerr/pkgs/container/maintainerr). Again, Docker is the only method for testing these images.

### Getting Started

You can run the PR image using either docker run, or docker compose. Compose is recommended, but it is up to you. These need to be completely separate from your main/stable Maintainerr install, including your `host data location`/`port`/`container name`.

!!! info
      If you need too much more than what is outlined in this page, as far as installing the PR image...maybe you shouldn't be testing such bleeding edge features. Anywhere you see `<xxxx-xxxx>`, is considered a placeholder for *variable* information. Don't exactly copy and paste what is here, as it won't work without you making some changes first.
      All of the same applies, as far as file/folder permissions, from the main [Installation](Installation.md) page.

#### Docker Run

``` {.bash .annotate}
    docker run -d \
    --name maintainerr-testing \
    --hostname maintainerr-testing \
    -e TZ=Europe/Brussels \
    -e DEBUG=true \
    -v <your-testing-host-directory>:/opt/data \
    -u 1000:1000 \
    -p <9999>:6246 \
    --restart unless-stopped \
    ghcr.io/jorenn92/maintainerr:<pr-#>
```

#### Docker Compose

``` yaml {.annotate}
services:
    maintainerr-testing:
        container_name: maintainerr-testing
        image: ghcr.io/jorenn92/maintainerr:<pr-#>
        user: 1000:1000
        volumes:
          - <your-testing-host-directory>:/opt/data
        environment:
          - TZ=Europe/Brussels
          - DEBUG=true # debug logging needs to be enabled
        ports:
          - <9999>:6246
        restart: unless-stopped
```

### Reporting Issues

Remember, we need your feedback! Take a look at what the PR is for, what feature it is implementing, and what testing we are looking for.

Reports should be made in one of the two ways:

- [Github PR page](https://github.com/jorenn92/Maintainerr/pulls)

- [Discord](https://discord.gg/WP4ZW2QYwk)

??? note "Discord Link"
      If the **Discord** link doesn't work for you, message ydkmlt84 on Discord and he can help you out.

Pay special attention to how you are submitting reports to the PR, or in Discord. We need specific information, we need logs, we need all of the information you can give us so we can recreate the problem on our end.

 When you post "code" you should use backticks ( ` ). This is not the same as an apostrophe ( ' ). Single line code is surrounded by one backtick on each side of the text, and multi-line code is surrounded by three backticks on each side of the text. (i.e. logs, rule exports, test media results, your compose file or docker run command)

 `` `How you would use backticks for single line code` ``

````
   ```
   How you would
   use backticks
   for multi-line code
   ```
````

#### Good reports

- if on Discord, the PR number
- the Docker run or Compose that you used
- logs
- exported rules
- test media results
- helpful screenshots

#### Bad reports

- screenshots of your rule/s
- screenshots of logs
- screenshots of test media results
- no logs
- none of the stuff from Good reports above.

:material-clock-edit: Last Updated: 11/20/24
