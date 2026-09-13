# Déploiement OVH du site ingenierieafrica.com

## Objet du document

Ce document définit la préparation et la procédure de déploiement de la plateforme Africa Ingénierie sur le VPS OVH fourni par le Client.

Le périmètre public est strictement limité à `https://ingenierieafrica.com/`. Le domaine `africaingenierie.com` est hors périmètre et ne doit subir aucune modification. Les enregistrements de messagerie, Microsoft 365 et les sous-domaines qui ne sont pas nécessaires au site restent également inchangés.

Le sous-domaine `admin.ingenierieafrica.com` est uniquement l’interface technique d’administration Payload. Il ne constitue pas un second site public. Le public doit être redirigé vers le domaine principal.

## Comment lire ce guide quand on débute sur OVH

Ce guide décrit une mise en production contrôlée. Il ne suffit pas de « copier le projet sur le VPS » : il faut d’abord vérifier ce qui existe déjà, préparer le serveur, installer les services, relier le domaine, activer HTTPS, puis effectuer une recette complète.

Les commandes sont regroupées par endroit d’exécution :

- **Poste Windows** : commandes PowerShell exécutées sur l’ordinateur du Client ; elles servent surtout à vérifier le DNS et l’accès réseau.
- **VPS OVH** : commandes Ubuntu exécutées après connexion SSH ; elles modifient le serveur et doivent être saisies dans l’ordre.
- **Gestionnaire OVH** : actions effectuées dans l’espace client OVH, principalement la vérification de la zone DNS.
- **CMS** : actions effectuées dans l’interface Payload à l’adresse `https://admin.ingenierieafrica.com/admin`.

Un bloc précédé de `sudo`, `docker` ou `./scripts` est destiné au VPS. Un bloc PowerShell est explicitement identifié. Ne jamais exécuter une commande Ubuntu dans PowerShell, ni une commande PowerShell dans le terminal SSH.

### Glossaire pratique

| Terme | Signification | Pourquoi c’est important ici |
|---|---|---|
| Domaine | Nom lisible comme `ingenierieafrica.com` | C’est l’adresse que les visiteurs utilisent ; elle ne contient pas le serveur par elle-même. |
| DNS | Annuaire qui associe un nom à une adresse | Une erreur DNS peut envoyer les visiteurs vers un ancien serveur. |
| Enregistrement A | Association nom → IPv4 | `ingenierieafrica.com` doit résoudre vers `213.32.70.178`. |
| CNAME | Alias d’un nom vers un autre nom | Utile pour `www`, mais il ne doit pas remplacer les entrées mail sans vérification. |
| MX, SPF, DKIM, DMARC | Enregistrements de messagerie et d’authentification | Les modifier peut interrompre les mails ; ils sont donc hors périmètre. |
| VPS | Serveur virtuel loué chez OVH | Il exécute les conteneurs du site, du CMS, de la base et du stockage. |
| IPv4 publique | Adresse accessible depuis Internet | `213.32.70.178` est la cible fournie pour ce déploiement. |
| SSH | Connexion administrateur chiffrée au serveur | Elle permet d’exécuter les commandes Ubuntu sans interface graphique. |
| Pare-feu/UFW | Filtrage des ports réseau | Seuls SSH contrôlé, HTTP et HTTPS doivent être accessibles. |
| Docker | Moteur qui exécute des services isolés | Il évite d’installer chaque composant directement dans Ubuntu. |
| Image | Modèle immuable d’un service | Elle est construite depuis le code et ses dépendances. |
| Conteneur | Instance en fonctionnement d’une image | `web`, `cms`, `postgres`, `minio` et `nginx` sont des conteneurs distincts. |
| Volume | Données persistantes hors du conteneur | La base et les fichiers médias doivent survivre à une recréation. |
| Nginx | Reverse proxy et serveur HTTPS | Il reçoit Internet sur 80/443 et transmet vers les services internes. |
| Migration | Évolution versionnée de la structure de base | Elle doit être appliquée avant d’utiliser la nouvelle version du code. |
| TLS/HTTPS | Chiffrement de la connexion web | Il protège les identifiants, le formulaire contact et l’administration. |
| Propagation DNS | Délai de mise à jour des résolveurs | Un ancien résultat peut rester visible pendant le TTL ; ce n’est pas forcément une panne. |

### Ordre global et raison de cet ordre

```text
Inventaire non destructif
        ↓
Sauvegarde et préparation du VPS
        ↓
Installation Docker + configuration secrète
        ↓
Validation locale de la configuration
        ↓
Démarrage de la pile et migrations
        ↓
Vérification DNS minimale
        ↓
HTTPS/TLS et redirection canonique
        ↓
CMS, contenus, tests et preuve de non-interférence
```

Cet ordre réduit le risque : on ne change pas le DNS avant de savoir si le serveur est prêt, on ne lance pas une migration sans sauvegarde et on ne déclare pas le site disponible avant d’avoir testé le domaine public et l’administration.

### Ce que les informations OVH permettent — et ne permettent pas — de conclure

Les 6 vCPU, 12 Go de RAM et 100 Go sont suffisants pour la pile prévue à charge normale, avec une réserve à surveiller pour les médias, les logs et les sauvegardes. Le datacenter de Gravelines identifie la localisation de l’infrastructure. L’IPv4 indique où doit arriver le trafic web.

Ces informations ne prouvent pas encore qu’aucun autre site n’utilise déjà les ports 80/443, que Docker, Nginx, les sauvegardes et l’envoi SMTP sont opérationnels. La connexion SSH et l’identité du système sont désormais confirmées par la recette ci-dessous ; les autres points restent à vérifier.

## Décision de périmètre

| Élément | Décision | Action autorisée |
|---|---|---|
| `ingenierieafrica.com` | Domaine public cible | Pointer vers le VPS OVH |
| `www.ingenierieafrica.com` | Alias public | Pointer vers le domaine principal ou rediriger vers lui |
| `admin.ingenierieafrica.com` | Administration CMS uniquement | Pointer vers le même VPS, accès authentifié |
| `api.ingenierieafrica.com` | Cible actuelle distincte dans l’export DNS | Ne pas modifier pendant cette préparation |
| `africaingenierie.com` | Domaine existant hors périmètre | Ne toucher à aucun enregistrement |
| MX, SPF, DKIM, DMARC | Messagerie | Ne pas modifier |
| `ftp`, `mail`, `smtp`, `pop3`, `imap` | Services existants | Ne pas modifier |
| Microsoft 365 et autodiscover | Services de messagerie/collaboration | Ne pas modifier |

La plateforme utilise les routes `/api/...` du domaine public et ne nécessite pas le sous-domaine `api.ingenierieafrica.com` pour fonctionner. L’enregistrement `api` observé dans le CSV continue donc vers sa cible actuelle tant qu’une décision séparée n’a pas été prise.

## Informations du VPS OVH

Les informations suivantes proviennent des données fournies et de la connexion SSH réussie du 12 septembre 2026. Elles doivent toujours être recontrôlées avant l’installation de Docker ou la modification d’un service.

| Paramètre | Valeur |
|---|---|
| Nom | `vps-09c6339d.vps.ovh.net` |
| IPv4 publique | `213.32.70.178` |
| IPv6 annoncée | `2001:41d0:367:10f4::1` |
| Système | Ubuntu 26.04 |
| Région OpenStack | `os-gra6` |
| Datacenter | Gravelines, France |
| Ressources | 6 vCPU, 12 Go RAM, 100 Go disque |
| Offre | VPS-3 2027 |

### Preuve de connexion SSH réussie

