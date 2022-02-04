FROM node:16-alpine3.15

COPY server/ /opt/server/
COPY ui/ /opt/ui/
VOLUME [ "/opt/server/data" ]

WORKDIR /opt/server/

RUN apk update && \
    npm i -g @nestjs/cli && \
    npm install && \ 
    npm run build && \
    rm -rf node_modules && \
    rm -f package-lock.json

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN  npm install --only=production

WORKDIR /opt/ui/

RUN npm install && \ 
    npm run build && \
    rm -rf node_modules && \
    rm -f package-lock.json

CMD ["node", "dist/main"]