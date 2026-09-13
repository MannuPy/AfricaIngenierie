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
| `pgadmin` | IDE web PostgreSQL facultatif | 5050 local | Jamais activé |

## 2. Réseaux Docker

- `frontend_net` : Nginx, Next.js et Payload.
- `backend_net` : Payload, PostgreSQL et MinIO.
- `mail_net` : Payload et service SMTP.

PostgreSQL et MinIO ne doivent pas avoir de port publié dans le fichier de production. Les ports de développement ne doivent être utilisés qu’en local.

## 2 bis. IDE de base de données local

Le projet fournit un accès PostgreSQL local pour un IDE de bureau et un IDE web
optionnel. Le service `pgadmin` n'est disponible que dans le profil Docker
`db-tools`, écoute uniquement sur `127.0.0.1:5050` et n'est pas présent dans la
configuration de production.

### Option A — pgAdmin dans le navigateur

```bash
pnpm db:ide
```

Ouvrir ensuite [http://localhost:5050](http://localhost:5050) avec les valeurs
`PGADMIN_DEFAULT_EMAIL` et `PGADMIN_DEFAULT_PASSWORD` de `.env.local`.

Dans pgAdmin, ajouter un serveur avec les paramètres suivants :

| Paramètre | Valeur |
|---|---|
| Host name/address | `postgres` |
| Port | `5432` |
| Maintenance database | valeur de `POSTGRES_DB` |
| Username | valeur de `POSTGRES_USER` |
| Password | valeur de `POSTGRES_PASSWORD` |

Le nom d'hôte `postgres` fonctionne depuis pgAdmin car les deux conteneurs
partagent le réseau Docker `backend_net`. Le bouton **Query Tool** permet de
consulter les tables et d'exécuter des requêtes SQL classiques.

### Option B — DBeaver, Beekeeper ou autre IDE installé sur le poste

Créer une connexion PostgreSQL avec `localhost` comme hôte, le port indiqué par
`POSTGRES_DEV_PORT` (par défaut `5432`), puis les valeurs `POSTGRES_DB`,
`POSTGRES_USER` et `POSTGRES_PASSWORD`. Cette publication est limitée à la
boucle locale par `docker-compose.override.yml`.

> Conseil : utiliser un compte en lecture seule pour l'exploration et réserver
> les requêtes `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE` et les migrations aux
> opérations maîtrisées. Ne jamais lancer pgAdmin sur Internet ni ajouter ce
> service à `docker-compose.prod.yml`.

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
