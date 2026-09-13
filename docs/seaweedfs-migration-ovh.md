# Migration du stockage média vers SeaweedFS

## Décision

Le projet utilise désormais SeaweedFS en mode `weed mini`, avec son API S3
compatible. Ce choix supprime les images MinIO qui ne sont plus disponibles
dans la préparation OVH et conserve l'interface S3 déjà utilisée par Payload.

La configuration est volontairement interne :

```text
Nginx : 80/443 public
  ├── web : 3000
  └── cms : 3001 ─── seaweedfs : 8333 (réseau Docker privé)
```

Le port 8333 n'est pas publié par `docker-compose.prod.yml`. Il ne faut donc
pas créer de DNS `s3.ingenierieafrica.com` ni de règle UFW pour SeaweedFS.
Le seul site public reste `https://ingenierieafrica.com/`. Le domaine
`africaingenierie.com` n'est pas concerné par cette migration.

## Migration du poste Windows

Votre `.env.local` actuel contient encore `MINIO_*`. Depuis PowerShell, à la
racine du projet, exécuter une seule fois :

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\migrate-local-env.ps1
```

Le script conserve les clés applicatives existantes, remplace les paramètres
de service par ceux de SeaweedFS, crée une clé de sauvegarde séparée et garde
une copie locale `.env.local.before-seaweedfs`. Il n'affiche aucune valeur
secrète. Vérifier ensuite :

```powershell
docker compose --env-file .env.local config --quiet
docker compose --env-file .env.local build seaweedfs backup
```

## Identités et permissions

Le conteneur génère son fichier S3 dans `/tmp` au démarrage ; ce fichier n'est
pas enregistré dans le dépôt. Deux identités sont générées à partir du fichier
de secrets du VPS :

| Identité | Utilisation | Permissions |
|---|---|---|
| `S3_ACCESS_KEY` / `S3_SECRET_KEY` | Payload CMS | lecture, écriture, liste et tags dans `S3_BUCKET` |
| `S3_BACKUP_ACCESS_KEY` / `S3_BACKUP_SECRET_KEY` | sauvegarde | lecture et liste dans `S3_BUCKET` |

Il n'y a pas d'accès anonyme. Les identifiants doivent être aléatoires et ne
doivent jamais être commités sur GitHub, même dans un dépôt privé.

## 1. Préparer les nouvelles variables sur le VPS

Cette opération se fait connecté avec l'utilisateur `ubuntu`, dans le dossier
du projet :

```bash
cd /opt/ingenierieafrica
cp .env.ovh.test .env.ovh.test.before-seaweedfs
chmod 600 .env.ovh.test .env.ovh.test.before-seaweedfs
nano .env.ovh.test
```

Dans `nano`, supprimer les anciennes lignes `MINIO_*` et ajouter ces lignes.
Remplacer chaque valeur `change-me` par une valeur réelle :

```dotenv
S3_ENDPOINT=seaweedfs
S3_PORT=8333
S3_USE_SSL=false
S3_REGION=us-east-1
S3_BUCKET=africa-media
S3_ACCESS_KEY=africa_app_une_valeur_aleatoire
S3_SECRET_KEY=une_valeur_secrete_longue_pour_application
S3_BACKUP_ACCESS_KEY=africa_backup_une_valeur_aleatoire
S3_BACKUP_SECRET_KEY=une_valeur_secrete_longue_pour_sauvegarde
```

Générer des valeurs sans caractères gênants pour un fichier `.env` :

```bash
openssl rand -hex 20
openssl rand -hex 48
openssl rand -hex 20
openssl rand -hex 48
```

Utiliser les quatre sorties dans l'ordre indiqué. Les valeurs `S3_ENDPOINT` et
`S3_PORT` ne sont pas des secrets : elles désignent le service Docker interne.
`S3_USE_SSL=false` est normal, car le chiffrement HTTPS est terminé par Nginx
sur 443 ; le stockage n'est jamais accessible directement depuis Internet.

Après l'enregistrement dans `nano` (`Ctrl+O`, Entrée, `Ctrl+X`) :

```bash
chmod 600 .env.ovh.test
stat -c '%a %n' .env.ovh.test
grep -nE '^(MINIO_|S3_)' .env.ovh.test | sed -E 's/(SECRET_KEY|ACCESS_KEY)=.*/\1=<valeur masquee>/'
```

La dernière commande vérifie les noms sans afficher les secrets complets.
L'ancienne copie `.env.ovh.test.before-seaweedfs` ne doit pas être commitée et
peut être supprimée uniquement après validation complète du nouveau stockage.

## 2. Vérifier la configuration avant tout démarrage

Toujours depuis `/opt/ingenierieafrica` :

```bash
set -a
. ./.env.ovh.test
set +a

