FROM node:22-bookworm-slim@sha256:83f487e0a63425e5b4d146fb5e5be574bcbe1b7b843d3ebafdd95eaf7767a7e5 AS base

ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NEXT_TELEMETRY_DISABLED=1

RUN mkdir -p /pnpm \
    && corepack enable \
    && corepack prepare pnpm@10.28.0 --activate

WORKDIR /app

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/web/package.json apps/web/package.json
COPY apps/cms/package.json apps/cms/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/validation/package.json packages/validation/package.json
RUN pnpm install --frozen-lockfile

FROM dependencies AS builder
COPY . .
RUN pnpm --filter @africa-ingenierie/cms build

# Job éphémère utilisé par Compose pour jouer les migrations avant le CMS.
# Il reste sur le réseau privé et ne sert aucune requête HTTP.
FROM builder AS migrator
ENV NODE_ENV=production
ENV REQUIRED_PRODUCTION_SECRETS="PAYLOAD_SECRET CONTACT_INTERNAL_SECRET CMS_INTERNAL_READ_SECRET AUDIT_HASH_SECRET CONTACT_HASH_SECRET"
COPY scripts/assert-production-secrets.sh /usr/local/bin/assert-production-secrets
RUN chmod 0755 /usr/local/bin/assert-production-secrets
ENTRYPOINT ["/usr/local/bin/assert-production-secrets"]
CMD ["pnpm", "--filter", "@africa-ingenierie/cms", "migrate"]

# Job éphémère de conservation des données, lancé par le scheduler de
# l’hébergeur ou `docker compose --profile ops run --rm retention-cleanup`.
FROM builder AS maintenance
ENV NODE_ENV=production
ENV REQUIRED_PRODUCTION_SECRETS="PAYLOAD_SECRET AUDIT_HASH_SECRET"
COPY scripts/assert-production-secrets.sh /usr/local/bin/assert-production-secrets
RUN chmod 0755 /usr/local/bin/assert-production-secrets
USER node
ENTRYPOINT ["/usr/local/bin/assert-production-secrets"]
CMD ["pnpm", "--filter", "@africa-ingenierie/cms", "retention:cleanup"]

FROM node:22-bookworm-slim@sha256:83f487e0a63425e5b4d146fb5e5be574bcbe1b7b843d3ebafdd95eaf7767a7e5 AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3001 \
    REQUIRED_PRODUCTION_SECRETS="PAYLOAD_SECRET PREVIEW_SECRET REVALIDATION_SECRET CONTACT_INTERNAL_SECRET CMS_INTERNAL_READ_SECRET AUDIT_HASH_SECRET CONTACT_HASH_SECRET"
WORKDIR /app

COPY scripts/assert-production-secrets.sh /usr/local/bin/assert-production-secrets
RUN chmod 0755 /usr/local/bin/assert-production-secrets

COPY --from=builder --chown=node:node /app/apps/cms/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/cms/.next/static ./apps/cms/.next/static

USER node
EXPOSE 3001
ENTRYPOINT ["/usr/local/bin/assert-production-secrets"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/readyz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "apps/cms/server.js"]
