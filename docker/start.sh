#!/bin/sh

BASE_PATH_REPLACE="${BASE_PATH:-}"

find /opt/app/ui -type f -exec sed -i "s,/__PATH_PREFIX__,$BASE_PATH_REPLACE,g" '{}' \;

/usr/bin/supervisord -c /etc/supervisord.conf