La connexion suivante a été réalisée depuis PowerShell :

```powershell
ssh ubuntu@213.32.70.178
```

Le serveur a accepté le compte `ubuntu` et a affiché le prompt :

```text
ubuntu@vps-09c6339d:~$
```

Cette preuve confirme les éléments suivants : l’IPv4 `213.32.70.178` est joignable sur SSH, le VPS démarre correctement sur Ubuntu 26.04 LTS, le nom système est `vps-09c6339d`, et le compte `ubuntu` peut ouvrir une session. Le mot de passe utilisé n’est pas reproduit dans ce document.

Les informations système affichées indiquent également : utilisation de la racine `3.0%` sur `95.85GB`, mémoire utilisée `2%`, charge système `0.22`, swap utilisée `0%`, 173 processus et aucune autre session connectée au moment du relevé. Ces valeurs sont un instantané, pas une garantie de capacité en production.

### Résultat de l’inventaire réseau du 12 septembre 2026

Le relevé exécuté dans la session `ubuntu` confirme que l’interface `ens3` est active avec `213.32.70.178/32` et `2001:41d0:367:10f4::1/128`. Ces préfixes `/32` et `/128` sont normaux pour l’adressage public fourni par OVH ; il ne faut pas modifier manuellement Netplan avant le déploiement.

Le service SSH écoute sur `0.0.0.0:22` et `[::]:22`. Le résolveur DNS local écoute sur `127.0.0.53:53`, et Chrony écoute uniquement sur localhost. Aucun port `80`, `443`, `3000`, `3001`, `5432`, `9000` ou `9001` n’est en écoute dans le relevé. Le VPS ne semble donc héberger actuellement aucun serveur Web ou conteneur applicatif ; cette conclusion doit être confirmée par `systemctl` et les fichiers présents avant installation.

Lors du premier relevé, la commande Docker a répondu `sudo: docker: command not found`. Docker Engine a ensuite été installé avec succès depuis le dépôt officiel Docker. La forme correcte de la commande de vérification est :

```bash
sudo docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}'
```

Dans les premières commandes recopiées dans le relevé, il manquait une accolade dans `{{.Image}}`. La commande corrigée a ensuite produit l’en-tête `NAMES IMAGE PORTS` sans erreur.

### Résultat de l’installation Docker du 12 septembre 2026

L’installation a installé et activé `docker-ce`, `docker-ce-cli`, `containerd.io`, `docker-buildx-plugin`, `docker-compose-plugin`, ainsi que les dépendances nécessaires. Le service Docker a été activé avec systemd. Les messages indiquant que `docker.io`, `docker-doc`, `podman-docker`, `containerd` et `runc` n’étaient pas installés sont informatifs : aucun paquet existant n’a été supprimé.

La commande suivante a répondu sans erreur :

```bash
sudo docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}'
```

Le résultat ne contient que l’en-tête `NAMES IMAGE PORTS`, sans conteneur. Cela confirme que Docker fonctionne et qu’aucune pile applicative n’a encore été démarrée sur le VPS.

Le compte `ubuntu` a été ajouté au groupe Docker avec `sudo usermod -aG docker "$USER"`. Ce changement ne s’applique pas toujours à la session courante. Fermer puis rouvrir la session SSH avant d’utiliser `docker` sans `sudo`.

Les mises à jour Ubuntu affichées au début de la procédure n’ont pas toutes été installées : le système indiquait encore 33 paquets pouvant être mis à niveau. Avant de construire le projet, exécuter `sudo apt update`, puis `sudo apt full-upgrade -y`, et vérifier ensuite si un redémarrage est demandé.

Le message `client_loop: send disconnect: Connection reset` indique que la session SSH précédente a été interrompue par le réseau, le client ou le serveur. Comme une nouvelle connexion `ubuntu` a réussi immédiatement, ce message ne bloque pas actuellement l’accès ni le déploiement. Avant d’installer Docker, relever les journaux pour distinguer une coupure isolée d’un redémarrage ou d’un problème SSH répété :

```bash
uptime
last -x | head -20
sudo journalctl -u ssh --since '2026-09-12 19:20:00' --no-pager
sudo journalctl -b -p warning..alert --no-pager
```

Depuis PowerShell, une connexion avec maintien de session peut limiter les coupures dues à l’inactivité :

```powershell
ssh -o ServerAliveInterval=30 -o ServerAliveCountMax=3 ubuntu@213.32.70.178
```

Si la coupure réapparaît, ne pas modifier `sshd_config` au hasard. Conserver le message exact, l’heure UTC, le résultat de `last -x` et les journaux SSH ; une analyse complémentaire sera nécessaire.

### Ce que les captures OVH confirment

Les captures du Manager OVH constituent un état de référence à conserver avant toute action :

| Élément observé | Valeur ou état | Conséquence pour le déploiement |
|---|---|---|
| VPS | `vps-09c6339d.vps.ovh.net` | C’est le serveur à administrer par SSH. |
| Statut | Actif | Le VPS est allumé au moment de la capture ; cela ne prouve pas que SSH ou Docker sont prêts. |
| Système | Ubuntu 26.04 | Le compte initial attendu est généralement `ubuntu`, pas `root`. |
| Démarrage | `LOCAL` | Le VPS démarre sur son disque normal ; ne pas sélectionner Rescue ou une réinstallation sans procédure. |
| IPv4 | `213.32.70.178` | Adresse à utiliser dans la commande SSH et pour les entrées web du domaine cible. |
| IPv6 | `2001:41d0:367:10f4::1` | Ne pas publier ni utiliser avant configuration et test IPv6 complets. |
| Passerelle IPv6 | `2001:41d0:367::1` | Information réseau utile, mais aucune modification IPv6 n’est requise pour le premier déploiement. |
| DNS secondaire VPS | Aucun domaine configuré | Ne pas activer cette fonction pour ce déploiement ; le DNS reste géré dans la zone du domaine. |
| Disque additionnel | Désactivé | Les données commencent sur le disque principal ; surveiller les 100 Go et prévoir les sauvegardes externes. |
| Région | `os-gra6`, Gravelines | Confirme la localisation, sans changer la procédure SSH ou Docker. |

### Les comptes visibles dans OVH ne sont pas les comptes du serveur

La capture du compte OVH affiche `@ Africa Ingénierie` et des contacts avec les rôles administrateur, technique et facturation. L’identifiant `kw103247-ovh` est un identifiant de compte ou de contact OVH ; ce n’est pas un compte Linux et ce n’est pas un mot de passe SSH.

| Compte ou identifiant | Utilisation | Où l’utiliser | Où ne pas l’utiliser |
|---|---|---|---|
| Compte Manager OVH | Gérer le VPS, les domaines, les DNS et la facturation | `manager.ovhcloud.com` | Jamais dans `ssh`, Docker ou Payload. |
| `kw103247-ovh` | Contact/identifiant OVH visible dans le Manager | Gestion des contacts et droits OVH | Ne pas le tester comme utilisateur ou mot de passe Linux. |
| `ubuntu` | Compte Linux initial d’une image Ubuntu OVH standard | `ssh ubuntu@213.32.70.178` | Ne pas supposer que son mot de passe est celui du Manager. |
| `root` | Super-utilisateur Linux interne | `sudo -s` après connexion avec un compte sudo | Ne pas utiliser `ssh root@...` par défaut. |
| Compte nominatif | Administration quotidienne après installation | `ssh prenom@213.32.70.178` puis `sudo` | Ne pas partager ce compte entre plusieurs personnes. |
| Compte CMS Payload | Gestion éditoriale du site | `https://admin.ingenierieafrica.com/admin` | Ne pas l’utiliser pour SSH. |
| Boîte mail professionnelle | Réception et réponse aux contacts | Webmail/Outlook/SMTP configuré | Ne pas l’utiliser comme mot de passe VPS. |

