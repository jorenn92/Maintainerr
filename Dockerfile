FROM node:20-alpine3.19 as BUILDER
LABEL Description="Contains the Maintainerr Docker image"

WORKDIR /opt

ARG TARGETPLATFORM
ENV TARGETPLATFORM=${TARGETPLATFORM:-linux/amd64}

COPY server/ /opt/server/
COPY ui/ /opt/ui/
COPY tools/ /opt/tools/
COPY docs/ /opt/docs/
COPY package.json /opt/package.json
COPY yarn.lock /opt/yarn.lock
COPY datasource-config.ts /opt/datasource-config.ts
COPY ormconfig.json /opt/ormconfig.json
COPY jsdoc.json /opt/jsdoc.json
COPY start.sh /opt/start.sh
COPY .yarnrc.yml /opt/.yarnrc.yml

WORKDIR /opt/

RUN export YARN_VERSION=$(corepack yarn --version)

RUN apk --update --no-cache add python3 make g++ curl

RUN chmod +x /opt/start.sh

RUN corepack install && \
    sed -i 's/\/server\/dist\//\/server\//g' /opt/datasource-config.ts

RUN corepack yarn --immutable --network-timeout 99999999

RUN \
    case "${TARGETPLATFORM}" in ('linux/arm64' | 'linux/amd64') \
    corepack yarn add sharp \
    ;; \
    esac

RUN corepack yarn build:server

RUN corepack yarn build:ui

RUN corepack yarn docs-generate && \
    rm -rf ./docs

# copy standalone UI 
RUN mv ./ui/.next/standalone/ui/ ./standalone-ui/ && \
    mv ./ui/.next/standalone/ ./standalone-ui/ && \
    mv ./ui/.next/static ./standalone-ui/.next/static && \
    mv ./ui/public ./standalone-ui/public && \
    rm -rf ./ui && \
    mv ./standalone-ui ./ui

# Copy standalone server
RUN mv ./server/dist ./standalone-server && \
    rm -rf ./server && \
    mv ./standalone-server ./server

RUN rm -rf node_modules .yarn 

RUN corepack yarn workspaces focus --production

RUN rm -rf .yarn && \
    mkdir /opt/data && \
    chown -R node:node /opt && \
    chmod +x /opt/start.sh

# Final build
FROM node:20-alpine3.19

ARG TARGETPLATFORM
ENV TARGETPLATFORM=${TARGETPLATFORM:-linux/amd64}

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG DEBUG=false
ENV DEBUG=${DEBUG}

# Temporary workaround for https://github.com/libuv/libuv/pull/4141
ENV UV_USE_IO_URING=0

EXPOSE 80

WORKDIR /opt

COPY --from=builder --chown=node:node /opt /opt
COPY supervisord.conf /etc/supervisord.conf

RUN export YARN_VERSION=$(corepack yarn --version) && \
    apk add supervisor && \
    chown node:node /opt

USER node

VOLUME [ "/opt/data" ]
ENTRYPOINT ["/opt/start.sh"]
