#!/usr/bin/env ash

cd /opt/
npx typeorm migration:run
yarn docs-serve &
yarn start:server &
yarn start:ui