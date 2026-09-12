#!/bin/sh
set -eu

# Sauvegarde prévue pour un Render Cron éphémère.
# Le fichier local n'est qu'un espace de travail : la conservation réelle se
# fait dans le bucket BACKUP_S3_BUCKET, après chiffrement côté tâche.

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${MEDIA_ENDPOINT:?MEDIA_ENDPOINT is required}"
: "${MEDIA_ACCESS_KEY:?MEDIA_ACCESS_KEY is required}"
: "${MEDIA_SECRET_KEY:?MEDIA_SECRET_KEY is required}"
: "${MEDIA_BUCKET:?MEDIA_BUCKET is required}"
: "${BACKUP_S3_ENDPOINT:?BACKUP_S3_ENDPOINT is required}"
: "${BACKUP_S3_BUCKET:?BACKUP_S3_BUCKET is required}"
: "${BACKUP_S3_ACCESS_KEY:?BACKUP_S3_ACCESS_KEY is required}"
: "${BACKUP_S3_SECRET_KEY:?BACKUP_S3_SECRET_KEY is required}"
: "${BACKUP_ENCRYPTION_KEY:?BACKUP_ENCRYPTION_KEY is required}"

if [ "${#BACKUP_ENCRYPTION_KEY}" -lt 32 ]; then
  echo 'BACKUP_ENCRYPTION_KEY must contain at least 32 characters' >&2
  exit 1
fi

BACKUP_DIR=${BACKUP_DIR:-/tmp/africa-backup}
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
mkdir -p "$BACKUP_DIR"
WORK_DIR=$(mktemp -d "${BACKUP_DIR}/.work.XXXXXX")
umask 077
trap 'rm -rf "$WORK_DIR"' EXIT INT TERM

echo "[backup:render] PostgreSQL dump: ${STAMP}"
pg_dump --dbname="$DATABASE_URL" --format=custom --no-owner --no-privileges > "${WORK_DIR}/postgres.dump"

echo "[backup:render] media mirror: ${STAMP}"
mc alias set media "${MEDIA_ENDPOINT}" "${MEDIA_ACCESS_KEY}" "${MEDIA_SECRET_KEY}" --api S3v4 >/dev/null
mkdir -p "${WORK_DIR}/media"
mc mirror --overwrite "media/${MEDIA_BUCKET}" "${WORK_DIR}/media"
tar -czf "${WORK_DIR}/media.tar.gz" -C "${WORK_DIR}" media

encrypt() {
  input=$1
  output=$2
  openssl enc -aes-256-cbc -salt -pbkdf2 -iter 600000 \
    -pass env:BACKUP_ENCRYPTION_KEY -in "$input" -out "$output"
  sha256sum "$output" > "${output}.sha256"
}

encrypt "${WORK_DIR}/postgres.dump" "${WORK_DIR}/postgres-${STAMP}.dump.enc"
encrypt "${WORK_DIR}/media.tar.gz" "${WORK_DIR}/media-${STAMP}.tar.gz.enc"

mc alias set offsite "${BACKUP_S3_ENDPOINT}" "${BACKUP_S3_ACCESS_KEY}" "${BACKUP_S3_SECRET_KEY}" --api S3v4 >/dev/null
mc mb --ignore-existing "offsite/${BACKUP_S3_BUCKET}" >/dev/null
mc cp "${WORK_DIR}/postgres-${STAMP}.dump.enc" "offsite/${BACKUP_S3_BUCKET}/"
mc cp "${WORK_DIR}/postgres-${STAMP}.dump.enc.sha256" "offsite/${BACKUP_S3_BUCKET}/"
mc cp "${WORK_DIR}/media-${STAMP}.tar.gz.enc" "offsite/${BACKUP_S3_BUCKET}/"
mc cp "${WORK_DIR}/media-${STAMP}.tar.gz.enc.sha256" "offsite/${BACKUP_S3_BUCKET}/"

echo "[backup:render] sauvegarde chiffrée envoyée dans ${BACKUP_S3_BUCKET}"