Le mot de passe Linux initial est transmis dans l’e-mail de livraison du VPS, souvent par lien sécurisé. Si cet e-mail n’est pas disponible, il faut récupérer l’accès avec KVM ou le mode Rescue ; il n’est pas possible de déduire ce mot de passe à partir des captures.

### Services OVH existants à préserver

Les captures montrent également un hébergement Web partagé `ingenia.cluster100.hosting.ovh.net` actif, avec son IPv4 `5.135.23.164`, ainsi qu’un service mail actif pour `ingenierieafrica.com`. Leur association exacte avec les contenus actuels doit être confirmée avant migration, mais ils doivent être considérés comme **hors périmètre** tant que cette vérification n’est pas faite.

Le service mail affiche un plan MX Plan actif, des comptes utilisés et des enregistrements MX Microsoft 365/Outlook. Il ne faut pas supprimer l’hébergement Web, résilier le MX Plan, modifier les MX ou remplacer les entrées SPF/DKIM/DMARC pour faire fonctionner le VPS. Le VPS hébergera la nouvelle pile applicative ; le mail restera un service séparé.

L’IPv6 ne doit pas être publiée dans le DNS tant qu’elle n’est pas installée, routée, filtrée par pare-feu et testée de bout en bout.

## Lecture de l’export DNS fourni

Le fichier `domain-ingenierieafrica.com-redirection-2026-09-12_08_27_05.csv` indique :

| Nom | Type | Cible observée | Décision pour OVH |
|---|---|---|---|
| `ingenierieafrica.com` | A | `213.32.70.178` | Conforme au VPS cible |
| `www.ingenierieafrica.com` | A | `213.32.70.178` | À remplacer de préférence par CNAME ou redirection canonique |
| `admin.ingenierieafrica.com` | A | `213.32.70.178` | Conforme pour le CMS |
| `api.ingenierieafrica.com` | A | `76.13.37.17` | Hors nouvelle pile, ne pas modifier |
| `mail`, `smtp`, `pop3`, `imap` | CNAME | `ssl0.ovh.net` | À conserver |
| DKIM OVH | CNAME | Cibles OVH | À conserver |
| Microsoft 365 | CNAME/SRV | Cibles Microsoft | À conserver |
| `ftp` | CNAME | `ingenierieafrica.com` | Ne pas modifier sans vérification de son usage |

Le fait que les trois entrées principales pointent déjà vers `213.32.70.178` ne prouve pas que le VPS héberge actuellement la plateforme. Il faut vérifier le serveur avant d’arrêter ou de remplacer un service.

## Règle de non-interférence avec l’autre domaine

Avant toute action :

1. vérifier si le VPS contient déjà un site ou un reverse proxy ;
2. relever les conteneurs et services actifs ;
3. relever la configuration Nginx/Apache existante ;
4. identifier les domaines actuellement servis ;
5. ne pas arrêter de service existant ;
6. ne pas modifier la zone DNS de `africaingenierie.com` ;
7. ne pas réutiliser les secrets ou certificats de l’autre site ;
8. utiliser un projet Docker, une base, un bucket et des certificats dédiés.

### Cloud Shell OVH et terminal du VPS ne sont pas la même chose

Le **Cloud Shell** affiché dans votre capture est un terminal temporaire fourni par le Manager OVH. Il sert à lancer certaines commandes de gestion OVH, mais il ne représente pas le système Ubuntu de votre VPS. C’est pourquoi `hostnamectl`, `sudo` ou `ip -brief address` y répondent par `unknown command` ou par une erreur de paramètres.

Les commandes suivantes doivent être lancées **dans Ubuntu sur le VPS**, après une connexion SSH : `hostnamectl`, `ip -brief address`, `ss`, `sudo`, `docker`, `systemctl` et `nginx`. Le prompt confirmé pour ce VPS est `ubuntu@vps-09c6339d:~$`; après création d’un compte nominatif, il ressemblera à `prenom@vps-09c6339d:~$`. Un prompt `>>>` ou `ovhcloud` indique encore le Cloud Shell.

La connexion SSH de référence est décrite dans la section **Préparation du serveur Ubuntu — procédure débutant**. Une fois connecté avec le prompt `ubuntu@vps-09c6339d:~$`, exécuter l’inventaire ci-dessous. Pour quitter le VPS, saisir `exit` ; cela ferme la session SSH, pas le serveur.

Commandes de constat **à exécuter après la connexion SSH dans le VPS** :

```bash
hostnamectl
ip -brief address
sudo ss -lntup
sudo docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}'
sudo systemctl --type=service --state=running
sudo nginx -T 2>/dev/null | grep -E 'server_name|listen' || true
```

### Comment exécuter l’inventaire sans casser l’existant

1. Ouvrir le gestionnaire OVH et vérifier que le nom du VPS, l’IPv4 et le statut correspondent aux informations ci-dessus.
2. Se connecter au VPS avec SSH, puis exécuter les commandes de constat une par une.
3. Copier la sortie dans un fichier de preuve daté, sans y inclure de mot de passe, de clé privée ou de fichier `.env`.
4. Lire les résultats avant toute installation.

Interprétation rapide :

- `sudo ss -lntup` affiche les ports en écoute. Si un service écoute déjà sur 80 ou 443, il peut s’agir d’un site existant ; arrêter la procédure et l’identifier.
- `docker ps` affiche les conteneurs déjà actifs. Ne pas lancer `docker compose down`, `docker system prune` ou une commande similaire pour « faire de la place ».
- `systemctl --type=service --state=running` révèle les services Ubuntu actifs, par exemple Nginx, Apache, Caddy ou une application existante.
- `nginx -T` affiche la configuration effective. Les noms de domaine présents doivent être relevés avant toute modification.
- `sudo du -sh /var/lib/docker` indique l’espace déjà utilisé par Docker ; 100 Go ne signifie pas que 100 Go sont libres.

Depuis **Windows PowerShell**, vérifier seulement l’état réseau :

```powershell
Resolve-DnsName ingenierieafrica.com -Type A
Resolve-DnsName www.ingenierieafrica.com -Type A
Resolve-DnsName admin.ingenierieafrica.com -Type A
Test-NetConnection 213.32.70.178 -Port 22
Test-NetConnection 213.32.70.178 -Port 80
Test-NetConnection 213.32.70.178 -Port 443
```

`TcpTestSucceeded : True` signifie que le port répond au niveau réseau ; cela ne prouve pas que le site est correctement configuré. Une résolution DNS vers la bonne IP ne prouve pas non plus que Nginx sert le bon domaine.

### Condition d’arrêt obligatoire

Si l’inventaire montre un autre site sur le VPS, un Nginx déjà utilisé, un service sur 80/443 ou un projet Docker inconnu, **ne pas installer la configuration Nginx de ce projet et ne pas arrêter le service**. Il faut d’abord documenter l’existant et choisir une intégration avec reverse proxy partagé, ou un VPS dédié. Cette précaution protège notamment `africaingenierie.com` et tout autre site hébergé sur la machine.

Si le VPS contient déjà le site actuel, l’installation ne doit pas continuer avec le Nginx livré par ce projet sur les ports 80 et 443. Il faudra d’abord utiliser un second VPS ou intégrer les deux sites dans un reverse proxy commun après inventaire.

## Architecture OVH cible

