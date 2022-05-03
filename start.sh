#!/usr/bin/env ash

cd /opt/server
npx typeorm migration:run

cd /opt/
npm run docs-serve &
npm run start:server &
npm run start:ui