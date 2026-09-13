#!/bin/sh
set -eu

: "${S3_BUCKET:?S3_BUCKET is required}"
: "${S3_ACCESS_KEY:?S3_ACCESS_KEY is required}"
: "${S3_SECRET_KEY:?S3_SECRET_KEY is required}"
: "${S3_BACKUP_ACCESS_KEY:?S3_BACKUP_ACCESS_KEY is required}"
: "${S3_BACKUP_SECRET_KEY:?S3_BACKUP_SECRET_KEY is required}"

cat > /tmp/seaweedfs-s3.json <<EOF
{
  "identities": [
    {
      "name": "africa-ingenierie-app",
      "credentials": [{
        "accessKey": "${S3_ACCESS_KEY}",
        "secretKey": "${S3_SECRET_KEY}"
      }],
      "actions": [
        "Read:${S3_BUCKET}",
        "Write:${S3_BUCKET}",
        "List:${S3_BUCKET}",
        "Tagging:${S3_BUCKET}"
      ]
    },
    {
      "name": "africa-ingenierie-backup",
      "credentials": [{
        "accessKey": "${S3_BACKUP_ACCESS_KEY}",
        "secretKey": "${S3_BACKUP_SECRET_KEY}"
      }],
      "actions": [
        "Read:${S3_BUCKET}",
        "List:${S3_BUCKET}"
      ]
    }
  ]
}
EOF

exec weed mini \
  -dir=/data \
  -s3 \
  -s3.config=/tmp/seaweedfs-s3.json \
  -bucket="${S3_BUCKET}" \
  -admin.port=12646
