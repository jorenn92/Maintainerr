#!/usr/bin/env ash

cd /opt/
corepack yarn migration:run

/usr/bin/supervisord -c /etc/supervisord.conf