NODE_ENV=production REQUIRED_PRODUCTION_SECRETS="PAYLOAD_SECRET CONTACT_INTERNAL_SECRET CMS_INTERNAL_READ_SECRET AUDIT_HASH_SECRET CONTACT_HASH_SECRET" ./scripts/assert-production-secrets.sh true
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml config --quiet
```

Un retour sans message signifie que la syntaxe Compose et les secrets
obligatoires sont acceptés. En cas d'erreur `S3_BACKUP_ACCESS_KEY is required`,
la variable manque dans `.env.ovh.test` ; corriger le fichier avant de continuer.

## 3. Construire et démarrer SeaweedFS

La commande suivante construit le petit wrapper du projet au-dessus de l'image
SeaweedFS versionnée. Le wrapper injecte les deux identités et démarre le
bucket `africa-media` sans exposer le port au VPS :

```bash
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml build seaweedfs
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml up -d seaweedfs
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml ps seaweedfs
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml logs --tail=100 seaweedfs
```

Le service doit être `Up` et son healthcheck doit passer. Le healthcheck
vérifie que le binaire SeaweedFS est vivant ; le test applicatif suivant vérifie
ensuite réellement l'accès S3 authentifié.

## 4. Tester l'accès S3 depuis le conteneur de sauvegarde

Construire le service de sauvegarde installe `aws-cli`, qui parle à SeaweedFS
via l'API S3. Le service n'est exécuté qu'à la demande :

```bash
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml build backup
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml run --rm --no-deps backup sh -lc 'aws --endpoint-url "$S3_ENDPOINT" s3 ls "s3://$S3_BUCKET"'
```

Une sortie vide est acceptable si le bucket est neuf. Une erreur
`AccessDenied` signifie que les identifiants ou la configuration des actions
ne correspondent pas ; ne pas rendre le bucket public pour contourner cette
erreur.

## 5. Démarrer la plateforme

Quand SeaweedFS est sain et que le test S3 passe :

```bash
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml up -d
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml ps
```

Vérifier que seuls les ports Nginx sont publiés :

```bash
sudo ss -lntup
```

La sortie attendue côté application est 80 et 443. Il ne doit pas y avoir de
8333, 9000, 9001, 3000, 3001 ou 5432 écoutant sur l'IP publique.

## 6. Tester le domaine autorisé

Les tests finaux doivent utiliser exclusivement :

```text
https://ingenierieafrica.com/
https://www.ingenierieafrica.com/
https://admin.ingenierieafrica.com/admin
```

Ne modifier aucune entrée DNS, redirection, messagerie ou hébergement liée à
`africaingenierie.com`. Le stockage SeaweedFS n'utilise aucun sous-domaine
public.

## 7. Sauvegarde et restauration

Lancer une sauvegarde manuelle après le premier upload média :

```bash
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml --profile ops run --rm backup
ls -lh /var/lib/docker/volumes/africa-ingenierie_oracle_backups/_data
```

Le script chiffre le dump PostgreSQL et une archive des objets S3 avec
`BACKUP_ENCRYPTION_KEY`. Il produit un checksum SHA-256 et un HMAC. Une
sauvegarde n'est considérée valide qu'après un test de restauration dans un
environnement séparé ; la présence du fichier seule ne prouve pas qu'il est
restaurable.

## Retour arrière

Ne pas exécuter `docker compose down -v` : cette commande détruirait les
volumes de données. En cas de problème, arrêter seulement les services puis
consulter les logs :

```bash
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml stop seaweedfs cms web nginx
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml logs --tail=200 seaweedfs cms
```

Le volume `seaweedfs_data` doit être conservé jusqu'à la validation de la
migration et de la restauration. Les anciennes variables MinIO ne doivent pas
être réintroduites dans le fichier de production.
