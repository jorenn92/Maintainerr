#!/usr/bin/env ash

cd /opt/
npx typeorm migration:run
npm run docs-serve &
npm run start:server &
npm run start:ui