```text
Internet
   |
   +-- 80/443 --> Nginx OVH
                    |
                    +-- ingenierieafrica.com --> web Next.js
                    |
                    +-- admin.ingenierieafrica.com --> Payload CMS
                                                   |
                                                   +-- PostgreSQL privé
                                                   +-- MinIO privé
                                                   +-- SMTP sortant
```

Seuls Nginx et les ports 80/443 doivent être accessibles depuis Internet. PostgreSQL, MinIO, le CMS interne et les ports applicatifs ne doivent pas être publiés.

## Corrections intégrées avant la préparation OVH

Les corrections suivantes ont été appliquées dans le code :

- les médias sont privés par défaut et deviennent publics uniquement après validation explicite ;
- les liens éditoriaux refusent les protocoles dangereux ;
- le formulaire contact limite réellement le flux HTTP à 32 Ko ;
- les exports CSV neutralisent les formules interprétables par Excel ;
- les champs de consentement, rétention et empreintes réseau sont protégés contre les modifications éditoriales ;
- l’audit ne recopie plus les principales données personnelles des messages ;
- GraphQL est désactivé car l’API OpenAPI événements suffit au besoin identifié ;
- les healthchecks vérifient la disponibilité réelle avec `/readyz` ;
- les secrets de production doivent respecter une longueur minimale ;
- un bandeau de consentement cookies est présent côté site public ;
- les exemples de production utilisent désormais `ingenierieafrica.com` et non l’ancien domaine mal configuré ;
- une migration ajoute la colonne de contrôle des médias publics.

Le champ média public implique une étape de validation éditoriale : après migration, un média n’est pas exposé anonymement tant qu’il n’a pas été marqué public dans le CMS.

## Préparer GitHub avant le transfert vers le VPS

GitHub n’est pas obligatoire pour faire fonctionner le VPS, mais il est fortement recommandé : il conserve l’historique du code, permet de revenir à une version connue, déclenche la CI et évite de copier manuellement un dossier Windows incomplet. Le dépôt distant actuellement configuré localement est `MannuPy/AfricaIngenierie` ; vérifier que ce dépôt appartient au bon compte et le garder privé tant que le projet contient des documents internes.

Avant toute commande `push`, vérifier l’état du dépôt depuis PowerShell, à la racine du projet :

```powershell
cd "C:\Projet\Projets- ING"
git status
git remote -v
git diff --cached --stat
git diff --stat
```

Le dépôt observé est actuellement au milieu d’un rebase interactif (`HEAD detached`, rebase de `main`). Ne pas exécuter `git push`, `git reset --hard`, `git checkout --` ou `git add .` dans cet état. Examiner les changements indexés et non indexés, puis terminer le rebase uniquement lorsque les fichiers sont compris :

```powershell
git -c core.editor=true rebase --continue
git status
```

Si Git signale encore un conflit ou si un fichier important semble manquer, s’arrêter et conserver la sortie de `git status` avant toute autre action. Après la fin du rebase, créer une branche de préparation et ne pousser que les éléments utiles :

```powershell
git switch -c codex/ovh-preparation
git add .gitignore .dockerignore .env.ovh.test.example
git add .github/workflows/ci.yml README.md package.json pnpm-lock.yaml pnpm-workspace.yaml
git add apps packages infra scripts
git add docs/*.md docs/*.yaml docs/*.sql
git status
git commit -m "Prepare production deployment on OVH"
git push -u origin codex/ovh-preparation
```

Cette sélection évite d’ajouter par accident `.env.local`, un vrai `.env.ovh.test`, des clés privées, des sauvegardes, des fichiers temporaires Word ou des artefacts de génération. Vérifier la liste affichée par `git status` avant le `commit`. La branche doit être contrôlée par la CI et fusionnée dans `main` seulement après correction de tous les échecs.

Pour cloner un dépôt privé sur le VPS, utiliser une clé de déploiement en lecture seule, distincte de la clé SSH personnelle d’administration. Dans la session `ubuntu` :

```bash
ssh-keygen -t ed25519 -C "ovh-deploy@ingenierieafrica.com" -f ~/.ssh/id_ed25519_github
cat ~/.ssh/id_ed25519_github.pub
```

Copier uniquement la ligne publique affichée dans GitHub : **Settings → Deploy keys → Add deploy key**, avec l’option lecture seule. Ne jamais copier `~/.ssh/id_ed25519_github` dans GitHub ni dans le dépôt. Puis, sur le VPS :

```bash
install -d -m 700 ~/.ssh
cat >> ~/.ssh/config <<'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_github
  IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config
ssh -T git@github.com
```

Après confirmation de l’accès au dépôt :

```bash
git clone --branch codex/ovh-preparation git@github.com:MannuPy/AfricaIngenierie.git /opt/ingenierieafrica
cd /opt/ingenierieafrica
git status --short
```

Une clé de déploiement ne donne pas les droits OVH, les droits Linux ou l’accès au CMS : elle sert uniquement à lire le code GitHub.

## Préparation du serveur Ubuntu — procédure débutant

### 1. Préparer l’accès SSH depuis Windows

SSH est la porte d’administration du VPS. Une clé SSH possède une partie publique, que l’on peut déposer sur le serveur, et une partie privée, qui doit rester uniquement sur le PC administrateur.

Dans **PowerShell Windows**, vérifier d’abord si une clé existe :

```powershell
Test-Path $env:USERPROFILE\.ssh\id_ed25519
```

Si la réponse est `False`, créer une clé moderne :

```powershell
ssh-keygen -t ed25519 -C "ovh-ingenierieafrica-admin"
```

Accepter le chemin proposé, puis choisir une phrase secrète longue. Ne jamais envoyer le fichier `id_ed25519` ; seul `id_ed25519.pub` peut être copié vers le VPS.

Pour une première installation Ubuntu OVH, ne supposez pas que le compte `root` est utilisable par SSH. Le compte initial est généralement `ubuntu`, et son mot de passe temporaire est transmis dans l’e-mail de livraison du VPS, souvent via un lien sécurisé. Le compte `root` peut être désactivé pour SSH ou ne disposer d’aucun mot de passe.

Le mot de passe du Manager OVH, l’identifiant `kw103247-ovh`, le nom du VPS et le mot de passe d’une boîte mail ne sont pas des mots de passe SSH. Ne les utilisez pas dans la commande SSH.

Si vous disposez déjà d’une clé SSH installée sur le VPS, utilisez-la pour le compte initial indiqué par l’e-mail :

```powershell
ssh -i "$env:USERPROFILE\.ssh\id_ed25519" ubuntu@213.32.70.178
```

Si vous n’avez pas encore de clé installée, utilisez le compte et le mot de passe temporaire indiqués dans l’e-mail OVH :

```powershell
ssh ubuntu@213.32.70.178
```

Si vous avez lancé auparavant `ssh root@213.32.70.178` et voyez `root@213.32.70.178's password:`, annuler avec `Ctrl+C`. Ce prompt attend un mot de passe root distinct, qui n’est pas nécessaire pour ce VPS et n’est pas celui du Manager OVH.

Pendant la saisie du mot de passe, aucun caractère ni astérisque ne s’affiche : c’est normal. À la première connexion, OVH peut demander de remplacer le mot de passe temporaire ; la session peut se fermer automatiquement après cette opération. Reconnectez-vous alors avec le nouveau mot de passe.

Le terminal peut demander la confirmation de l’empreinte du serveur. Vérifier cette empreinte dans le Manager OVH ou dans la console KVM avant d’accepter, afin d’éviter une connexion au mauvais serveur.

Une fois connecté, vérifier l’utilisateur et ses droits :

