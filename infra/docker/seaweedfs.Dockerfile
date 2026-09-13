FROM chrislusf/seaweedfs:4.46@sha256:08d516132314207d10c8e37cbffc1f32b147d870169688734cc61c6231625b62

COPY infra/docker/seaweedfs-entrypoint.sh /usr/local/bin/seaweedfs-entrypoint.sh
RUN chmod 0755 /usr/local/bin/seaweedfs-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/seaweedfs-entrypoint.sh"]
