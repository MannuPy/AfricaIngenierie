#!/bin/sh
set -eu

if [ "${NODE_ENV:-}" = "production" ]; then
  for name in ${REQUIRED_PRODUCTION_SECRETS:-}; do
    value=$(printenv "$name" 2>/dev/null || true)
    case "$value" in
      ''|change-me*)
        echo "[security] $name must be a real production secret" >&2
        exit 1
        ;;
    esac
    case "$name" in
      *_SECRET|*_KEY|*_PASSWORD)
        if [ "${#value}" -lt 32 ]; then
          echo "[security] $name must contain at least 32 characters" >&2
          exit 1
        fi
        ;;
    esac
  done
fi

exec "$@"
