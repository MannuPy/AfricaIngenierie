#!/bin/sh
set -eu

: "${PUBLIC_DOMAIN:?PUBLIC_DOMAIN is required}"
: "${ADMIN_DOMAIN:?ADMIN_DOMAIN is required}"

if [ "${TLS_BOOTSTRAP:-false}" = "true" ]; then
  template=/etc/nginx/ai-templates/oracle-site-bootstrap.conf.template
else
  template=/etc/nginx/ai-templates/oracle-site.conf.template
fi

envsubst '${PUBLIC_DOMAIN} ${ADMIN_DOMAIN}' < "$template" > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
