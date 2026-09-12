#!/bin/sh
set -eu

: "${PGHOST:?PGHOST is required}"
: "${PGUSER:?PGUSER is required}"
: "${PGPASSWORD:?PGPASSWORD is required}"
: "${PGDATABASE:?PGDATABASE is required}"
: "${MINIO_ENDPOINT:?MINIO_ENDPOINT is required}"
: "${MINIO_ROOT_USER:?MINIO_ROOT_USER is required}"
: "${MINIO_ROOT_PASSWORD:?MINIO_ROOT_PASSWORD is required}"
: "${MINIO_BUCKET:?MINIO_BUCKET is required}"
: "${BACKUP_ENCRYPTION_KEY:?BACKUP_ENCRYPTION_KEY is required}"

if [ "${#BACKUP_ENCRYPTION_KEY}" -lt 32 ]; then
  echo 'BACKUP_ENCRYPTION_KEY must contain at least 32 characters' >&2
  exit 1
fi

BACKUP_DIR=${BACKUP_DIR:-/backup}
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
WORK_DIR=$(mktemp -d "${BACKUP_DIR}/.work.XXXXXX")
umask 077
trap 'rm -rf "$WORK_DIR"' EXIT INT TERM

echo "[backup] PostgreSQL dump: ${STAMP}"
pg_dump --format=custom --no-owner --no-privileges > "${WORK_DIR}/postgres.dump"

echo "[backup] MinIO mirror: ${STAMP}"
mc alias set local "http://${MINIO_ENDPOINT}" "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}" --api S3v4 >/dev/null
mc mirror --overwrite "local/${MINIO_BUCKET}" "${WORK_DIR}/minio"
tar -czf "${WORK_DIR}/minio.tar.gz" -C "${WORK_DIR}" minio

encrypt() {
  input=$1
  output=$2
  openssl enc -aes-256-cbc -salt -pbkdf2 -iter 600000 \
    -pass env:BACKUP_ENCRYPTION_KEY -in "$input" -out "$output"
  sha256sum "$output" > "${output}.sha256"
}

mkdir -p "$BACKUP_DIR"
encrypt "${WORK_DIR}/postgres.dump" "${BACKUP_DIR}/postgres-${STAMP}.dump.enc"
encrypt "${WORK_DIR}/minio.tar.gz" "${BACKUP_DIR}/minio-${STAMP}.tar.gz.enc"

# Copie optionnelle vers un stockage objet distant. Les fichiers envoyés sont
# déjà chiffrés ; les identifiants ne sont jamais inscrits dans les archives.
if [ -n "${BACKUP_S3_ENDPOINT:-}" ]; then
  : "${BACKUP_S3_BUCKET:?BACKUP_S3_BUCKET is required with BACKUP_S3_ENDPOINT}"
  : "${BACKUP_S3_ACCESS_KEY:?BACKUP_S3_ACCESS_KEY is required with BACKUP_S3_ENDPOINT}"
  : "${BACKUP_S3_SECRET_KEY:?BACKUP_S3_SECRET_KEY is required with BACKUP_S3_ENDPOINT}"
  mc alias set offsite "${BACKUP_S3_ENDPOINT}" "${BACKUP_S3_ACCESS_KEY}" "${BACKUP_S3_SECRET_KEY}" --api S3v4 >/dev/null
  mc mb --ignore-existing "offsite/${BACKUP_S3_BUCKET}" >/dev/null
  mc cp "${BACKUP_DIR}/postgres-${STAMP}.dump.enc" "offsite/${BACKUP_S3_BUCKET}/"
  mc cp "${BACKUP_DIR}/postgres-${STAMP}.dump.enc.sha256" "offsite/${BACKUP_S3_BUCKET}/"
  mc cp "${BACKUP_DIR}/minio-${STAMP}.tar.gz.enc" "offsite/${BACKUP_S3_BUCKET}/"
  mc cp "${BACKUP_DIR}/minio-${STAMP}.tar.gz.enc.sha256" "offsite/${BACKUP_S3_BUCKET}/"
fi

# Nettoyage strict du seul répertoire de sauvegarde.
find "$BACKUP_DIR" -maxdepth 1 -type f -name '*.enc' -mtime "+${RETENTION_DAYS}" -delete
find "$BACKUP_DIR" -maxdepth 1 -type f -name '*.sha256' -mtime "+${RETENTION_DAYS}" -delete
echo "[backup] sauvegarde chiffrée terminée dans ${BACKUP_DIR}"
