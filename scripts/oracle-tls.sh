#!/bin/sh
set -eu

PROJECT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
ENV_FILE=${ENV_FILE:-"${PROJECT_DIR}/.env.oracle"}
COMPOSE="docker compose --env-file ${ENV_FILE} -f ${PROJECT_DIR}/docker-compose.prod.yml"

if [ ! -f "$ENV_FILE" ]; then
  echo "Fichier absent : ${ENV_FILE}" >&2
  exit 1
fi

set -a
. "$ENV_FILE"
set +a

: "${PUBLIC_DOMAIN:?PUBLIC_DOMAIN is required}"
: "${ADMIN_DOMAIN:?ADMIN_DOMAIN is required}"
: "${CERTBOT_EMAIL:?CERTBOT_EMAIL is required}"

case "${1:-}" in
  init)
    TLS_BOOTSTRAP=true $COMPOSE up -d nginx
    $COMPOSE --profile ops run --rm certbot certonly --webroot \
      --webroot-path /var/www/certbot \
      --email "$CERTBOT_EMAIL" --agree-tos --no-eff-email \
      -d "$PUBLIC_DOMAIN" -d "$ADMIN_DOMAIN"
    TLS_BOOTSTRAP=false $COMPOSE up -d nginx
    ;;
  renew)
    $COMPOSE --profile ops run --rm certbot renew --webroot \
      --webroot-path /var/www/certbot --quiet
    $COMPOSE kill -s HUP nginx
    ;;
  *)
    echo "Usage: $0 init | renew" >&2
    exit 2
    ;;
esac