```bash
whoami
id
hostnamectl
```

Si la sortie indique `ubuntu` avec le groupe `sudo`, utilisez `sudo` pour les opérations administrateur. Il n’est pas nécessaire de se connecter directement en root.

Pour remplacer ensuite le mot de passe par une clé SSH, ouvrir une nouvelle fenêtre PowerShell et copier uniquement la clé publique vers le compte `ubuntu` :

```powershell
Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub" | ssh ubuntu@213.32.70.178 "umask 077; mkdir -p ~/.ssh; cat >> ~/.ssh/authorized_keys"
```

La commande demandera encore une fois le mot de passe `ubuntu`, puis ajoutera la clé. Tester avec :

```powershell
ssh -i "$env:USERPROFILE\.ssh\id_ed25519" ubuntu@213.32.70.178
```

Ne désactiver l’authentification par mot de passe qu’après ce test réussi et après avoir conservé une seconde session SSH ouverte.

### Étape immédiate après la connexion réussie

Dans la fenêtre où le prompt est `ubuntu@vps-09c6339d:~$`, exécuter les commandes suivantes une par une :

```bash
whoami
id
sudo -v
hostnamectl
ip -brief address
sudo ss -lntup
sudo docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}'
```

La commande `sudo -v` vérifie que le mot de passe du compte `ubuntu` permet d’obtenir temporairement les droits administrateur ; elle ne modifie pas le serveur. `hostnamectl` et `ip` confirment l’identité et les adresses du VPS. `ss` inventorie les ports en écoute. `docker ps` peut afficher un message indiquant que Docker n’est pas installé : c’est acceptable à ce stade, car Docker sera installé plus loin.

Avant toute commande d’installation, copier ces résultats dans une preuve datée et vérifier particulièrement les ports `80` et `443`. Si un service inconnu les utilise, s’arrêter et ne pas l’arrêter automatiquement.

Si SSH fonctionne, créer immédiatement un compte nominatif (remplacer `prenom` par un identifiant réel) :

```bash
adduser prenom
usermod -aG sudo prenom
install -d -m 700 -o prenom -g prenom /home/prenom/.ssh
cp /home/ubuntu/.ssh/authorized_keys /home/prenom/.ssh/authorized_keys
chown prenom:prenom /home/prenom/.ssh/authorized_keys
chmod 600 /home/prenom/.ssh/authorized_keys
```

Ouvrir un **second** terminal PowerShell et tester avant de fermer la session `ubuntu` :

```powershell
ssh prenom@213.32.70.178
```

Ne désactiver l’authentification par mot de passe qu’après ce test réussi. Une erreur de configuration SSH peut verrouiller l’administrateur hors du serveur ; garder la console KVM OVH disponible comme accès de secours. Il n’est pas nécessaire d’activer la connexion SSH directe de `root`.

### 2. Mettre Ubuntu à jour et installer les outils de base

Dans la session SSH du compte nominatif :

```bash
sudo apt update
sudo apt full-upgrade -y
sudo apt install -y ca-certificates curl git ufw fail2ban unattended-upgrades openssh-server jq unzip
sudo timedatectl set-timezone Africa/Porto-Novo
sudo systemctl enable --now fail2ban
sudo systemctl enable --now unattended-upgrades
```

Rôle de chaque action : `apt update` actualise l’index des paquets ; `full-upgrade` installe les correctifs ; `ufw` gère le pare-feu ; `fail2ban` bloque les tentatives SSH répétées ; `unattended-upgrades` installe automatiquement certains correctifs de sécurité ; `git`, `curl`, `jq` et `unzip` sont nécessaires aux opérations de déploiement et de diagnostic.

Vérifier avant de continuer :

```bash
lsb_release -a
timedatectl status
df -h /
free -h
```

Le disque racine doit avoir une marge confortable. Si l’espace libre est faible, ne pas lancer de build Docker : nettoyer ou agrandir le disque après inventaire, sans supprimer aveuglément `/var/lib/docker`.

### 3. Durcir SSH et activer le pare-feu

