# ══════════════════════════════════════════════════════════════════
#  Image de DÉVELOPPEMENT partagée  -  deps, web et cms.
#
#  pnpm est installé À LA CONSTRUCTION de l'image, pas au démarrage du
#  conteneur : le téléchargement par Corepack au premier lancement est
#  une dépendance réseau silencieuse qui, en cas d'échec, laisse le
#  service `deps` sortir en erreur et prive web et cms de leurs
#  dépendances. `pnpm --version` en fin de construction fait échouer
#  l'image bruyamment plutôt que le conteneur discrètement.
#
#  Le code source est monté en bind mount ; les dépendances vivent dans
#  des volumes nommés partagés, installés une seule fois par `deps`.
#  L'image de production (multi-stage, non-root, standalone) est
#  construite au prompt 11.
# ══════════════════════════════════════════════════════════════════
FROM node:22-bookworm-slim

ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" \
    npm_config_store_dir="/pnpm-store" \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NEXT_TELEMETRY_DISABLED=1

# `PNPM_HOME` doit exister AVANT `corepack enable` : si le répertoire est
# absent, l'installation des shims échoue. C'était une panne au démarrage
# du conteneur ; ici elle ferait échouer la construction, bruyamment.
RUN mkdir -p /pnpm /pnpm-store \
 && apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && corepack enable \
 && corepack prepare pnpm@10.28.0 --activate \
 && pnpm --version

WORKDIR /app

# Chaque service fournit sa propre commande dans docker-compose.yml.
CMD ["pnpm", "--version"]
