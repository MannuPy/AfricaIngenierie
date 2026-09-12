# Environnement local Docker Compose

## 1. Services

| Service | Rôle | Port local | Exposition production |
|---|---|---:|---|
| `nginx` | Reverse proxy local et TLS de test | 8080/8443 | 80/443 |
| `web` | Next.js public | 3000 interne | Via Nginx |
| `cms` | Payload CMS + dashboard | 3001 interne | Via Nginx/admin |
| `postgres` | Base CMS | 5432 interne | Jamais public |
| `minio` | Objets médias | 9000 interne | Jamais public |
| `minio-console` | Console technique médias | 9001 local | VPN/administrateur uniquement |
| `mailpit` | SMTP de test local | 1025/8025 | Remplacé par SMTP professionnel |

## 2. Réseaux Docker

- `frontend_net` : Nginx, Next.js et Payload.
- `backend_net` : Payload, PostgreSQL et MinIO.
- `mail_net` : Payload et service SMTP.

PostgreSQL et MinIO ne doivent pas avoir de port publié dans le fichier de production. Les ports de développement ne doivent être utilisés qu’en local.

## 3. Variables d’environnement

Créer `.env.local` à partir de `.env.example` et ne jamais le committer.

```dotenv
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:8080
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001
DATABASE_URL=postgres://cms_user:change-me@postgres:5432/africa_ingenierie
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_BUCKET=africa-media
MINIO_ACCESS_KEY=local-access
MINIO_SECRET_KEY=local-secret-change-me
PAYLOAD_SECRET=generate-a-long-random-secret
SMTP_HOST=mailpit
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=
CONTACT_TO=contact@example.test
```

En production, les secrets doivent être injectés par l’environnement du serveur ou un gestionnaire de secrets. Les valeurs d’exemple ne sont jamais réutilisées.

## 4. Démarrage recommandé

```bash
docker compose up -d postgres minio mailpit
docker compose run --rm cms pnpm payload migrate
docker compose run --rm cms pnpm seed:demo
docker compose up -d nginx web cms
```

Contrôles :

```bash
docker compose ps
docker compose logs --tail=100 cms
docker compose logs --tail=100 web
```

## 5. Données de démonstration

Les données issues de `standalone.html` sont importées via un seed réexécutable. Le seed doit être idempotent et clairement marqué `demo`. Il ne doit jamais écraser les contenus réels sans confirmation explicite.

## 6. Santé des services

Endpoints internes recommandés :

```text
/healthz       # processus vivant
/readyz        # dépendances disponibles
/api/health    # Payload opérationnel
```

Le redémarrage d’un conteneur ne doit pas supprimer les données PostgreSQL ni les objets MinIO.

