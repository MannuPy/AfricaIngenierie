#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════
#  Recette du socle Docker local  -  prompt 01.
#
#  Exécute les six vérifications exigées :
#    1. docker compose config
#    2. démarrage des services
#    3. healthchecks
#    4. connexion PostgreSQL
#    5. accès MinIO
#    6. réception d'un e-mail de test dans Mailpit
#
#  Usage :  bash scripts/verify-stack.sh  [--keep]
#           --keep  laisse la pile démarrée à la fin
# ══════════════════════════════════════════════════════════════════════════
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

KEEP=0
[[ "${1:-}" == "--keep" ]] && KEEP=1

PASS=0
FAIL=0
declare -a RESULTS=()

ok()   { PASS=$((PASS+1)); RESULTS+=("PASS  $1"); printf '  \033[32mPASS\033[0m  %s\n' "$1"; }
ko()   { FAIL=$((FAIL+1)); RESULTS+=("FAIL  $1"); printf '  \033[31mFAIL\033[0m  %s\n' "$1"; }
step() { printf '\n\033[1m%s\033[0m\n' "$1"; }

DC=(docker compose --env-file .env.local)

# ── Pré-requis ──────────────────────────────────────────────────────────
step "0. Pré-requis"

if ! command -v docker >/dev/null 2>&1; then
  echo "  Docker est introuvable. Installez Docker Desktop puis relancez."
  exit 2
fi
ok "Docker CLI présent  -  $(docker --version)"

if ! docker info >/dev/null 2>&1; then
  echo "  Le démon Docker ne répond pas. Démarrez Docker Desktop puis relancez."
  exit 2
fi
ok "Démon Docker joignable"

if [[ ! -f .env.local ]]; then
  cp .env.example .env.local
  echo "  .env.local créé depuis .env.example."
  echo "  ATTENTION : remplacez les valeurs « change-me » avant d'aller plus loin."
fi
ok ".env.local présent"

if grep -q 'change-me' .env.local; then
  ko ".env.local contient encore des valeurs « change-me » (à remplacer avant le prompt 03)"
else
  ok ".env.local ne contient plus de valeur d'exemple"
fi

# ── 1. Validation du fichier compose ────────────────────────────────────
step "1. docker compose config"

if "${DC[@]}" config --quiet; then
  ok "Configuration de développement valide"
else
  ko "Configuration de développement invalide"
fi

if "${DC[@]}" -f docker-compose.yml -f docker-compose.prod.yml config --quiet; then
  ok "Configuration de production valide"
else
  ko "Configuration de production invalide"
fi

EXPOSED=$("${DC[@]}" config --format json \
  | python3 -c "
import json,sys
d=json.load(sys.stdin)
bad=[]
for n,s in d['services'].items():
    for p in (s.get('ports') or []):
        ip=p.get('host_ip','0.0.0.0')
        if n!='nginx' and ip not in ('127.0.0.1','::1'):
            bad.append(f\"{n}:{p.get('published')}\")
print(','.join(bad))
" 2>/dev/null)

if [[ -z "$EXPOSED" ]]; then
  ok "Aucun service autre que Nginx n'est exposé hors de la boucle locale"
else
  ko "Services exposés publiquement : $EXPOSED"
fi

# ── 2. Démarrage ────────────────────────────────────────────────────────
step "2. Démarrage des services"

if "${DC[@]}" up -d --build; then
  ok "docker compose up terminé"
else
  ko "docker compose up a échoué"
  # `deps` installe les dépendances : s'il échoue, web et cms démarrent sans
  # node_modules et se plaignent de « next: not found ». La cause réelle est
  # toujours dans son log.
  echo
  echo "  ── Log du service deps (cause probable) ──"
  "${DC[@]}" logs --no-color deps 2>&1 | tail -30 | sed 's/^/    /'
fi

# ── 3. Healthchecks ─────────────────────────────────────────────────────
step "3. Healthchecks (jusqu'à 5 minutes  -  la première compilation Next.js est longue)"

wait_healthy() {
  local svc="$1" deadline=$((SECONDS + 300)) state
  while (( SECONDS < deadline )); do
    state=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}nohealth{{end}}' \
            "$("${DC[@]}" ps -q "$svc" 2>/dev/null)" 2>/dev/null || echo "absent")
    case "$state" in
      healthy)   return 0 ;;
      unhealthy) return 1 ;;
      *)         sleep 5 ;;
    esac
  done
  return 1
}

for svc in postgres minio mailpit cms web nginx; do
  if wait_healthy "$svc"; then ok "healthcheck $svc"; else ko "healthcheck $svc"; fi
