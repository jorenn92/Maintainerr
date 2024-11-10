FROM node:20-alpine3.19 AS base
LABEL Description="Contains the Maintainerr Docker image"

FROM base AS deps

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases ./.yarn/releases

RUN apk --update --no-cache add python3 make g++ curl

RUN yarn --immutable --network-timeout 99999999

FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build:server

RUN yarn build:ui

FROM base AS runner

WORKDIR /opt/app

# copy standalone UI
COPY --from=builder --chmod=777 --chown=node:node /app/ui/.next/standalone/ui ./ui
COPY --from=builder --chmod=777 --chown=node:node /app/ui/.next/static ./ui/.next/static
COPY --from=builder --chmod=777 --chown=node:node /app/ui/public ./ui/public

# Copy standalone server
COPY --from=builder --chmod=777 --chown=node:node /app/server/dist ./server
COPY --from=builder --chmod=777 --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chmod=777 --chown=node:node /app/package.json ./

# Create required directories
RUN mkdir -pm 777 /opt/data/logs && \
    chown -R node:node /opt/data

RUN apk --update --no-cache add curl supervisor

COPY --from=builder /app/supervisord.conf /etc/supervisord.conf

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG DEBUG=false
ENV DEBUG=${DEBUG}

ARG API_PORT=3001
ENV API_PORT=${API_PORT}

ARG UI_PORT=6246
ENV UI_PORT=${UI_PORT}

# Hash of the last GIT commit
ARG GIT_SHA
ENV GIT_SHA=$GIT_SHA

# container version type. develop, stable, edge,.. a release=stable
ARG VERSION_TAG=develop
ENV VERSION_TAG=$VERSION_TAG

# Temporary workaround for https://github.com/libuv/libuv/pull/4141
ENV UV_USE_IO_URING=0

USER node

EXPOSE 6246

VOLUME [ "/opt/data" ]
ENTRYPOINT ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
