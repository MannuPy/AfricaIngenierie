#!/usr/bin/env bash
set -Eeuo pipefail

echo '[ci] installation verrouillée'
pnpm install --frozen-lockfile

echo '[ci] typage et lint'
pnpm typecheck
pnpm lint

echo '[ci] build production'
pnpm build

echo '[ci] validation Compose OVH'
docker compose --env-file .env.ovh.test.example -f docker-compose.prod.yml config --quiet

echo '[ci] tests CMS et contrat API'
pnpm test

if [[ "${RUN_E2E:-false}" == 'true' ]]; then
  echo '[ci] E2E publication'
  pnpm up
  trap 'pnpm down || true' EXIT
  pnpm test:e2e
  pnpm routes:check
  pnpm http:check
fi

if [[ "${RUN_VISUAL:-false}" == 'true' ]]; then
  echo '[ci] responsive et accessibilite axe-core'
  pnpm exec playwright install --with-deps chromium
  pnpm test:visual
fi

echo '[ci] contrôles statiques terminés'
