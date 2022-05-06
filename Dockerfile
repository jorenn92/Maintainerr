FROM node:lts-alpine AS BUILDER
LABEL Description="Contains the Maintainerr Docker image"

WORKDIR /opt

ARG TARGETPLATFORM
ENV TARGETPLATFORM=${TARGETPLATFORM:-linux/amd64}

COPY server/ /opt/server/
COPY ui/ /opt/ui/
COPY docs/ /opt/docs/
COPY package.json /opt/package.json
COPY yarn.lock /opt/yarn.lock 
COPY ormconfig.json /opt/ormconfig.json
COPY jsdoc.json /opt/jsdoc.json
COPY start.sh /opt/start.sh

# TODO: Remove this when armv7 SWC bug is fixed
COPY package-armv7.json /opt/package-armv7.json 


WORKDIR /opt/

RUN \
    case "${TARGETPLATFORM}" in ('linux/arm/v7') \
        apk --update --no-cache add python3 make g++ && \
        ln -s /usr/bin/python3 /usr/bin/python \
    ;; \
    esac

RUN chmod +x /opt/start.sh

RUN yarn global add @nestjs/cli --network-timeout 99999999  && \
    yarn config set python /usr/bin/python3
    # yarn --force --non-interactive --frozen-lockfile --network-timeout 99999999 \


# Temporary case for armv7 SWC bug.
# TODO: check if builds succeed with latest next & deps. Then remove this block, remove package-armv7.json & re activate yarn install above
# START REMOVE THIS
RUN \
    case "${TARGETPLATFORM}" in ('linux/arm/v7') \
        rm yarn.lock && \
        rm package.json && \
        mv package-armv7.json package.json && \
        yarn --force --non-interactive --network-timeout 99999999 \
    ;; \
    esac

RUN \
case "${TARGETPLATFORM}" in ('linux/arm64' | 'linux/amd64') \
    yarn --force --non-interactive --frozen-lockfile --network-timeout 99999999 \
;; \
esac
# END REMOVE THIS

RUN yarn run build:server

RUN yarn run build:ui

RUN yarn run docs-generate && \
    rm -rf ./docs

RUN \
case "${TARGETPLATFORM}" in ('linux/arm64' | 'linux/amd64') \
    yarn add --save --network-timeout 99999999 sharp  \
;; \
esac

RUN yarn --production --non-interactive --ignore-scripts --prefer-offline --frozen-lockfile --network-timeout 99999999

FROM node:lts-alpine

ARG TARGETPLATFORM
ENV TARGETPLATFORM=${TARGETPLATFORM:-linux/amd64}

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

EXPOSE 80

WORKDIR /opt

COPY --from=BUILDER /opt ./

RUN rm -rf /tmp/* && \
    mkdir /opt/data

VOLUME [ "/opt/data" ]

ENTRYPOINT ["/opt/start.sh"]