# Déploiement complet sur Oracle Cloud Free Tier

Version : 29 août 2026  
Projet : Africa Ingénierie  
Domaine cible : `africaingenieries.com`  
Administration : `admin.africaingenieries.com`

Ce guide part de la création du compte Oracle et conduit jusqu’à la mise en
ligne contrôlée de Next.js, Payload CMS, PostgreSQL, MinIO et Nginx.

## 0. Important : le domaine `.com` n’est pas fourni par Oracle

Oracle Cloud Free Tier fournit des ressources cloud gratuites sous certaines
limites, mais ne fournit pas automatiquement un nom de domaine `.com` gratuit.
Le domaine `africaingenieries.com` doit être enregistré auprès d’un registrar
ou déjà être détenu par le Client.

Le domaine retenu pour ce projet est exactement :

```text
africaingenieries.com
admin.africaingenieries.com
```

Si le domaine n’est pas enregistré, arrêtez-vous avant la configuration DNS et
Let’s Encrypt. Un certificat ne peut être émis que lorsque les deux noms
résolvent vers l’adresse IP publique du VPS.

## 1. Créer le compte Oracle Cloud

Utilisez les pages officielles :

- [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
- [Documentation Free Tier](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier.htm)

Oracle distingue l’essai promotionnel limité dans le temps et les ressources
Always Free qui restent gratuites dans les limites annoncées. Les limites,
les régions et la capacité disponible peuvent évoluer.

### 1.1 Préparer les informations

Préparez une adresse e-mail durable, un téléphone, une carte bancaire pour la
vérification, votre identité exacte, un mot de passe unique et une application
d’authentification MFA.

La carte sert à la vérification. Ne sélectionnez aucune ressource payante sans
avoir d’abord configuré une alerte de budget.

### 1.2 Procédure d’inscription

1. Ouvrez `https://www.oracle.com/cloud/free/`.
2. Cliquez sur **Sign Up for Free**.
3. Choisissez correctement votre pays.
4. Saisissez votre nom, votre e-mail et un mot de passe unique.
5. Validez l’e-mail reçu.
6. Validez le numéro de téléphone par SMS ou appel.
7. Renseignez les informations de paiement demandées.
8. Acceptez les conditions du service.
9. Choisissez la **Home Region**.
10. Attendez l’activation de la tenancy, puis ouvrez la console OCI.

Choisissez la Home Region avec soin : les ressources Always Free de calcul
doivent être créées dans cette région. En cas de message `Out of host
capacity`, essayez une autre Availability Domain ou réessayez plus tard.

### 1.3 Sécuriser le compte

Après la première connexion, activez la MFA, créez un groupe d’administration
séparé, configurez une alerte de budget et conservez les codes de récupération
hors du VPS. Ne partagez jamais le compte propriétaire Oracle.

## 2. Créer le compartiment de production

Dans la console :

1. Ouvrez **Identity & Security > Compartments**.
2. Cliquez sur **Create Compartment**.
3. Nom : `africa-ingenierie-prod`.
4. Description : `Production web Africa Ingenierie`.
5. Utilisez ce compartiment pour le réseau, la machine et les volumes.

## 3. Créer le réseau VCN

1. Ouvrez **Networking > Virtual Cloud Networks**.
2. Cliquez sur **Start VCN Wizard**.
3. Sélectionnez **Create VCN with Internet Connectivity**.
4. Choisissez `africa-ingenierie-prod`.
5. Nom : `africa-ingenierie-vcn`.
6. Utilisez par exemple `10.0.0.0/16`.
7. Créez un subnet public pour le VPS.

L’assistant crée normalement la VCN, l’Internet Gateway, les routes et les
règles de base. Voir [la documentation OCI sur la création d’instance](https://docs.oracle.com/en-us/iaas/Content/Compute/Tasks/launchinginstance.htm).

## 4. Générer la clé SSH sous Windows

Dans PowerShell sur votre ordinateur :

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.ssh" | Out-Null
ssh-keygen -t ed25519 -C "africa-ingenierie-oracle" -f "$env:USERPROFILE\.ssh\africa-ingenierie-oracle"
Get-Content "$env:USERPROFILE\.ssh\africa-ingenierie-oracle.pub"
```

Copiez uniquement le contenu du fichier `.pub` dans Oracle. Le fichier privé
ne doit jamais être envoyé dans Git, un ticket ou le VPS.

## 5. Créer l’instance Always Free

Dans **Compute > Instances > Create instance** :

1. Nom : `africa-ingenierie-prod`.
2. Compartiment : `africa-ingenierie-prod`.
3. Image : Ubuntu LTS 64 bits disponible dans votre région.
4. Shape : `VM.Standard.A1.Flex`.
5. Ressources : au maximum 2 OCPU et 12 Go de RAM selon les limites Always Free.
6. VCN : `africa-ingenierie-vcn` et subnet public.
7. Activez une IPv4 publique.
8. Ajoutez la clé publique SSH.
9. Choisissez par exemple un volume de démarrage de 100 Go.
10. Vérifiez la mention **Always Free-eligible** avant de créer.

L’Ampere A1 est ARM64. Les images officielles de ce projet doivent être
compatibles ARM64 et la compilation de `sharp` doit être validée. Si A1 est
indisponible, essayez une autre Availability Domain.

Notez l’IP publique, la région, l’Availability Domain et l’OCID de l’instance.

## 6. Configurer les ports réseau

Dans la Security List ou le Network Security Group du subnet, créez uniquement
ces règles ingress stateful :

| Source | Protocole | Port | Usage |
|---|---|---:|---|
| Votre IP d’administration | TCP | 22 | SSH |
| `0.0.0.0/0` | TCP | 80 | ACME et redirection HTTP |
| `0.0.0.0/0` | TCP | 443 | Site et administration HTTPS |

N’ouvrez jamais les ports 5432, 9000, 9001, 3000, 3001, 8025, 8080 ou 8443.

## 7. Se connecter et sécuriser Ubuntu

Depuis Windows :

```powershell
ssh -i "$env:USERPROFILE\.ssh\africa-ingenierie-oracle" ubuntu@IP_DU_VPS
```

Sur le VPS :

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl git ufw fail2ban jq openssl
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from VOTRE_IP_PUBLIQUE to any port 22 proto tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
uname -m
free -h
df -h
```

Remplacez `VOTRE_IP_PUBLIQUE` avant d’activer UFW. Gardez la session SSH ouverte
pendant le test afin de pouvoir corriger une règle sans vous bloquer.

## 8. Installer Docker

Suivez de préférence la documentation Docker pour Ubuntu. Sur un VPS neuf :

```bash
curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
sudo sh /tmp/get-docker.sh
rm -f /tmp/get-docker.sh
sudo usermod -aG docker "$USER"
newgrp docker
docker version
docker compose version
```

Pour une instance Ampere, `uname -m` doit retourner `aarch64`. Configurez aussi
une rotation des logs Docker :

```bash
sudo mkdir -p /etc/docker
sudo sh -c 'printf "%s\n" "{\"log-driver\":\"json-file\",\"log-opts\":{\"max-size\":\"10m\",\"max-file\":\"3\"}}" > /etc/docker/daemon.json'
sudo systemctl restart docker

## 9. Configurer le DNS du domaine

### 9.1 DNS chez le registrar

Dans l’interface qui gère `africaingenieries.com`, créez :

| Nom | Type | Valeur | TTL |
|---|---|---|---:|
| `@` | A | IP publique du VPS | 300 |
| `admin` | A | IP publique du VPS | 300 |

Ne créez pas de AAAA si IPv6 n’est pas réellement configuré. Un AAAA erroné
peut rendre le site inaccessible à certains visiteurs.

Depuis Windows :

```powershell
Resolve-DnsName africaingenieries.com -Type A
Resolve-DnsName admin.africaingenieries.com -Type A
```

### 9.2 DNS public OCI, option alternative

Dans **Networking > DNS Management > Zones**, créez une zone publique
`africaingenieries.com`, ajoutez les deux enregistrements A, puis déléguez chez
le registrar les nameservers fournis par OCI.

Références : [DNS public OCI](https://docs.oracle.com/en-us/iaas/Content/DNS/Concepts/gettingstarted.htm) et [ajout d’un enregistrement](https://docs.oracle.com/en-us/iaas/Content/DNS/Tasks/record-add.htm).

## 10. Installer le dépôt

Sur le VPS :

```bash
sudo mkdir -p /opt/africa-ingenierie
sudo chown -R "$USER":"$USER" /opt/africa-ingenierie
cd /opt/africa-ingenierie
git clone URL_DU_DEPOT .
git checkout TAG_OU_COMMIT_VALIDE
```

Ne copiez pas `.env.local` du poste de développement.

## 11. Créer les secrets de production

```bash
cp .env.oracle.example .env.oracle
chmod 600 .env.oracle
```

Remplacez chaque valeur `change-me`. Générez des secrets distincts :

```bash
openssl rand -hex 48
openssl rand -hex 48
openssl rand -hex 48
openssl rand -hex 48
```

Utilisez des valeurs différentes pour `PAYLOAD_SECRET`, `PREVIEW_SECRET`,
`REVALIDATION_SECRET`, `CONTACT_INTERNAL_SECRET`, `CMS_INTERNAL_READ_SECRET`,
`CONTACT_HASH_SECRET` et `BACKUP_ENCRYPTION_KEY`.

Vérifiez notamment :

```dotenv
PUBLIC_DOMAIN=africaingenieries.com
ADMIN_DOMAIN=admin.africaingenieries.com
NEXT_PUBLIC_SITE_URL=https://africaingenieries.com
PAYLOAD_PUBLIC_SERVER_URL=https://admin.africaingenieries.com
CMS_INTERNAL_URL=http://cms:3001
```

Configurez les vrais identifiants SMTP, les clés MinIO, `CERTBOT_EMAIL` et une
clé de sauvegarde conservée hors du VPS. Le mot de passe PostgreSQL dans
`DATABASE_URL` doit être URL-encodé ; utilisez de préférence une valeur
alphanumérique.

Contrôlez que le fichier est ignoré :

```bash
git check-ignore -v .env.oracle
```

## 12. Construire et démarrer la production

```bash
docker compose --env-file .env.oracle -f docker-compose.prod.yml config --quiet
docker compose --env-file .env.oracle -f docker-compose.prod.yml build --pull
docker compose --env-file .env.oracle -f docker-compose.prod.yml up -d
docker compose --env-file .env.oracle -f docker-compose.prod.yml ps
docker compose --env-file .env.oracle -f docker-compose.prod.yml logs --tail=100 cms-migrate cms web nginx
```

L’ordre attendu est : PostgreSQL et MinIO sains, migration Payload réussie,
CMS sain, Next.js sain, puis Nginx. Sur ARM64, surveillez la compilation de
`sharp` et n’utilisez pas d’image non vérifiée pour contourner une incompatibilité.

## 13. Émettre le certificat TLS

Avant cette étape, les deux DNS doivent résoudre vers le VPS et les ports 80/443
doivent être ouverts dans OCI et UFW.

```bash
chmod 0755 scripts/oracle-tls.sh
./scripts/oracle-tls.sh init
```

Le script lance Nginx en bootstrap HTTP, réalise le défi ACME pour les deux
domaines, puis relance Nginx avec TLS 1.2/1.3 et la CSP de production.

Tests :

```bash
curl -I https://africaingenieries.com
curl -I https://admin.africaingenieries.com/admin
curl -I https://africaingenieries.com/healthz
curl -I https://admin.africaingenieries.com/readyz
```

L’administration doit retourner `X-Robots-Tag: noindex, nofollow, noarchive`.

Ajoutez le renouvellement quotidien :

```cron
15 3 * * * cd /opt/africa-ingenierie && flock -n /run/lock/africa-tls.lock ./scripts/oracle-tls.sh renew >> /var/log/africa-tls.log 2>&1
```

N’utilisez pas le certificat réel pour des essais répétés : Let’s Encrypt impose
des limites de fréquence. Utilisez staging en préproduction.

## 14. Créer les vrais comptes Payload

Le script `bootstrap:users` est réservé au développement local et refuse
`NODE_ENV=production`. Ne l’utilisez pas pour les comptes réels.

1. Ouvrez `https://admin.africaingenieries.com/admin`.
2. Créez le premier compte lorsque Payload le propose.
3. Donnez le rôle Administrateur uniquement au responsable désigné.
4. Créez ensuite les Publicateurs et Éditeurs depuis le dashboard.
5. Supprimez toute adresse `.test` et tout compte de démonstration.
6. Utilisez des mots de passe uniques et activez la MFA si elle est disponible.

## 15. Médias et MinIO

Le bucket MinIO est privé. `minio-init` crée le compte applicatif limité au
bucket média ; les identifiants root servent uniquement à l’administration et
aux sauvegardes.

```bash
docker compose --env-file .env.oracle -f docker-compose.prod.yml logs --tail=100 minio-init
docker compose --env-file .env.oracle -f docker-compose.prod.yml exec cms node -e "fetch('http://127.0.0.1:3001/readyz').then(r=>process.exit(r.ok?0:1))"
```

Importez un média via Payload, vérifiez son affichage public et confirmez que
les ports 9000 et 9001 ne sont pas accessibles depuis Internet.

## 16. Sauvegardes et rotation

Le service `backup` crée un dump PostgreSQL, une archive MinIO, des fichiers
chiffrés AES-256-CBC/PBKDF2 et des sommes SHA-256. Il supprime les fichiers
locaux dépassant `BACKUP_RETENTION_DAYS`.

Test manuel :

```bash
docker compose --env-file .env.oracle -f docker-compose.prod.yml --profile ops run --rm backup
```

Cron quotidien :

```cron
30 2 * * * cd /opt/africa-ingenierie && flock -n /run/lock/africa-backup.lock docker compose --env-file .env.oracle -f docker-compose.prod.yml --profile ops run --rm backup >> /var/log/africa-backup.log 2>&1
```

Le volume du VPS ne protège pas contre sa perte. Configurez un stockage
externe avec `BACKUP_S3_ENDPOINT`, `BACKUP_S3_BUCKET`, `BACKUP_S3_ACCESS_KEY`
et `BACKUP_S3_SECRET_KEY`. Les fichiers sont chiffrés avant l’envoi.

## 17. Restauration contrôlée

Ne restaurez jamais directement en production sans sauvegarde préalable et
fenêtre de maintenance. Déchiffrez un dump dans un environnement temporaire :

```bash
openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 \
  -pass env:BACKUP_ENCRYPTION_KEY \
  -in postgres-AAAAMMJJTHHMMSSZ.dump.enc -out postgres.dump
```

Restaurez PostgreSQL avec `pg_restore` vers une base temporaire, puis vérifiez
les tables, les migrations, les utilisateurs et les contenus publiés. Pour
MinIO, restaurez dans un bucket temporaire et comparez le nombre d’objets et
leurs sommes avant toute bascule.

## 18. Mise à jour et rollback

Avant chaque mise à jour :

```bash
cd /opt/africa-ingenierie
git fetch --all --tags
git checkout TAG_OU_COMMIT_VALIDE
docker compose --env-file .env.oracle -f docker-compose.prod.yml --profile ops run --rm backup
docker compose --env-file .env.oracle -f docker-compose.prod.yml build --pull
docker compose --env-file .env.oracle -f docker-compose.prod.yml up -d
docker compose --env-file .env.oracle -f docker-compose.prod.yml ps
```

Conservez l’image et le commit précédents. Une migration irréversible ne doit
pas être annulée automatiquement par un rollback de code.

## 19. Monitoring et recette finale

Surveillez `/healthz`, `/readyz`, l’expiration TLS, l’espace disque, la mémoire,
les erreurs Nginx 4xx/5xx, les erreurs de revalidation, l’âge de la dernière
sauvegarde et la latence de l’API événements.

Avant ouverture publique, vérifiez :

- routes FR/EN, canonical, hreflang, sitemap et robots ;
- catalogue et détail Produit après publication Payload ;
- refus RBAC des trois rôles ;
- formulaire, anti-robot, rate limit et SMTP ;
- upload média et textes alternatifs FR/EN ;
- Lighthouse mobile Performance et Accessibility supérieurs ou égaux à 90 ;
- axe-core, Trivy, dépendances et OWASP ZAP ;
- restauration PostgreSQL/MinIO ;
- absence de `change-me` et de ports internes exposés.

## Références officielles

- [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
- [Ressources Always Free](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm)
- [Créer une instance](https://docs.oracle.com/en-us/iaas/Content/Compute/Tasks/launchinginstance.htm)
- [DNS public OCI](https://docs.oracle.com/en-us/iaas/Content/DNS/Concepts/gettingstarted.htm)
- [Ajouter un enregistrement DNS](https://docs.oracle.com/en-us/iaas/Content/DNS/Tasks/record-add.htm)
```
