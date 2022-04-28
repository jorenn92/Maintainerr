#!/usr/bin/env ash

cd /opt/docs/output
http-server &

cd /opt/server
npx typeorm migration:run
node dist/main &

cd /opt/ui
npm run start