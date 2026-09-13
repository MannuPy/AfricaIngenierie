FROM postgres:17-alpine@sha256:18cfe3ef5e6815560c98237d6216d1e5119702fb0f3894c8785dd58b8bbe5d73
RUN apk add --no-cache aws-cli ca-certificates openssl gzip tar coreutils
COPY scripts/backup-oracle.sh /usr/local/bin/backup-oracle.sh
RUN chmod 0755 /usr/local/bin/backup-oracle.sh

WORKDIR /backup
