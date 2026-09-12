FROM minio/mc:latest@sha256:a7fe349ef4bd8521fb8497f55c6042871b2ae640607cf99d9bede5e9bdf11727 AS minio-client

FROM postgres:17-alpine@sha256:18cfe3ef5e6815560c98237d6216d1e5119702fb0f3894c8785dd58b8bbe5d73
RUN apk add --no-cache ca-certificates openssl gzip tar coreutils
COPY --from=minio-client /usr/bin/mc /usr/local/bin/mc
COPY scripts/backup-render.sh /usr/local/bin/backup-render.sh
RUN chmod 0755 /usr/local/bin/backup-render.sh

WORKDIR /tmp/africa-backup
