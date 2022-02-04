#!/usr/bin/env ash

npx typeorm migration:run

cd /opt/server
node dist/main &

cd /opt/ui
npm run start