done

# ── 4. PostgreSQL ───────────────────────────────────────────────────────
step "4. Connexion PostgreSQL"

if "${DC[@]}" exec -T postgres sh -lc 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" -q'; then
  ok "pg_isready répond"
else
  ko "pg_isready ne répond pas"
fi

if "${DC[@]}" exec -T postgres sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "select version()"' | grep -q PostgreSQL; then
  ok "Requête SQL exécutée dans la base du CMS"
else
  ko "Impossible d'exécuter une requête SQL"
fi

# ── 5. MinIO ────────────────────────────────────────────────────────────
step "5. Accès MinIO"

if "${DC[@]}" exec -T minio mc ready local; then
  ok "MinIO prêt"
else
  ko "MinIO non prêt"
fi

BUCKET=$(grep -E '^MINIO_BUCKET=' .env.local | cut -d= -f2)
if "${DC[@]}" exec -T minio mc ls "local/${BUCKET}" >/dev/null 2>&1; then
  ok "Bucket « ${BUCKET} » accessible"
else
  ko "Bucket « ${BUCKET} » introuvable (relancez : docker compose --env-file .env.local up minio-init)"
fi

# ── 6. Mailpit ──────────────────────────────────────────────────────────
step "6. Envoi et réception d'un e-mail de test"

SMTP_OUT=$("${DC[@]}" exec -T cms node scripts/smtp-test.mjs 2>&1)
echo "$SMTP_OUT" | sed 's/^/     /'

if echo "$SMTP_OUT" | grep -q '\[smtp-test\] OK'; then
  ok "Message accepté par le serveur SMTP"
else
  ko "Envoi SMTP en échec"
fi

MAILPIT_PORT=$(grep -E '^MAILPIT_UI_DEV_PORT=' .env.local | cut -d= -f2)
MAILPIT_PORT=${MAILPIT_PORT:-8025}
sleep 2

COUNT=$(curl -fsS "http://127.0.0.1:${MAILPIT_PORT}/api/v1/messages?limit=5" 2>/dev/null \
        | python3 -c "import json,sys; print(json.load(sys.stdin).get('messages_count',0))" 2>/dev/null || echo 0)

if [[ "${COUNT:-0}" -gt 0 ]]; then
  ok "Mailpit contient ${COUNT} message(s)  -  interface : http://127.0.0.1:${MAILPIT_PORT}"
else
  ko "Aucun message visible dans Mailpit"
fi

# ── 7. Points d'entrée HTTP ─────────────────────────────────────────────
step "7. Points d'entrée HTTP via Nginx"

HTTP_PORT=$(grep -E '^NGINX_HTTP_PORT=' .env.local | cut -d= -f2)
HTTP_PORT=${HTTP_PORT:-8080}

probe() {
  local label="$1" url="$2" host="${3:-}" expected="$4"
  local code
  if [[ -n "$host" ]]; then
    code=$(curl -s -o /dev/null -w '%{http_code}' -H "Host: $host" --max-time 20 "$url")
  else
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$url")
  fi
  if [[ "$code" == "$expected" ]]; then ok "$label ($code)"; else ko "$label  -  attendu $expected, obtenu $code"; fi
}

probe "Santé Nginx"        "http://127.0.0.1:${HTTP_PORT}/nginx-health" ""              200
probe "Site public"        "http://127.0.0.1:${HTTP_PORT}/"             ""              200
probe "web /healthz"       "http://127.0.0.1:${HTTP_PORT}/healthz"      ""              200
probe "web /readyz"        "http://127.0.0.1:${HTTP_PORT}/readyz"       ""              200
probe "Redirection /admin" "http://127.0.0.1:${HTTP_PORT}/admin"        ""              301
probe "Dashboard Payload"  "http://127.0.0.1:${HTTP_PORT}/admin"        "admin.localhost" 200
probe "cms /api/health"    "http://127.0.0.1:${HTTP_PORT}/api/health"   "admin.localhost" 200

# ── 8. Arrêt ────────────────────────────────────────────────────────────
if (( KEEP == 0 )); then
  step "8. Arrêt des services (les volumes de données sont conservés)"
  if "${DC[@]}" down; then ok "docker compose down"; else ko "docker compose down"; fi
else
  step "8. Pile laissée démarrée (--keep)"
fi

# ── Bilan ───────────────────────────────────────────────────────────────
printf '\n\033[1m═══ Bilan ═══\033[0m\n'
printf '%s\n' "${RESULTS[@]}"
printf '\nRéussis : %s   Échoués : %s\n' "$PASS" "$FAIL"

(( FAIL == 0 )) || exit 1
