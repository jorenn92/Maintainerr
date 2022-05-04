#!/usr/bin/env ash

# Temporary migrate db file to new location
if [ -f "/opt/server/data/maintainerr.sqlite" ]; then
    mv /opt/server/data/maintainerr.sqlite /opt/data/
fi


cd /opt/
npx typeorm migration:run
npm run docs-serve &
npm run start:server &
npm run start:ui