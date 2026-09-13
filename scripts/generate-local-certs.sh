#!/usr/bin/env bash
# Génère un certificat auto-signé pour le HTTPS local (port 8443).
# Les certificats produits ne sortent jamais du poste et sont ignorés par Git.
set -euo pipefail

CERT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/infra/nginx/certs"
mkdir -p "$CERT_DIR"

if [[ -f "$CERT_DIR/local.crt" ]]; then
  echo "Certificat déjà présent : $CERT_DIR/local.crt"
  exit 0
fi

openssl req -x509 -nodes -newkey rsa:2048 -days 825 \
  -keyout "$CERT_DIR/local.key" \
  -out    "$CERT_DIR/local.crt" \
  -subj   "/C=BJ/O=Africa Ingenierie (local)/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:admin.localhost,IP:127.0.0.1"

chmod 600 "$CERT_DIR/local.key"
echo "Certificat local généré dans $CERT_DIR"
echo "Activez ensuite infra/nginx/conf.d/90-tls.conf.disabled -> 90-tls.conf"