D’abord, remplacer `ADRESSE_IP_ADMIN` par l’IP publique fixe du poste ou du VPN d’administration. Si l’IP d’administration change souvent, ouvrir temporairement SSH à une adresse connue, puis resserrer la règle ; ne jamais activer le pare-feu sans avoir autorisé le chemin SSH utilisé.

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 80/tcp comment 'HTTP pour ACME et redirection HTTPS'
sudo ufw allow 443/tcp comment 'HTTPS public'
sudo ufw allow from ADRESSE_IP_ADMIN to any port 22 proto tcp comment 'SSH administration'
sudo ufw enable
sudo ufw status numbered
```

HTTP 80 est nécessaire pour la redirection et la validation initiale des certificats ; HTTPS 443 est le trafic public ; SSH 22 est réservé à l’administration. Les ports `3000`, `3001`, `5432`, `9000` et `9001` ne doivent pas être autorisés.

Après avoir ouvert une seconde session SSH, vérifier :

```bash
sudo ss -lntup
sudo ufw status verbose
```

Attention : Docker peut publier un port de conteneur via ses propres règles réseau, parfois en contournant une règle UFW. La configuration de production doit donc publier uniquement Nginx sur 80/443, vérifier les ports réellement exposés avec `docker ps`, et ne jamais ajouter `ports:` pour PostgreSQL, MinIO, Web ou CMS. Si un port interne apparaît malgré tout, arrêter le déploiement et corriger Compose avant exposition publique.

### 4. Installer Docker Engine et Compose

La source recommandée est le dépôt officiel Docker pour Ubuntu. Ces commandes retirent seulement d’anciens paquets Docker incompatibles éventuels ; elles ne suppriment ni les volumes ni le projet, mais doivent tout de même être exécutées après l’inventaire :

```bash
for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt remove -y "$pkg"; done
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo \"${VERSION_CODENAME:-$UBUNTU_CODENAME}\") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
```

La dernière commande ajoute le compte au groupe Docker. Se déconnecter puis se reconnecter pour que ce droit soit pris en compte. Le groupe Docker donne un pouvoir proche de root ; il doit rester limité aux administrateurs de confiance.

Vérifier l’installation :

```bash
docker version
docker compose version
sudo systemctl is-active docker
docker run --rm hello-world
```

La page officielle Docker doit être consultée si le dépôt refuse le codename Ubuntu ou si l’image `hello-world` ne démarre pas. Ne pas installer une version trouvée au hasard sur Internet.

### 5. Créer le répertoire de déploiement

```bash
sudo install -d -m 0755 /opt/ingenierieafrica
sudo chown "$USER":"$USER" /opt/ingenierieafrica
cd /opt/ingenierieafrica
```

Le chemin dédié évite de mélanger ce projet avec une autre application. Si `/opt/ingenierieafrica` contient déjà des fichiers, les lister et les identifier avant de les remplacer :

```bash
find /opt/ingenierieafrica -maxdepth 2 -type f -printf '%p\n' | sort | head -100
```

### 6. Transférer le code sans transférer les secrets

Option recommandée, depuis le VPS :

```bash
git clone URL_DU_DEPOT_PRIVE /opt/ingenierieafrica
cd /opt/ingenierieafrica
git status --short
```

Remplacer `URL_DU_DEPOT_PRIVE` par l’URL réelle du dépôt. Pour un dépôt privé, utiliser une clé de déploiement limitée ou un jeton à durée contrôlée ; ne pas mettre ce jeton dans le code. Le dépôt doit contenir `docker-compose.prod.yml`, `.env.ovh.test.example`, `infra/` et `scripts/`.

Si le code n’est pas dans Git, utiliser un transfert chiffré depuis Windows, puis vérifier le contenu. Ne jamais transférer `.env.local`, `.env.production`, des clés privées, des certificats ou des sauvegardes contenant des données réelles.

Avant de construire :

```bash
cd /opt/ingenierieafrica
test -f docker-compose.prod.yml && echo 'Compose OK'
test -f .env.ovh.test.example && echo 'Template env OK'
grep -nE 'africaingenierie\.com|change-me|localhost|onrender' .env.ovh.test.example || true
```

La recherche de l’autre domaine dans le template sert à détecter une mauvaise valeur active ; la règle de non-interférence reste applicable à tout fichier de configuration.

## Configuration de production OVH

Utiliser un fichier local au VPS, jamais committé :

```bash
cd /opt/ingenierieafrica
cp .env.ovh.test.example .env.ovh.test
chmod 600 .env.ovh.test
nano .env.ovh.test
```

Dans `nano`, modifier les valeurs, enregistrer avec `Ctrl+O`, confirmer avec `Entrée`, puis quitter avec `Ctrl+X`. Le fichier `.env.ovh.test.example` est un modèle ; `.env.ovh.test` contient les vrais secrets et ne doit pas être envoyé dans Git, dans une capture d’écran ou dans un message.

Variables de domaine obligatoires :

```dotenv
PUBLIC_DOMAIN=ingenierieafrica.com
ADMIN_DOMAIN=admin.ingenierieafrica.com
NEXT_PUBLIC_SITE_URL=https://ingenierieafrica.com
PAYLOAD_PUBLIC_SERVER_URL=https://admin.ingenierieafrica.com
CMS_INTERNAL_URL=http://cms:3001
COMPOSE_PROJECT_NAME=africa-ingenierie-ovh
PRODUCTION_ENV_FILE=.env.ovh.test
```

Remplacer chaque valeur d’exemple par un secret aléatoire. Les secrets doivent être distincts des secrets locaux et de l’ancien site. Le mot de passe intégré à `DATABASE_URL` doit être encodé pour une URL PostgreSQL.

Pour générer une valeur aléatoire sans l’afficher dans le document, utiliser par exemple :

```bash
openssl rand -hex 32
```

Copier chaque résultat directement dans la variable concernée. Ne pas réutiliser la même valeur pour la base, les sessions, le hachage contact, MinIO et l’authentification SMTP. Pour `DATABASE_URL`, encoder les caractères spéciaux du mot de passe selon le format URL ; le plus simple pour un débutant est de choisir un mot de passe généré en hexadécimal, qui ne contient pas de caractère nécessitant un encodage supplémentaire.

Contrôler la configuration sans afficher les secrets :

```bash
chmod 600 .env.ovh.test
grep -nE 'change-me|CHANGE_ME|localhost|onrender|africaingenieries\.com' .env.ovh.test || true
./scripts/assert-production-secrets.sh .env.ovh.test
```

La première recherche doit ne rien retourner pour les valeurs interdites. La seconde commande vérifie la présence et la longueur minimale des secrets, mais elle ne vérifie pas qu’un compte SMTP, un bucket S3 ou une base externe existent réellement.

Ne pas mettre dans ce fichier :

- mot de passe en clair dans un ticket ou un message ;
- clé SSH privée ;
- certificat privé ;
- identifiant de l’autre site ;
- secret de l’ancien domaine.

## Déploiement Docker OVH

Depuis le répertoire du projet :

```bash
cd /opt/ingenierieafrica
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml config --quiet
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml build --pull
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml up -d
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml ps
```

Pourquoi ces quatre commandes :

1. `config --quiet` résout les variables et valide la syntaxe sans démarrer de service. Si elle échoue, corriger le fichier `.env` avant toute suite.
2. `build --pull` reconstruit les images avec les versions de base disponibles. C’est plus long, mais cela évite de démarrer une image locale obsolète.
3. `up -d` crée le réseau, les volumes et les conteneurs en arrière-plan.
4. `ps` montre l’état réel ; `Up` seul ne suffit pas, il faut aussi que les healthchecks indiquent `healthy`.

Ne jamais utiliser `docker compose down -v` en production : l’option `-v` supprime les volumes et peut détruire la base ou les médias. Pour une simple mise à jour, le Compose doit recréer uniquement les services concernés.

L’ordre attendu est : PostgreSQL et MinIO sains, migration terminée, CMS prêt, Web prêt, Nginx prêt.

Consulter les logs sans afficher le contenu du fichier d’environnement :

```bash
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml logs --tail=100 cms-migrate cms web nginx
```

Pour suivre un seul service pendant son démarrage :

```bash
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml logs -f --tail=100 cms
```

Quitter l’affichage avec `Ctrl+C` n’arrête pas le conteneur. Le statut des conteneurs peut ensuite être contrôlé avec :

```bash
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml ps
docker stats --no-stream
```

La migration `20260912_100000_public_media_gate` doit apparaître comme appliquée avant l’ouverture publique du site.

## DNS minimal à conserver

Le DNS est géré dans le Manager OVH, pas sur le VPS. Une modification DNS ne déploie aucun code : elle indique seulement aux visiteurs quelle adresse contacter. Avant une modification, exporter ou noter les lignes existantes et la date ; cela permet de comparer après l’opération.

Les captures montrent que la zone `ingenierieafrica.com` utilise les serveurs DNS OVH `dns16.ovh.net` et `ns16.ovh.net`. La protection DNSSEC, la protection contre le transfert et la protection des données apparaissent activées. Ces protections sont positives et ne doivent pas être désactivées pour déployer le site.

Dans le Manager OVH : **Web Cloud → Noms de domaine → ingenierieafrica.com → Zone DNS**. Vérifier le domaine affiché dans l’en-tête avant chaque clic. Ne pas ouvrir `africaingenierie.com`, et ne pas utiliser les actions de zone DNS depuis sa fiche.

La zone DNS cible doit être traitée avec une modification minimale :

| Nom | Type recommandé | Cible |
|---|---|---|
| `@` | A | `213.32.70.178` |
| `www` | CNAME ou A | `ingenierieafrica.com.` ou `213.32.70.178` |
| `admin` | A | `213.32.70.178` |

Dans les données fournies, `@`, `www` et `admin` pointent déjà vers `213.32.70.178`. Il n’est donc pas nécessaire de les supprimer et de les recréer. Pour un premier déploiement, conserver l’entrée `www` telle qu’elle est si elle pointe déjà vers la bonne IP ; la canonique HTTPS sera gérée par Nginx. Ne remplacer `www` par CNAME qu’après avoir vérifié qu’aucun service FTP ou autre usage ne dépend de cette entrée.

La capture de l’onglet « Redirection » confirme également les destinations suivantes : la racine, `www` et `admin` vont vers `213.32.70.178`, tandis que `api` va vers `76.13.37.17`. Cette différence est volontaire dans le périmètre actuel. Ne pas utiliser le bouton **Réinitialiser ma zone DNS** : il pourrait supprimer des entrées mail, Microsoft 365, FTP ou autres services existants.

Ne pas changer l’entrée `api` dans cette procédure. Ne pas changer les MX, SPF, DKIM, DMARC, autodiscover, sip, lyncdiscover, ftp, mail, smtp, pop3 ou imap. Une ligne ne doit être modifiée que si elle appartient exactement au périmètre public décrit dans ce document.

Résolution depuis un poste Windows :

```powershell
Resolve-DnsName ingenierieafrica.com -Type A
Resolve-DnsName admin.ingenierieafrica.com -Type A
Resolve-DnsName www.ingenierieafrica.com -Type CNAME
Resolve-DnsName africaingenierie.com -Type A
```

La dernière commande sert uniquement à vérifier que l’autre domaine n’a pas changé. Pour comparer précisément les données avant/après, conserver la sortie et relever l’IP, le type et le TTL de chaque entrée sensible.

Après une modification, vérifier depuis plusieurs réseaux si possible : Wi-Fi principal, partage de connexion mobile et un résolveur public. Le TTL peut conserver l’ancienne réponse pendant plusieurs heures. Ne pas modifier à nouveau la zone à chaque poste qui affiche encore l’ancienne IP.

## TLS et Nginx

Nginx est le seul composant qui doit recevoir les connexions Internet. Il termine TLS, force HTTPS, ajoute les en-têtes de sécurité et transmet ensuite vers `web` ou `cms` sur le réseau Docker privé. Le certificat doit couvrir `ingenierieafrica.com`, `www.ingenierieafrica.com` et `admin.ingenierieafrica.com`. Le sous-domaine `www` est accepté uniquement comme alias technique et redirige vers `https://ingenierieafrica.com` ; le contenu public canonique n’est jamais servi sous une seconde adresse.

