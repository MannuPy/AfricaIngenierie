#!/bin/sh
set -eu

: "${PGHOST:?PGHOST is required}"
: "${PGUSER:?PGUSER is required}"
: "${PGPASSWORD:?PGPASSWORD is required}"
: "${PGDATABASE:?PGDATABASE is required}"
: "${S3_ENDPOINT:?S3_ENDPOINT is required}"
: "${S3_ACCESS_KEY:?S3_ACCESS_KEY is required}"
: "${S3_SECRET_KEY:?S3_SECRET_KEY is required}"
: "${S3_BUCKET:?S3_BUCKET is required}"
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

echo "[backup] SeaweedFS S3 mirror: ${STAMP}"
export AWS_ACCESS_KEY_ID="${S3_ACCESS_KEY}"
export AWS_SECRET_ACCESS_KEY="${S3_SECRET_KEY}"
export AWS_DEFAULT_REGION="${S3_REGION:-us-east-1}"
aws --endpoint-url "${S3_ENDPOINT}" s3 sync "s3://${S3_BUCKET}" "${WORK_DIR}/objects"
tar -czf "${WORK_DIR}/objects.tar.gz" -C "${WORK_DIR}" objects

encrypt() {
  input=$1
  output=$2
  openssl enc -aes-256-cbc -salt -pbkdf2 -iter 600000 \
    -pass env:BACKUP_ENCRYPTION_KEY -in "$input" -out "$output"
  sha256sum "$output" > "${output}.sha256"
  # Le checksum détecte la corruption accidentelle ; le HMAC empêche qu’un
  # fichier et son checksum soient modifiés ensemble sans détection.
  openssl dgst -sha256 -hmac "${BACKUP_ENCRYPTION_KEY}:integrity" "$output" > "${output}.hmac"
}

mkdir -p "$BACKUP_DIR"
encrypt "${WORK_DIR}/postgres.dump" "${BACKUP_DIR}/postgres-${STAMP}.dump.enc"
encrypt "${WORK_DIR}/objects.tar.gz" "${BACKUP_DIR}/objects-${STAMP}.tar.gz.enc"

# Copie optionnelle vers un stockage objet distant. Les fichiers envoyés sont
# déjà chiffrés ; les identifiants ne sont jamais inscrits dans les archives.
if [ -n "${BACKUP_S3_ENDPOINT:-}" ]; then
  : "${BACKUP_S3_BUCKET:?BACKUP_S3_BUCKET is required with BACKUP_S3_ENDPOINT}"
  : "${BACKUP_S3_ACCESS_KEY:?BACKUP_S3_ACCESS_KEY is required with BACKUP_S3_ENDPOINT}"
  : "${BACKUP_S3_SECRET_KEY:?BACKUP_S3_SECRET_KEY is required with BACKUP_S3_ENDPOINT}"
  export AWS_ACCESS_KEY_ID="${BACKUP_S3_ACCESS_KEY}"
  export AWS_SECRET_ACCESS_KEY="${BACKUP_S3_SECRET_KEY}"
  export AWS_DEFAULT_REGION="${BACKUP_S3_REGION:-us-east-1}"
  aws --endpoint-url "${BACKUP_S3_ENDPOINT}" s3api head-bucket --bucket "${BACKUP_S3_BUCKET}" >/dev/null 2>&1 || \
    aws --endpoint-url "${BACKUP_S3_ENDPOINT}" s3 mb "s3://${BACKUP_S3_BUCKET}"
  for file in \
    "${BACKUP_DIR}/postgres-${STAMP}.dump.enc" \
    "${BACKUP_DIR}/postgres-${STAMP}.dump.enc.sha256" \
    "${BACKUP_DIR}/postgres-${STAMP}.dump.enc.hmac" \
    "${BACKUP_DIR}/objects-${STAMP}.tar.gz.enc" \
    "${BACKUP_DIR}/objects-${STAMP}.tar.gz.enc.sha256" \
    "${BACKUP_DIR}/objects-${STAMP}.tar.gz.enc.hmac"; do
    aws --endpoint-url "${BACKUP_S3_ENDPOINT}" s3 cp "$file" "s3://${BACKUP_S3_BUCKET}/"
  done
fi

# Nettoyage strict du seul répertoire de sauvegarde.
find "$BACKUP_DIR" -maxdepth 1 -type f -name '*.enc' -mtime "+${RETENTION_DAYS}" -delete
find "$BACKUP_DIR" -maxdepth 1 -type f -name '*.sha256' -mtime "+${RETENTION_DAYS}" -delete
find "$BACKUP_DIR" -maxdepth 1 -type f -name '*.hmac' -mtime "+${RETENTION_DAYS}" -delete
echo "[backup] sauvegarde chiffrée terminée dans ${BACKUP_DIR}"
