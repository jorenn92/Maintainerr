FROM node:16-alpine3.15
LABEL Description="Contains the Maintainerr Docker image"

EXPOSE 80

COPY server/ /opt/server/
COPY ui/ /opt/ui/
COPY docs/ /opt/docs/
COPY start.sh /opt/start.sh

RUN mkdir /opt/server/data

VOLUME [ "/opt/server/data" ]

WORKDIR /opt/server/

RUN chmod +x /opt/start.sh && \
    apk update && \
    npm i -g @nestjs/cli && \
    npm install && \ 
    npm run build && \
    rm -rf node_modules && \
    rm -f package-lock.json

WORKDIR /opt/ui/

RUN npm install --force && \ 
    npm install --save sharp && \ 
    npm run docs-generate && \
    rm -rf ../docs && \
    npm run build && \
    rm -rf node_modules && \
    rm -f package-lock.json

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/server/

RUN  npm install --only=prod --force

WORKDIR /opt/ui/

RUN  npm install --only=prod --force

ENTRYPOINT ["/opt/start.sh"]