#!/usr/bin/env ash

cd /opt/
yarn migration:run

/usr/bin/supervisord -c /etc/supervisord.conf