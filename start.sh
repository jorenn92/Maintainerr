#!/usr/bin/env ash

cd /opt/server
npx typeorm migration:run
node dist/main &

cd /opt/ui
npm run docs-serve &
npm run start