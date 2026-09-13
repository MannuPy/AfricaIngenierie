# Préparer le déploiement OVH sans les accès du client

Ce guide liste les tâches réalisables avant de recevoir les accès SSH, les paramètres SMTP et les informations de sauvegarde. Il ne demande aucune modification du VPS et ne touche pas à `africaingenierie.com`.

## 1. Situation confirmée

```text
ingenierieafrica.com       → 213.32.70.178
www.ingenierieafrica.com   → 213.32.70.178
admin.ingenierieafrica.com → 213.32.70.178
africaingenierie.com       → 76.13.37.17
www.africaingenierie.com   → 76.13.37.17
```

Le site existant et le nouveau VPS sont séparés. Le domaine de test peut donc être préparé indépendamment.

## 2. Travaux possibles immédiatement

Sans accès au compte client, on peut :

1. vérifier le dépôt et rechercher les secrets accidentels ;
2. exécuter TypeScript, lint et tests ciblés ;
3. valider Docker Compose et les Dockerfiles ;
4. vérifier les migrations de base ;
5. préparer l’environnement OVH ;
6. préparer le dépôt Git privé et une version livrable ;
7. générer une clé SSH personnelle ;
8. préparer les commandes d’installation, sauvegarde et rollback ;
9. préparer la recette fonctionnelle et sécurité.

## 3. Contrôler le code localement

Depuis PowerShell, à la racine du projet :

```powershell
git status
git diff --check
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
```

Rechercher les fichiers sensibles versionnés :

```powershell
git ls-files | Select-String -Pattern '(^|/)(\.env|.*\.pem|.*\.key|id_ed25519|dump|backup)'
```

La commande ne doit pas afficher de secret réel. Les modèles `.env.example` sont acceptables, mais pas `.env.local`, `.env.ovh.test` ou une clé privée.

Rechercher les valeurs d’exemple :

```powershell
rg -n "change-me|generer-dans-render|BEGIN .* PRIVATE KEY" --glob '!pnpm-lock.yaml' --glob '!docs/**'
```

Les valeurs `change-me` doivent rester uniquement dans les modèles et être remplacées avant le lancement en production.

## 4. Valider Docker sans secret réel

La syntaxe Compose peut être contrôlée avec le modèle :

```powershell
$env:PRODUCTION_ENV_FILE='.env.ovh.test.example'
docker compose --env-file .env.ovh.test.example -f docker-compose.prod.yml config --quiet
```

Construire localement si Docker est disponible :

```powershell
docker compose --env-file .env.ovh.test.example -f docker-compose.prod.yml build
```

Ces commandes ne modifient pas OVH et ne démarrent pas le serveur distant.

## 5. Préparer l’environnement OVH

Le modèle prêt à l’emploi se trouve dans [`.env.ovh.test.example`](../.env.ovh.test.example).

Les valeurs de domaine doivent rester :

```dotenv
PUBLIC_DOMAIN=ingenierieafrica.com
ADMIN_DOMAIN=admin.ingenierieafrica.com
NEXT_PUBLIC_SITE_URL=https://ingenierieafrica.com
PAYLOAD_PUBLIC_SERVER_URL=https://admin.ingenierieafrica.com
CMS_INTERNAL_URL=http://cms:3001
COMPOSE_PROJECT_NAME=africa-ingenierie-test
PRODUCTION_ENV_FILE=.env.ovh.test
```

Les secrets à générer séparément sont notamment `PAYLOAD_SECRET`, `PREVIEW_SECRET`, `REVALIDATION_SECRET`, `CONTACT_HASH_SECRET`, `AUDIT_HASH_SECRET`, `CONTACT_INTERNAL_SECRET`, `CMS_INTERNAL_READ_SECRET`, `BACKUP_ENCRYPTION_KEY`, les mots de passe PostgreSQL/MinIO et le secret SMTP.

Ne réutilise pas les secrets locaux, Oracle, Render ou du site actuel.

## 6. Générer une clé SSH

Sur Windows :

```powershell
ssh-keygen -t ed25519 -C "ingenierieafrica-ovh-test"
```

Afficher uniquement la clé publique :

```powershell
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
```

La clé publique peut être donnée au client. Ne transmets jamais le fichier privé `C:\Users\pc\.ssh\id_ed25519`.

## 7. Préparer le dépôt de livraison

Le projet doit être dans un dépôt Git privé. Vérifier :

```powershell
git status
git log -1 --oneline
git tag --list
```

Créer un tag seulement après validation complète :

```powershell
git tag -a ovh-test-2026-09-09 -m "Préparation déploiement OVH de test"
```

Le déploiement doit toujours être rattaché à un commit ou un tag précis.

## 8. Commandes prévues sur le VPS

Ces commandes ne doivent être exécutées qu’après réception et vérification de l’accès SSH :

```bash
sudo apt update
sudo apt full-upgrade -y
sudo apt install -y ca-certificates curl git ufw fail2ban unattended-upgrades
sudo systemctl enable --now fail2ban
sudo timedatectl set-timezone Africa/Porto-Novo
sudo ss -tulpn
```

Avant le pare-feu, vérifier qu’aucun site existant n’utilise les ports 80 et 443. Le pare-feu final doit laisser uniquement SSH, HTTP et HTTPS ; PostgreSQL, MinIO, CMS et Next.js restent privés.

## 9. Installer le projet après validation du serveur

```bash
sudo mkdir -p /opt/africa-ingenierie-test
sudo chown "$USER":"$USER" /opt/africa-ingenierie-test
cd /opt/africa-ingenierie-test
git clone URL_DU_DEPOT_PRIVE .
cp .env.ovh.test.example .env.ovh.test
chmod 600 .env.ovh.test
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml config --quiet
```

Puis :

```bash
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml build --pull
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml up -d
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml ps
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml logs --tail=100 cms-migrate cms web nginx
```

Ne jamais utiliser `docker compose down -v` sur une base contenant des données : `-v` supprime les volumes.

## 10. Tests après installation

```bash
./scripts/oracle-tls.sh init
curl -I https://ingenierieafrica.com
curl -I https://admin.ingenierieafrica.com/admin
curl -I https://ingenierieafrica.com/healthz
curl -I https://admin.ingenierieafrica.com/readyz
```

Tester ensuite le CMS, les publications, le formulaire contact, les témoignages, les images, les vidéos, les PDF, les traductions, les réseaux sociaux, l’audit administrateur et la restauration d’une sauvegarde.

## 11. Ce qui reste impossible sans le client

Sans les accès client, il est impossible de manière sûre de se connecter au VPS, vérifier les ports, configurer le pare-feu, saisir les vrais secrets, configurer SMTP, activer les sauvegardes, générer le certificat TLS, exécuter les migrations distantes et vérifier une restauration réelle.

Il ne faut pas remplacer ces informations par des valeurs inventées ou par les secrets du site existant.

## 12. Informations minimales à demander

```text
Utilisateur SSH :
Clé SSH installée : oui/non
VPS dédié au nouveau site : oui/non
Accès KVM disponible : oui/non
Paramètres SMTP disponibles : oui/non
Solution de sauvegarde choisie :
```
