#!/bin/sh
# frontend/docker-entrypoint.sh
# Cloud Run injects $PORT at runtime (always 8080, but must be dynamic).
# Nginx config files don't read environment variables natively, so
# this script substitutes PORT_PLACEHOLDER with the real value before
# Nginx starts. This is the standard pattern for Nginx on Cloud Run.

set -e

PORT=${PORT:-8080}
sed -i "s/PORT_PLACEHOLDER/$PORT/g" /etc/nginx/conf.d/default.conf

echo "Starting Nginx on port $PORT"
exec nginx -g "daemon off;"