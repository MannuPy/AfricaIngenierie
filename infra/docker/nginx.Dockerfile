FROM nginx:stable-alpine@sha256:97d490c12ba55b4946b01546d1c3ed324e8d41ab1c9fcb2a616aa470620e5b46

RUN rm -f /etc/nginx/conf.d/default.conf \
    && mkdir -p /etc/nginx/ai-templates

COPY infra/nginx/oracle-nginx.conf /etc/nginx/nginx.conf
COPY infra/nginx/oracle-site.conf.template /etc/nginx/ai-templates/oracle-site.conf.template
COPY infra/nginx/oracle-site-bootstrap.conf.template /etc/nginx/ai-templates/oracle-site-bootstrap.conf.template
COPY infra/nginx/oracle-security-headers.conf /etc/nginx/oracle-security-headers.conf
COPY infra/nginx/oracle-proxy.conf /etc/nginx/oracle-proxy.conf
COPY infra/nginx/oracle-entrypoint.sh /usr/local/bin/ai-nginx-entrypoint
RUN chmod 0755 /usr/local/bin/ai-nginx-entrypoint

ENTRYPOINT ["/usr/local/bin/ai-nginx-entrypoint"]
