FROM node:lts-alpine AS BUILDER
LABEL Description="Contains the Maintainerr Docker image"

WORKDIR /opt

ARG TARGETPLATFORM
ENV TARGETPLATFORM=${TARGETPLATFORM:-linux/amd64}

COPY server/ /opt/server/
COPY ui/ /opt/ui/
COPY docs/ /opt/docs/
COPY package.json /opt/package.json
COPY start.sh /opt/start.sh

WORKDIR /opt/

RUN \
    case "${TARGETPLATFORM}" in ('linux/arm/v7') \
    apk --update --no-cache add python3 make g++ && \
    ln -s /usr/bin/python3 /usr/bin/python \
    ;; \
    esac

RUN chmod +x /opt/start.sh

RUN npm i -g @nestjs/cli && \
    npm install --python=/usr/bin/python3

RUN npm run build:server

RUN npm run build:ui

RUN npm run docs-generate && \
    rm -rf ./docs

RUN rm -rf node_modules && \
    rm -f package-lock.json

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN npm install --only=prod

FROM node:lts-alpine

ARG TARGETPLATFORM
ENV TARGETPLATFORM=${TARGETPLATFORM:-linux/amd64}

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

EXPOSE 80

WORKDIR /opt

COPY --from=BUILDER /opt ./

RUN  rm -rf /tmp/* && \
    mkdir /opt/server/data

VOLUME [ "/opt/server/data" ]

RUN \
    case "${TARGETPLATFORM}" in ('linux/arm64' | 'linux/amd64') \
    npm install --save sharp \
    ;; \
    esac

ENTRYPOINT ["/opt/start.sh"]