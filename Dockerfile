FROM node:lts-alpine AS BUILDER
LABEL Description="Contains the Maintainerr Docker image"

WORKDIR /opt

ARG TARGETPLATFORM
ENV TARGETPLATFORM=${TARGETPLATFORM:-linux/amd64}

COPY server/ /opt/server/
COPY ui/ /opt/ui/
COPY docs/ /opt/docs/
COPY start.sh /opt/start.sh

WORKDIR /opt/server/

RUN \
    case "${TARGETPLATFORM}" in ('linux/arm/v7') \
    apk --update --no-cache add python3 make g++ && \
    ln -s /usr/bin/python3 /usr/bin/python \
    ;; \
    esac

RUN rm -f package-lock.json && \
    chmod +x /opt/start.sh && \
    npm i -g @nestjs/cli && \
    npm install --python=/usr/bin/python3 && \ 
    npm run build && \
    rm -rf node_modules && \
    rm -f package-lock.json

WORKDIR /opt/ui/

RUN rm -f package-lock.json && \
    npm install --force && \
    npm run docs-generate && \
    rm -rf ../docs && \
    npm run build && \
    rm -rf node_modules && \
    rm -f package-lock.json

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/server/

RUN npm install --only=prod

WORKDIR /opt/ui/

RUN npm install --only=prod --force

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

WORKDIR /opt/ui

RUN \
    case "${TARGETPLATFORM}" in ('linux/arm64' | 'linux/amd64') \
    npm install --save sharp \
    ;; \
    esac

ENTRYPOINT ["/opt/start.sh"]