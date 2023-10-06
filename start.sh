#!/usr/bin/env ash

cd /opt/
yarn migration:run
yarn docs-serve &
yarn start:server &
yarn start:ui