#!/usr/bin/env ash

cd /opt/server
node dist/main &

cd /opt/ui
npm run start