Après propagation DNS et validation du VPS :

```bash
cd /opt/ingenierieafrica
ENV_FILE=/opt/ingenierieafrica/.env.ovh.test ./scripts/oracle-tls.sh init
```

Le nom du script est historique ; il configure la pile TLS de la pile OVH. La variable `ENV_FILE` est recommandée pour forcer l’utilisation du fichier de production. Le script démarre temporairement Nginx en HTTP, demande le certificat couvrant le domaine public, `www` et le sous-domaine d’administration, puis repasse Nginx en HTTPS. L’autorité ACME vérifie que le VPS contrôle le domaine. C’est pourquoi les entrées DNS et le port 80 doivent être corrects avant l’exécution. Ne pas demander plusieurs certificats en boucle en cas d’erreur : les autorités appliquent des limites. Lire d’abord le message, corriger DNS/pare-feu/Nginx, puis réessayer.

Vérifier :

```bash
curl -I http://ingenierieafrica.com
curl -I https://ingenierieafrica.com
curl -I https://admin.ingenierieafrica.com/admin
curl -I https://ingenierieafrica.com/readyz
curl -I https://admin.ingenierieafrica.com/readyz
```

Résultats attendus :

- HTTP redirige vers HTTPS ;
- certificat valide pour le domaine public et l’administration ;
- HSTS, CSP, `nosniff`, Referrer-Policy et Permissions-Policy présents ;
- les ports internes ne répondent pas depuis Internet ;
- l’administration est marquée noindex ;
- le domaine public canonique reste `https://ingenierieafrica.com`.

Depuis Windows, vérifier aussi le code de redirection et le certificat :

```powershell
curl.exe -I http://ingenierieafrica.com
curl.exe -I https://ingenierieafrica.com
curl.exe -I https://admin.ingenierieafrica.com/admin
```

Une réponse `301` ou `308` de HTTP vers HTTPS est attendue. Une réponse `401` ou `403` sur l’administration peut être normale si elle est générée par l’authentification ; une page publique qui affiche le CMS, une erreur de certificat ou une redirection vers un autre domaine est un échec.

## Initialisation éditoriale

Ouvrir `https://admin.ingenierieafrica.com/admin` dans un navigateur après validation TLS. Cette URL est privée et authentifiée ; le site public reste uniquement `https://ingenierieafrica.com/`.

Dans l’interface Payload :

1. créer les comptes réels ;
2. désactiver le bootstrap de développement ;
3. activer le MFA dès que le mécanisme choisi est disponible ;
4. supprimer ou archiver les contenus de démonstration ;
5. remplacer les visuels générés par des médias validés ;
6. marquer comme publics uniquement les médias effectivement affichés ;
7. compléter les contenus français et anglais ;
8. vérifier les titres, descriptions et images Open Graph ;
9. vérifier les mentions légales et la politique de confidentialité ;
10. vérifier le consentement cookies et la politique de rétention.

Créer un brouillon de test et vérifier qu’il n’est pas visible dans une fenêtre privée. Publier ensuite un contenu de test contrôlé, vérifier son affichage, puis le retirer ou l’archiver. Pour les médias, vérifier séparément qu’un fichier marqué `isPublic = false` renvoie un refus ou une absence de ressource pour un visiteur non connecté, tandis qu’un fichier approuvé et public est lisible.

Ne pas exécuter le seed de démonstration en production sans décision explicite : il peut créer des contenus, des utilisateurs ou des médias de test. Les comptes réels doivent avoir des mots de passe uniques et une politique de moindre privilège.

## Sauvegardes et retour arrière

Une sauvegarde utile comprend au minimum : la base PostgreSQL, les médias MinIO, le fichier de configuration de déploiement chiffré ou les secrets conservés dans un coffre, les certificats si leur restauration est nécessaire, et la version exacte du code. Un snapshot OVH aide à revenir à un état du disque, mais ne remplace pas une sauvegarde externe testée.

Avant migration ou mise à jour :

```bash
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml --profile ops run --rm backup
```

Configurer un stockage de sauvegarde externe au VPS. Tester une restauration dans une base et un bucket temporaires avant de déclarer la sauvegarde opérationnelle. Une sauvegarde n’est considérée valide que si l’on peut relire la base et récupérer un média dans un environnement isolé.

Documenter pour chaque sauvegarde : date UTC, version Git, taille, emplacement, résultat du job et date du dernier test de restauration. Limiter l’accès au stockage de sauvegarde et chiffrer les données sensibles. Vérifier aussi la durée de conservation et la suppression automatique, en cohérence avec la politique de rétention des messages contact.

En cas d’échec de démarrage :

```bash
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml ps
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml logs --tail=200 cms-migrate cms web nginx
```

Ne pas supprimer les volumes. Ne pas annuler une migration en production sans sauvegarde et procédure de retour arrière.

### Retour arrière sans toucher à l’autre domaine

Si la nouvelle version ne démarre pas, conserver le DNS et l’ancien service tant que l’architecture existante n’est pas connue. Capturer `docker compose ps`, les logs et l’heure de l’incident. Pour arrêter uniquement cette pile, depuis `/opt/ingenierieafrica` :

```bash
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml stop
```

Ne pas utiliser `down -v`, ne pas supprimer des volumes et ne pas modifier la zone DNS de `africaingenierie.com`. Si Nginx est partagé avec un autre site, ne pas arrêter Nginx : demander une procédure d’intégration adaptée. Le retour à une version Git antérieure ou la restauration de la base nécessite une décision documentée, car une migration de schéma peut rendre le retour applicatif non trivial.

## Recette de validation finale

La recette se fait dans cet ordre. Noter pour chaque ligne la date, la commande ou l’URL testée, le résultat observé et la preuve (capture ou sortie texte sans secret). Un seul échec de sécurité, de domaine ou de non-interférence bloque la mise en production.

