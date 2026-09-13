# Nginx  -  configuration locale

Nginx est le **seul** service publié sur l'hôte. Tout le reste (Next.js, Payload,
PostgreSQL, SeaweedFS, Mailpit) reste sur les réseaux Docker internes.

## Hôtes servis

| URL locale | Cible | Contenu |
|---|---|---|
| `http://localhost:8080` | `web:3000` | Site public Next.js, et plus tard `/api/events` |
| `http://admin.localhost:8080` | `cms:3001` | Dashboard Payload, API REST et GraphQL |
| `http://localhost:8080/admin` |  -  | 301 vers l'hôte d'administration |
| `http://localhost:8080/nginx-health` |  -  | Santé du proxy, sans traverser les applications |

## Pourquoi deux hôtes

L'API REST de Payload occupe `/api/*`. L'API publique des événements exigée par
`docs/openapi-evenements.yaml` occupe elle aussi `/api/events`. Servir les deux
applications sur le même hôte créerait une collision. La séparation par hôte
reproduit en local le sous-domaine d'administration recommandé en production
(`admin.<domaine>`), et lève l'ambiguïté relevée à l'audit (contradiction C-13).

## HTTPS local

Désactivé par défaut : voir `conf.d/90-tls.conf.disabled`.
