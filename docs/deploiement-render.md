# Déploiement complet sur Render

Version : 1.0, 29 août 2026  
Périmètre : Next.js, Payload CMS, PostgreSQL, stockage objet S3 compatible et sauvegardes chiffrées.

Ce guide remplace le VPS Oracle pour le déploiement Render. Les fichiers Oracle restent dans le dépôt comme option alternative, mais ne sont pas utilisés par render.yaml.

## 1. Architecture retenue

~~~text
navigateur
  ├── africa-ingenierie-web  -> Next.js, pages publiques et API événements
  └── africa-ingenierie-cms  -> Payload, /admin, API et migrations
                                  |
                                  └── Render PostgreSQL

Render Cron -> pg_dump + miroir médias -> bucket S3 compatible de sauvegarde
~~~

Le CMS est déclaré comme service web pour que /admin soit accessible dans le navigateur. L’authentification Payload, le RBAC et les secrets internes restent obligatoires. Le site public utilise l’adresse privée Render du CMS lorsque le plan le permet ; le code accepte aussi CMS_INTERNAL_URL pour un environnement de test.

Les médias ne doivent pas rester sur le disque local d’un service Render, car ce disque est éphémère. Le code conserve les noms MINIO_* pour rester compatible avec MinIO, mais la production recommande un bucket S3 compatible durable, par exemple Cloudflare R2 ou AWS S3.

### Limites du plan gratuit