| Contrôle | Critère d’acceptation |
|---|---|
| Domaine public | `https://ingenierieafrica.com` répond en HTTPS |
| Canonicalisation | `www` redirige ou reste un alias cohérent |
| Administration | `https://admin.ingenierieafrica.com/admin` répond avec authentification |
| Autre domaine | `africaingenierie.com` conserve sa cible et son contenu |
| DNS mail | MX, SPF, DKIM et DMARC inchangés |
| API séparée | `api.ingenierieafrica.com` reste inchangée dans cette procédure |
| Routes FR/EN | aucune route publique requise ne retourne 404 |
| Publication | un brouillon reste invisible anonymement |
| Médias | seuls les fichiers explicitement publics sont lisibles anonymement |
| Contact | validation, consentement, rate limit et SMTP fonctionnent |
| Cookies | acceptation, refus et réouverture des préférences fonctionnent |
| Sécurité | headers, TLS, RBAC et verrouillage vérifiés |
| Performance | Lighthouse mobile cible au moins 90 après exécution réelle |
| Accessibilité | axe sans erreur critique et test clavier manuel réussi |
| Sauvegarde | dump et médias restaurés dans un environnement isolé |
| Observabilité | logs, alertes d’échec et procédure d’incident documentés |

### Tests pratiques depuis Windows

```powershell
$site = "https://ingenierieafrica.com"
$admin = "https://admin.ingenierieafrica.com/admin"
Invoke-WebRequest -Uri $site -Method Head -MaximumRedirection 5
Invoke-WebRequest -Uri $admin -Method Head -MaximumRedirection 5
Resolve-DnsName ingenierieafrica.com -Type A
Resolve-DnsName admin.ingenierieafrica.com -Type A
```

Tester manuellement dans Chrome ou Edge : accueil, navigation française, navigation anglaise, formulaire contact, changement de langue, affichage sur mobile, clavier sans souris et absence de contenu de démonstration. Ne pas saisir de données personnelles réelles pendant le test du formulaire ; utiliser une adresse de recette et la supprimer après vérification.

Pour un test externe des ports, utiliser un poste qui n’est pas le VPS : 80 et 443 doivent répondre ; 3000, 3001, 5432, 9000 et 9001 doivent être inaccessibles. Un port interne accessible depuis Internet est une anomalie critique.

### Dépannage guidé

| Symptôme | Vérifications | Action sûre |
|---|---|---|
| SSH timeout/refusé | IP, port 22, règle UFW, statut `ssh` | Utiliser la console KVM OVH ; ne pas ouvrir SSH à tout Internet sans nécessité. |
| DNS affiche encore l’ancienne IP | `Resolve-DnsName`, TTL, autre réseau | Attendre la propagation et vérifier la zone exacte ; ne pas modifier `africaingenierie.com`. |
| Certificat impossible | DNS, ports 80/443, logs Nginx/ACME | Corriger une cause à la fois ; éviter les demandes répétées de certificat. |
| Nginx ne démarre pas | `docker compose ps`, logs `nginx`, ports 80/443 déjà occupés | Identifier le service occupant le port ; ne rien arrêter s’il est inconnu. |
| CMS unhealthy | logs `cms`, `cms-migrate`, connectivité PostgreSQL | Vérifier variables, migration et santé de la base ; ne pas supprimer le volume. |
| Web unhealthy | logs `web`, `CMS_INTERNAL_URL`, disponibilité CMS | Vérifier le réseau Docker et l’URL interne ; ne pas publier le port 3000. |
| Module ou police introuvable au build | logs de build, lockfile et dépendances | Refaire l’installation propre dans l’image ; ne pas contourner en désactivant le contrôle de build. |
| Migration en échec | logs `cms-migrate`, sauvegarde récente | Stopper la mise en production et restaurer seulement en environnement isolé pour analyse. |
| Disque presque plein | `df -h`, `docker system df` | Identifier les images/logs ; supprimer uniquement des artefacts explicitement identifiés et après sauvegarde. |
| Formulaire contact échoue | logs applicatifs, SMTP de recette, consentement | Vérifier SMTP et rate limit sans afficher les données du message. |
| Média public en 404 | champ `isPublic`, migration, URL générée | Approuver le média dans le CMS ; ne pas rendre tout le bucket public. |
| L’autre domaine change | comparaison DNS/HTTP avant-après | Bloquer la recette, rétablir uniquement l’élément prouvé et contacter OVH si nécessaire ; ne pas improviser. |

### Critères de feu vert

Le déploiement peut être déclaré terminé uniquement si les conditions suivantes sont toutes réunies :

1. `ingenierieafrica.com` et éventuellement `www` arrivent sur le VPS `213.32.70.178`.
2. `https://ingenierieafrica.com/` est l’unique adresse canonique publique annoncée.
3. `admin.ingenierieafrica.com` est limité à l’administration authentifiée et n’est pas présenté comme un second site.
4. `api.ingenierieafrica.com` conserve sa cible `76.13.37.17` dans cette procédure.
5. `africaingenierie.com`, ses contenus et sa zone DNS n’ont pas été touchés.
6. Les entrées mail, Microsoft 365 et FTP sont identiques à l’état de référence.
7. Les conteneurs sont sains, les migrations sont appliquées et aucun port interne n’est exposé.
8. HTTPS, les en-têtes de sécurité, l’authentification, le consentement, le contact et les médias ont été testés.
9. Une sauvegarde a réussi et une restauration isolée a été démontrée.
10. Les preuves de recette sont archivées sans secret.

### Quand s’arrêter et demander une vérification

S’arrêter immédiatement en cas de domaine inattendu, service inconnu sur 80/443, perte d’accès SSH, demande de supprimer un volume, erreur de migration sans sauvegarde, secret manquant, certificat pour le mauvais domaine ou modification imprévue du DNS mail. Ces situations nécessitent un inventaire complémentaire ; les forcer pourrait interrompre un autre service.

## État de validation au 12 septembre 2026

La connexion SSH au VPS a été validée le 12 septembre 2026 avec `ubuntu@213.32.70.178`. Le serveur a affiché Ubuntu 26.04 LTS, le nom `vps-09c6339d`, l’IPv4 et l’IPv6 attendues. L’inventaire réseau a confirmé que SSH est le seul service TCP public en écoute ; le compte `root` n’est pas requis. Une coupure SSH ponctuelle (`Connection reset`) a été observée, mais la reconnexion a réussi et doit être surveillée dans les journaux.

Les contrôles statiques TypeScript, ESLint et la syntaxe Compose ont été exécutés. Docker Engine et Compose sont maintenant installés et le résultat `docker ps` est propre, sans conteneur. Les mises à jour Ubuntu restantes, le test `hello-world`, la configuration du projet, les tests runtime, les tests HTTP contre la pile, Lighthouse, axe, ZAP, Trivy, SMTP réel et la restauration des sauvegardes restent à exécuter sur le VPS ou une recette dédiée.

La préparation OVH est techniquement définie, mais le déploiement ne doit pas être déclaré terminé avant la recette finale et la preuve que `africaingenierie.com` n’a pas été modifié.

## Références du projet

- Cahier des charges : `Cahier_des_charges Africa_Ingenierie.docx`
- Guide OVH initial : `docs/deploiement-ovh-test.md`
- Configuration OVH : `.env.ovh.test.example`
- Compose production : `docker-compose.prod.yml`
- Nginx production : `infra/nginx/oracle-site.conf.template`
- Matrice de traçabilité : `docs/matrice-tracabilite.md`
- Plan de recette sécurité : `docs/plan-recette-securite.md`
- Installation Docker Ubuntu : https://docs.docker.com/engine/install/ubuntu/
- Documentation OVH VPS et DNS : https://help.ovhcloud.com/
- Premiers pas avec un VPS OVHcloud : https://docs.ovhcloud.com/en/guides/bare-metal-cloud/virtual-private-servers/starting-with-a-vps
- Récupération d’un accès Linux perdu avec le mode Rescue : https://docs.ovhcloud.com/en/guides/bare-metal-cloud/dedicated-servers/replacing-user-password