Le plan gratuit convient à une démonstration courte, pas à la production : les services web gratuits se mettent en veille, leur système de fichiers est éphémère, le PostgreSQL gratuit expire après 30 jours, les ports SMTP usuels sont bloqués et les commandes de pré-déploiement utilisées pour les migrations sont réservées aux services payants. Voir [Render Free](https://render.com/docs/free) et [les déploiements](https://render.com/docs/deploys).

Le Blueprint utilise donc deux services web 1c-2g, un PostgreSQL 0.5c-1g avec 15 Go et un Cron payant. Les plans peuvent être réduits pour une recette, puis remontés avant production.

## 2. Créer le compte Render

1. Ouvrir [render.com](https://render.com/) et cliquer sur **Get Started**.
2. Créer le compte avec GitHub ou une adresse professionnelle.
3. Vérifier l’adresse e-mail.
4. Créer ou sélectionner un workspace, par exemple Africa Ingenierie.
5. Activer la double authentification du compte propriétaire.
6. Ajouter les collaborateurs avec le rôle minimal nécessaire.
7. Ajouter le moyen de paiement du workspace si les services payants sont retenus.

Ne partagez jamais le compte propriétaire et ne mettez aucun secret dans Git.

## 3. Préparer Git

Render déploie un dépôt Git connecté. Le ZIP est une archive ; il faut publier le monorepo dans un dépôt privé GitHub ou GitLab.

Depuis C:\Projet\Projets- ING :

~~~powershell
git status
git add render.yaml .env.render.example apps/web apps/cms/package.json
git add scripts/backup-render.sh infra/docker/backup-render.Dockerfile
git add docs/deploiement-render.md
git commit -m "Prepare Render deployment"
git push origin main
~~~

Contrôles avant le push :

~~~powershell
git check-ignore -v .env.local .env.render apps/cms/.bootstrap-users.local.json
git grep -n -I -E "(change-me|password=|MINIO_SECRET_KEY=|SMTP_PASSWORD=)" -- ":!*.md" ":!*.example"
~~~

Le fichier render.yaml est le contrat d’infrastructure. Les variables sync false sont demandées par Render lors de la première création ; elles ne doivent pas être remplacées par des secrets dans ce fichier.

## 4. Créer les buckets durables

Render ne fournit pas MinIO managé. Créez chez un fournisseur S3 compatible deux buckets distincts :

| Bucket | Usage | Clé recommandée |
|---|---|---|
| africa-media | uploads Payload | clé limitée à ce bucket |
| africa-backups | dumps et archive médias | clé dédiée aux sauvegardes |

Pour africa-media, notez l’endpoint HTTPS, la région, le bucket et les clés. Pour africa-backups, activez la versioning ou l’immutabilité si elle existe et gardez BACKUP_ENCRYPTION_KEY dans un gestionnaire de secrets séparé.

Dans l’application, MINIO_ENDPOINT est saisi sans schéma car Payload compose https:// avec MINIO_USE_SSL=true. Dans le Cron, MEDIA_ENDPOINT et BACKUP_S3_ENDPOINT sont des URL complètes en https://.

## 5. Configurer le SMTP

Utilisez un fournisseur SMTP transactionnel :

~~~text
SMTP_HOST=smtp.fournisseur.example
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=...
SMTP_PASSWORD=...
SMTP_FROM_ADDRESS=no-reply@votre-domaine
CONTACT_TO=boite-de-reception-de-l-entreprise
~~~

Mailpit valide uniquement le développement local. En production, testez un vrai formulaire et vérifiez la réception, l’audit Payload, le message générique côté navigateur et l’absence de secrets dans les logs.

## 6. Créer le Blueprint

1. Dans Render, cliquer sur **New +**, puis **Blueprint**.
2. Connecter GitHub ou GitLab et sélectionner le dépôt privé.
3. Choisir la branche main et le fichier render.yaml à la racine.
4. Vérifier les quatre ressources : web, CMS, PostgreSQL et backup.
5. Vérifier la région frankfurt et les plans.
6. Renseigner les variables privées demandées par sync false.
7. Laisser Render générer les variables generateValue true.
8. Confirmer la création.

Render relie automatiquement DATABASE_URL à PostgreSQL et CMS_INTERNAL_HOSTPORT à l’adresse privée du CMS. Les deux web services utilisent PORT=10000. Les scripts start n’imposent plus les ports locaux 3000 et 3001.

Ordre attendu : PostgreSQL, build CMS, migration Payload, démarrage CMS, build web, démarrage web, puis construction du Cron. Le preDeployCommand exécute pnpm --filter @africa-ingenierie/cms migrate avant le démarrage.

Les migrations ne doivent pas être placées dans startCommand. Consultez [la documentation Render des déploiements](https://render.com/docs/deploys).

## 7. Première connexion et vrais comptes

1. Ouvrir https://africa-ingenierie-cms.onrender.com/admin.
2. Créer le premier compte avec une adresse réelle du responsable.
3. Utiliser un mot de passe généré par un gestionnaire de mots de passe.
4. Dans Utilisateurs & rôles, créer les comptes nominatifs Administrateur, Publicateur et Éditeur.
5. Laisser l’obligation de changement du mot de passe initial active.
6. Tester chaque rôle avec un compte distinct.
7. Désactiver un compte devenu inutile au lieu de supprimer son historique.

BOOTSTRAP_USERS_ENABLED=false est volontaire en production. Le bootstrap local refuse une base distante et ne doit jamais créer les comptes .test sur Render.

## 8. Utiliser Render sans nom de domaine acheté

Les sous-domaines Render sont activés dans le Blueprint :

~~~text
https://africa-ingenierie-web.onrender.com/fr
https://africa-ingenierie-cms.onrender.com/admin
~~~

Copiez les URL réellement affichées par Render dans NEXT_PUBLIC_SITE_URL, PAYLOAD_PUBLIC_SERVER_URL et REVALIDATION_URL si le slug attribué diffère. Redéployez après ce changement, car ces valeurs servent aux canoniques, au sitemap, aux liens média et à l’API événements.

## 9. Ajouter un domaine personnalisé plus tard

1. Dans le service web, ouvrir Settings -> Custom Domains et ajouter votre-domaine.tld.
2. Dans le service CMS, ajouter admin.votre-domaine.tld.
3. Créer chez le registrar les enregistrements DNS indiqués par Render. Un sous-domaine utilise généralement un CNAME vers la cible affichée ; le domaine racine utilise la cible A ou ALIAS indiquée par Render.
4. Supprimer les anciens enregistrements contradictoires et les AAAA si Render demande l’IPv4.
5. Attendre la validation DNS et le certificat TLS automatique.
6. Mettre à jour dans Render :

~~~text
NEXT_PUBLIC_SITE_URL=https://votre-domaine.tld
PAYLOAD_PUBLIC_SERVER_URL=https://admin.votre-domaine.tld
REVALIDATION_URL=https://votre-domaine.tld/api/revalidate
AUTH_COOKIE_DOMAIN=admin.votre-domaine.tld
~~~

7. Redéployer le web et le CMS.
8. Après validation, renderSubdomainPolicy disabled peut être ajouté pour masquer les URL onrender.com.

Render gère automatiquement TLS pour les domaines validés. Voir [Custom Domains](https://render.com/docs/custom-domains).

## 10. Recette après déploiement

~~~powershell
$web = "https://africa-ingenierie-web.onrender.com"
$cms = "https://africa-ingenierie-cms.onrender.com"
Invoke-WebRequest "$web/healthz" -UseBasicParsing
Invoke-WebRequest "$web/readyz" -UseBasicParsing
Invoke-WebRequest "$cms/healthz" -UseBasicParsing
Invoke-WebRequest "$cms/readyz" -UseBasicParsing
Invoke-WebRequest "$web/api/openapi.json" -UseBasicParsing
Invoke-WebRequest "$web/api/events?locale=fr&limit=10" -UseBasicParsing
Invoke-WebRequest "$web/fr" -UseBasicParsing
~~~

Résultat attendu : réponses 200 pour les sondes et la page FR, JSON pour OpenAPI, uniquement des événements publiés et erreur 400 au-delà de la limite API.

Test de publication Produit :

1. Ouvrir /admin avec un Publicateur.
2. Modifier le Produit en français et en anglais et enregistrer le brouillon.
3. Publier.
4. Contrôler dans les logs CMS la validation, la version, l’audit et le webhook signé.
5. Contrôler dans les logs web la revalidation.
6. Ouvrir le catalogue et la page détail en FR et EN.
7. Simuler une panne de revalidation : l’erreur doit rester dans l’audit et l’ancienne version publiée doit rester visible.

Test RBAC : l’Éditeur ne publie pas, le Publicateur ne gère pas les utilisateurs et un compte désactivé est refusé. Testez aussi le contact, les uploads, les médias et l’API événements.

## 11. Sauvegardes et restauration

Le Cron africa-ingenierie-backup s’exécute à 02:30 UTC. Il exécute pg_dump, miroite les médias, chiffre les deux archives avec AES-256-CBC/PBKDF2, ajoute les SHA-256 puis envoie quatre fichiers dans le bucket backup. Le disque local du Cron est temporaire : sans bucket distant ou sans clé de chiffrement, le job doit échouer.

Après le premier passage, vérifiez les logs et les quatre objets. Une fois par mois, restaurez dans une base et un bucket temporaires :

~~~bash
openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 \
  -pass env:BACKUP_ENCRYPTION_KEY -in postgres-YYYYMMDDTHHMMSSZ.dump.enc \
  -out postgres.dump
pg_restore --no-owner --no-privileges --clean --if-exists \
  --dbname="$DATABASE_URL_RESTORE" postgres.dump
openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 \
  -pass env:BACKUP_ENCRYPTION_KEY -in media-YYYYMMDDTHHMMSSZ.tar.gz.enc \
  -out media.tar.gz
tar -xzf media.tar.gz
~~~

Comparez checksums, lignes critiques, utilisateurs, contenus publiés et objets médias. Ne restaurez pas directement la production sans sauvegarde préalable.

## 12. CI, déploiement et rollback

Avant chaque push :

~~~powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm routes:check
git diff --check
~~~

Le push sur main déclenche les builds Render. En cas de régression, consultez les logs de build, migration et runtime, utilisez le dernier déploiement sain, puis corrigez la cause dans Git. Ne renversez jamais une migration Payload sans sauvegarde et plan de retour arrière.

Les migrations Payload sont versionnées dans apps/cms/src/migrations. Une migration modifiant le schéma doit être créée et testée localement avant le push.

## 13. Dépannage

| Symptôme | Cause à vérifier |
|---|---|
| pnpm not found | corepack enable, Node et lockfile |
| CMS 503 sur /readyz | DATABASE_URL, migration, région |
| Web 503 sur /readyz | CMS_INTERNAL_HOSTPORT ou CMS_INTERNAL_URL |
| Images absentes | endpoint, bucket, clés S3, SSL |
| Publication invisible | secret, URL et réponse du webhook |
| Contact en 502 | secret interne, Payload, SMTP |
| Cron en échec | clés média, clés backup, clé de chiffrement |
| Lenteur | plan gratuit, taille médias, cache et compilation |

## 14. Références officielles

- [Blueprint Render](https://render.com/docs/blueprint-spec)
- [Variables et secrets](https://render.com/docs/configure-environment-variables)
- [Monorepos](https://render.com/docs/monorepo-support)
- [PostgreSQL](https://render.com/docs/postgresql-creating-connecting)
- [Réseau privé](https://render.com/docs/private-network)
- [Health checks](https://render.com/docs/health-checks)
- [Domaines personnalisés](https://render.com/docs/custom-domains)
- [Cron Jobs](https://render.com/docs/cronjobs)
