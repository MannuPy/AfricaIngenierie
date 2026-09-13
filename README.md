# Africa Ingénierie - plateforme web

Monorepo local de la plateforme : site public **Next.js**, dashboard et API
**Payload CMS**, données **PostgreSQL**, médias **SeaweedFS (API S3)**, reverse proxy **Nginx**,
orchestration **Docker Compose**.

> **État au 12/09/2026 : socle local audité et préparation OVH en cours de finalisation.**
> Les applications publiques et CMS, les collections métier, le bilinguisme,
> la publication Produit, la revalidation, le contact renforcé et l'API
> événements sont présents. La procédure de déploiement OVH, les images de
> production, les sauvegardes chiffrées et la rotation sont
> fournis. La recette Lighthouse/axe-core, les scans CVE/ZAP, les tests
> clavier/focus/contraste et la validation des secrets de production restent à
> exécuter avant la production.

---

## 1. Démarrage rapide

Déploiement hébergé recommandé : [procédure OVH finale](docs/deploiement-ovh-ingenierieafrica-final.md).
La migration et les variables SeaweedFS sont détaillées dans
[`docs/seaweedfs-migration-ovh.md`](docs/seaweedfs-migration-ovh.md).
La cible publique est exclusivement `https://ingenierieafrica.com/`. Le CMS
utilise uniquement `https://admin.ingenierieafrica.com/admin` pour
l’administration technique. Le domaine `africaingenierie.com` et les services
de messagerie existants restent hors périmètre.

Pré-requis : **Docker Desktop** (Compose v2.24 ou supérieur) et environ 6 Go de RAM libres.
Node.js n'est pas nécessaire sur le poste : tout s'exécute dans les conteneurs.

```bash
# 1. Configuration locale
cp .env.example .env.local

# 2. Générer un vrai secret Payload et remplacer les valeurs « change-me »
#    dans .env.local (voir §2)

# 3. Démarrer
docker compose --env-file .env.local up -d

# 4. Suivre la première installation/compilation (quelques minutes)
docker compose --env-file .env.local logs -f web cms
```

La première installation pnpm peut prendre plusieurs minutes sur Docker Desktop
Windows : elle se termine lorsque le service `deps` affiche
`[deps] dépendances installées`. Le cache pnpm est placé dans le volume Docker
`pnpm_store`, et non dans le dossier Windows du projet, afin d’éviter les
ralentissements et les liens `node_modules` incomplets.

| Adresse | Contenu |
|---|---|
| <http://127.0.0.1:8080> | Site public |
| <http://admin.localhost:8080/admin> | Dashboard Payload |
| <http://127.0.0.1:8025> | Mailpit - boîte de réception de test |
| <http://127.0.0.1:8333> | API S3 SeaweedFS locale |

Si `http://localhost:8080` affiche `ERR_CONNECTION_RESET` sur Windows,
utiliser `http://127.0.0.1:8080` : Docker Desktop réinitialise ici la première
résolution IPv6 de `localhost` (`::1`), tandis que la liaison IPv4 est saine.

Arrêt :

```bash
docker compose --env-file .env.local down       # conserve les données
docker compose --env-file .env.local down -v    # supprime aussi les volumes
```

---

## 2. Secrets et configuration

`.env.local` est **ignoré par Git** et ne doit jamais être committé. `.env.example`
ne contient que des valeurs de développement inutilisables ailleurs. Après la
migration SeaweedFS, un ancien `.env.local` doit être mis à jour manuellement :
les variables `MINIO_*` ne sont plus utilisées.

Générer le secret Payload :

```bash
docker run --rm node:22-bookworm-slim node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Remplacer ensuite dans `.env.local` :

| Variable | Remarque |
|---|---|
| `PAYLOAD_SECRET` | valeur aléatoire de 48 octets minimum |
| `POSTGRES_PASSWORD` | doit correspondre au mot de passe présent dans `DATABASE_URL` |
| `S3_SECRET_KEY` | clé privée S3 de l'application ; ne jamais la publier |
| `S3_BACKUP_SECRET_KEY` | clé distincte en lecture seule pour les sauvegardes |

En production, aucun de ces secrets ne provient d'un fichier du dépôt : ils sont
injectés par l'environnement du serveur ou un gestionnaire de secrets.

---

## 3. Recette du socle

Le rapport détaillé de l’audit local du 01/09/2026, avec preuve, sévérité,
correction et statut pour chaque domaine, est disponible dans
[`docs/rapport-audit-local-2026-09-01.md`](docs/rapport-audit-local-2026-09-01.md).
Le rapport historique du 28/08/2026 reste disponible pour comparaison.

```bash
# Windows (recommandé)
powershell -ExecutionPolicy Bypass -File scripts\verify-stack.ps1

# Git Bash, WSL, macOS, Linux
bash scripts/verify-stack.sh
```

Le script exécute et journalise les six vérifications exigées au prompt 01 :
validation `docker compose config`, démarrage, healthchecks, connexion
PostgreSQL, accès SeaweedFS S3, envoi et réception d'un e-mail dans Mailpit  -  puis
sonde les points d'entrée HTTP et arrête la pile. Ajouter `--keep` / `-Keep`
pour laisser les services démarrés.

---

## 4. Architecture locale

```
                    ┌─────────────────────────────┐
   navigateur ────► │  nginx  :8080 / :8443       │   seul service publié
                    └──────┬───────────────┬──────┘
                 localhost │               │ admin.localhost
                    ┌──────▼──────┐  ┌─────▼───────┐
                    │ web  :3000  │─►│ cms  :3001  │
                    │  Next.js    │  │  Payload    │
                    └─────────────┘  └──┬───┬───┬──┘
                                        │   │   │
                     ┌──────────────────┘   │   └──────────────┐
                ┌────▼─────┐          ┌─────▼────┐        ┌────▼─────┐
                    │ postgres │          │ seaweedfs│        │ mailpit  │
                └──────────┘          └──────────┘        └──────────┘
                     └──── backend_net ────┘               mail_net
```

**Cloisonnement réseau**

| Réseau | Services | Rôle |
|---|---|---|
| `frontend_net` | nginx, web, cms | Trafic HTTP entrant |
| `backend_net` | cms, postgres, seaweedfs | Données et médias  -  jamais exposés |
| `mail_net` | cms, mailpit | Notifications SMTP |

`web` n'est raccordé qu'à `frontend_net` : le site public ne peut pas atteindre
PostgreSQL, conformément à `docs/architecture-et-uml.md` §1.

**Exposition des ports**

| Fichier | Effet |
|---|---|
| `docker-compose.yml` | Base. Seul Nginx publie des ports. |
| `docker-compose.override.yml` | Développement, chargé automatiquement. Publie PostgreSQL, l'API S3 SeaweedFS et Mailpit **sur 127.0.0.1 uniquement**. |
| `docker-compose.prod.yml` | Production OVH autonome, sans override de développement ; ne publie que Nginx sur 80/443. |

Production OVH (sur le VPS, après création de `.env.ovh.test`) :
`docker compose --env-file .env.ovh.test -f docker-compose.prod.yml up -d`
(ce fichier autonome ne charge pas l'override de développement).

**Deux hôtes plutôt qu'un**

L'API REST de Payload occupe `/api/*`, tout comme l'API publique des événements.
Servir les deux applications sur le même hôte créerait une
collision. Le site public vit donc sur `localhost` et l'administration sur
`admin.localhost`, ce qui reproduit dès le développement le sous-domaine
d'administration recommandé en production.

Si votre outillage ne résout pas `*.localhost`, ajoutez au fichier hosts
(`C:\Windows\System32\drivers\etc\hosts`) :

```
127.0.0.1  admin.localhost
```

---

## 5. Structure du dépôt

```
apps/
  web/          Site public Next.js (port 3000)
  cms/          Payload CMS hébergé par Next.js (port 3001)
packages/
  ui/           Design system  -  rempli au prompt 02
  validation/   Schémas Zod partagés (environnement, puis métier)
infra/
  docker/       Image de développement partagée (pnpm installé à la construction)
  nginx/        Reverse proxy, en-têtes de sécurité, TLS local
scripts/        Recette du socle, certificats locaux, test SMTP
docs/           Dossier technique  -  source d'autorité
standalone.html            Prototype validé  -  référence visuelle, ne pas supprimer
standalone.reference.html  Copie de sauvegarde figée avant migration
```

---

## 6. Commandes utiles

```bash
docker compose --env-file .env.local ps
docker compose --env-file .env.local logs -f --tail=100 cms
docker compose --env-file .env.local exec cms sh
docker compose --env-file .env.local exec postgres psql -U cms_user -d africa_ingenierie

# IDE de base de données local

Pour consulter PostgreSQL et exécuter des requêtes SQL dans une interface
graphique, lancer pgAdmin uniquement en local :

```bash
pnpm db:ide
```

Puis ouvrir `http://localhost:5050`. Les identifiants de l'interface sont ceux
de `PGADMIN_DEFAULT_EMAIL` et `PGADMIN_DEFAULT_PASSWORD` dans `.env.local`.
Dans pgAdmin, le serveur PostgreSQL utilise `postgres:5432` comme hôte depuis
le conteneur, ou `localhost:5432` depuis DBeaver/Beekeeper sur le poste.

# Réinstaller les dépendances après modification d'un package.json
docker compose --env-file .env.local run --rm deps

# Régénérer le lockfile (hors conteneur, Node 20.9+ requis)
corepack pnpm install --lockfile-only
```

HTTPS local (facultatif) :

```bash
bash scripts/generate-local-certs.sh
mv infra/nginx/conf.d/90-tls.conf.disabled infra/nginx/conf.d/90-tls.conf
docker compose --env-file .env.local restart nginx
```

---

## 7. Dépannage

> **`next: not found` dans `web` ou `cms` n'est jamais le vrai problème.**
> Ces services démarrent après le service `deps`, qui installe les
> dépendances du workspace dans des volumes partagés. Si `deps` échoue,
> `node_modules` reste vide et `next` est introuvable. La cause est toujours
> dans le log de `deps` :
>
> ```bash
> docker compose --env-file .env.local logs deps
> ```

| Symptôme | Cause probable | Correction |
|---|---|---|
| `next: not found` | Le service `deps` a échoué | Lire `pnpm logs:deps`, corriger, puis `docker compose ... up -d` |
| `deps` échoue sur `--frozen-lockfile` | `package.json` modifié sans régénérer le lockfile | `corepack pnpm install --lockfile-only`, puis relancer. En dépannage seulement : `DEPS_INSTALL_ARGS=--no-frozen-lockfile` dans `.env.local` |
| `node_modules` corrompu après un arrêt brutal | Volumes de dépendances incohérents | `pnpm reset:deps` puis `docker compose --env-file .env.local up -d` |
| `missing secret key` sur `pnpm migrate` | Commande lancée sur l'hôte au lieu du conteneur | Utiliser les scripts `pnpm` (§8) : ils passent par `docker compose run --rm cms`. Ne pas créer de `.env` dans `apps/cms` |
| « Un contenu ne peut pas être publié dès sa création » | La seconde langue n'existe pas encore | Enregistrer en brouillon → basculer la langue (« Paramètres régionaux ») → compléter → publier (D-28) |
| Bouton « Créer » absent dans le tableau de bord | Mot de passe initial non changé, ou compte suspendu | Le bandeau en tête de liste nomme la cause et donne le lien pour débloquer (D-23) |
| Produits `REF-…` ou « … depuis le dashboard … » dans les contenus | Traces d'anciennes exécutions de tests | `pnpm db:clean-tests -- --apply` (D-22) |
| Pages lentes au premier appel | `next dev` compile chaque route à la demande | Normal ; **relancez `pnpm routes:check` une seconde fois**  -  le premier passage mesure la compilation, pas le site |
| Pages lentes même au second passage | Bind mount Windows → conteneur : I/O 10 à 50× plus lent qu'en natif | Inhérent au mode développement sous Windows. Pour une démonstration fluide, construire le site en production plutôt que d'utiliser `next dev` |
| `column ... does not exist` pendant `pnpm test` | Tests lancés avant `pnpm migrate` | Migrer d'abord, puis relancer les tests (§8) |
| `execvpe(/bin/bash) failed` sur un script `pnpm` | Script shell sous Windows | Les scripts destinés aux deux systèmes sont en Node (`.mjs`) ; signaler celui qui ne l'est pas |
| `type "_locales" already exists` au `migrate` | Base portant un schéma poussé en mode dev (avant D-15) | `pnpm db:reset` puis `pnpm migrate` (§8) |
| `cms` reste `starting` | Première compilation Next.js | Normal jusqu'à 2-4 min ; suivre `logs -f cms` |
| `cms` `unhealthy` | `PAYLOAD_SECRET` ou `DATABASE_URL` absent | Vérifier `.env.local` |
| `admin.localhost` ne répond pas | Résolution DNS locale | Ajouter l'entrée hosts (§4) |
| Port 8080 occupé | Autre service local | Changer `NGINX_HTTP_PORT` dans `.env.local` |
| Modification de code non prise en compte | Bind mount Windows | Redémarrer le service concerné |

---

## 8. Après le premier démarrage

Le schéma provient **uniquement** des migrations versionnées
(`push: false` dans `apps/cms/src/payload.config.ts`  -  voir D-15). Le service
`cms` joue `payload migrate` avant `next dev` : un `pnpm up` suffit donc à
mettre la base à niveau, et un échec de migration arrête le conteneur au lieu
de le laisser démarrer sur un schéma faux.

> **Ces commandes s'exécutent DANS le conteneur `cms`, pas sur l'hôte.**
> `.env.local` est chargé par Docker Compose (`env_file`), et les noms d'hôtes
> `postgres`, `seaweedfs` et `mailpit` n'existent que sur le réseau Docker. Lancées
> depuis Windows, les mêmes commandes échouent sur `missing secret key` puis
> sur une base injoignable. Les scripts `pnpm` ci-dessous encapsulent déjà
> `docker compose run --rm cms` : il n'y a **jamais** de fichier `.env` à créer
> dans `apps/cms`.

```bash
# Créer les six comptes de développement (.test)
pnpm bootstrap:users
```

Pour jouer les migrations à la main (hors démarrage du serveur) :

```bash
pnpm migrate          # applique les migrations en attente
pnpm migrate:status   # liste les migrations appliquées
pnpm migrate:create   # génère une migration après un changement de modèle
pnpm generate:types   # régénère apps/cms/src/payload-types.ts
pnpm test             # suite d'intégration Payload (base réelle)
```

> **Deux suites de tests** (D-25) :
>
> ```bash
> pnpm test        # 69 tests - base isolée, pile non requise
> pnpm up
> pnpm test:e2e    # flux de publication réel  -  EXIGE la pile démarrée
> ```
>
> `pnpm test:e2e` traverse `cms`, `web` et Nginx : il écrit donc dans la base
> de travail, c'est la contrepartie inévitable d'un test de bout en bout.

> **Les tests ont leur propre base** (D-22). `pnpm test` crée et migre
> `<votre_base>_test`, et refuse de démarrer si elle coïncide avec la base de
> travail. Vos contenus ne sont jamais touchés par une exécution de tests.
>
> Si votre base porte encore des traces d'anciennes exécutions  -  produits
> `REF-…`, contenus « … depuis le dashboard … »  -  retirez-les :
>
> ```bash
> pnpm db:clean-tests            # liste ce qui serait retiré
> pnpm db:clean-tests -- --apply # les retire
> ```

> **Ordre des commandes.** `pnpm migrate` AVANT `pnpm test` et
> `pnpm seed:demo`. Les tests s'exécutent contre la vraie base : lancés avant
> la migration, ils échouent sur une colonne absente  -  un faux négatif qui
> fait douter du code alors que seul l'ordre était en cause.

> **Base déjà polluée par un `push` de développement.**
> Si `pnpm migrate` échoue sur `type "_locales" already exists`, la base porte
> un schéma poussé automatiquement par un ancien démarrage. Tant qu'aucune
> donnée réelle n'existe, la remise à zéro est sans perte :
>
> ```bash
> pnpm db:reset       # DESTRUCTIF : supprime le volume postgres_data
> pnpm migrate
> pnpm bootstrap:users
> pnpm up
> ```
>
> `pnpm db:reset` efface toute la base de développement. Ne jamais l'exécuter
> sur un environnement portant des données réelles.

Les identifiants générés sont écrits dans
`apps/cms/.bootstrap-users.local.json`  -  ignoré par Git, à supprimer une fois
les six comptes initialisés. Chaque compte doit changer son mot de passe à la
première connexion : tant qu'il ne l'a pas fait, le serveur refuse toute
écriture.

| Adresse | Contenu |
|---|---|
| <http://localhost:8080/design-system> | Galerie du design system (prompt 02) |
| <http://admin.localhost:8080/admin> | Dashboard Payload |

---

## 9. Jeu de démonstration

```bash
pnpm seed:demo
```

Écrit dans le CMS les contenus du prototype validé
(`standalone.reference.html`) : 6 expertises, 4 réalisations, 2 projets,
3 formations et leurs 4 sessions, 3 événements, 4 produits, 1 témoignage,
4 partenaires, 2 documents légaux, les 5 réglages globaux, et un pack de
26 visuels générés.

**Ce que le script garantit.**

- **Idempotence.** Rejouable autant de fois que voulu : chaque document est
  retrouvé par sa clé stable puis mis à jour. Aucun doublon, aucune erreur.
- **Aucun écrasement de contenu réel.** Tout ce qu'il écrit porte le marqueur
  *Contenu de démonstration* (`isDemo`, conservé pour les scripts et masqué du
  formulaire éditorial afin de ne pas exposer une métadonnée technique).
  Un document dont ce marqueur a été retiré  -  donc repris par le Client  -  est
  laissé intact et signalé en fin d'exécution. Les réglages globaux, qui n'ont
  pas de marqueur, ne sont écrits que s'ils sont vides.
- **Publication seulement si les deux langues sont complètes.** Le script écrit
  le français, puis l'anglais, puis demande la publication : c'est le CMS
  lui-même qui refuserait un contenu incomplet (RG-011). Aucune règle métier
  n'est contournée.
- **Refus hors environnement local.** `NODE_ENV=production` ou une base non
  locale arrêtent le script avant toute écriture.

Pour réécrire aussi des contenus repris par le Client  -  **destructif** :

```bash
SEED_FORCE_CONFIRMED=yes pnpm seed:demo -- --force
```

**À remplacer avant la mise en production**

| Élément | Pourquoi il n'est pas fourni |
|---|---|
| Les 26 visuels | Motifs abstraits générés : aucun droit de tiers engagé (D-17) |
| Portrait du Directeur Général | Un visuel abstrait présenté comme le portrait d'une personne nommée serait un faux |
| Logos des partenaires | Idem : un logo inventé pour une entreprise réelle serait un faux |
| Logo et favicon du site | À fournir par le Client |
| URL des réseaux sociaux | Les trois entrées existent sans URL : l'icône reste masquée, jamais de lien mort |
| Textes légaux | Repris du prototype, à valider juridiquement |

Le dashboard liste ce qui reste à remplacer : filtrez sur *Contenu de
démonstration*.

---

## 10. Site public

| Adresse française | Adresse anglaise |
|---|---|
| `/fr/` | `/en/` |
| `/fr/expertises` · `/fr/expertises/{slug}` | `/en/expertises` · `/en/expertises/{slug}` |
| `/fr/realisations` · `/fr/realisations/{slug}` | `/en/case-studies` · `/en/case-studies/{slug}` |
| `/fr/projets` · `/fr/projets/{slug}` | `/en/projects` · `/en/projects/{slug}` |
| `/fr/formations-evenements` | `/en/training-events` |
| `/fr/formations/{slug}` | `/en/training/{slug}` |
| `/fr/evenements` · `/fr/evenements/{slug}` | `/en/events` · `/en/events/{slug}` |
| `/fr/produits` · `/fr/produits/{slug}` | `/en/products` · `/en/products/{slug}` |
| `/fr/a-propos` | `/en/about` |
| `/fr/contact` | `/en/contact` |
| `/fr/mentions-legales` | `/en/legal-notice` |
| `/fr/confidentialite` | `/en/privacy-policy` |

`/` renvoie vers `/fr`. Une adresse sans langue est préfixée par `/fr`.

**Ordre de la page de garde**  -  hero, confiance, qui sommes-nous, expertises,
produits, chiffres, réalisations, formations & événements, direction,
témoignages, appel à l'action. Cet ordre et la visibilité de chaque bloc
viennent du réglage **Page de garde** : masquer une section l'enlève du site,
la réordonner change la page. Rien n'est figé dans le code.

**Tout le contenu vient du CMS**  -  textes, cartes, médias, liens, boutons,
chiffres, en-têtes de rubrique, états vides et textes légaux. La seule
exception, circonscrite et documentée, est la table des libellés de structure
(`apps/web/src/lib/ui-strings.ts`)  -  voir D-18.

**Contenus non publiés.** Chaque lecture filtre sur `editorialStatus =
published`, et le contrôle d'accès de Payload l'impose déjà pour un visiteur
anonyme. Une fiche non publiée appelée par son adresse renvoie 404.

**Vérification des adresses.**

```bash
pnpm routes:check          # les 30 adresses publiques, codes attendus
BASE_URL=https://… pnpm routes:check
```

Ce contrôle existe parce qu'une boucle de redirection sur toutes les URL
anglaises a traversé le typage, la compilation ET la suite de tests sans être
vue : seul un appel HTTP réel l'a révélée. Un site dont on n'a pas appelé les
adresses n'est pas un site vérifié.

**Formulaire de contact.** Il poste sur `/api/contact`, route du site, jamais
directement sur le CMS. La validation, le consentement, le honeypot, la taille
maximale, la limitation de débit, le hachage IP/agent et l'audit sont en place.
Le CMS refuse aussi les créations directes anonymes grâce au secret interne.
La notification SMTP réelle doit encore être vérifiée avec les identifiants de
production.

**Témoignages clients.** Le bouton `Laisser un témoignage` ouvre le même
parcours de page avec `?sujet=temoignage`, mais affiche un formulaire dédié qui
ne demande ni besoin commercial ni message de contact. L'envoi est validé par
`/api/contact` avec `kind=testimonial`, puis crée un témoignage en brouillon
dans Payload via le secret interne dédié. L'administrateur peut le laisser en
brouillon, le soumettre à validation, le publier ou l'archiver avec un motif.
La publication exige le consentement daté et la complétude FR/EN. La page
d'accueil ne lit que les cinq témoignages publiés les plus récents au maximum et
les fait défiler un par un toutes les 25 secondes, avec boutons précédent, suivant et indicateurs
accessibles. Les contenus de démonstration du seed doivent être remplacés par
des avis réels validés avant la production.

La section `Chiffres clés` est administrée dans le global `Page de garde` :
chaque ligne possède une valeur, un suffixe et un intitulé FR/EN, ainsi qu'un
contrôle `Visible sur le site`. La publication ou le retrait d'une statistique
ne demande donc aucune modification du code.

Les logos de la section `Ils nous font confiance` gardent leur original dans la
médiathèque ; l'affichage passe par le proxy CMS `/api/logo`, qui rend
transparents les fonds presque blancs et conserve le résultat en cache public.

---

## 11. Synchronisation CMS → site public

La publication Payload déclenche maintenant un webhook HMAC signé vers
`/api/revalidate`. Le hook envoie les chemins de liste, de détail et les
étiquettes de cache concernés (`cms:{collection}`, `cms:global:{slug}`), dans
les deux langues. Next.js les revalide à la demande ; le comportement
stale-while-revalidate peut servir l'ancienne réponse pendant le rafraîchissement
avant de servir la nouvelle version.

Une panne du webhook est journalisée et ajoutée au journal d'audit sans annuler
la publication ni supprimer la dernière version publique valide. Les brouillons
ne déclenchent pas de revalidation publique.

La prévisualisation est réservée aux utilisateurs Payload actifs autorisés,
avec un jeton HMAC court et un cookie HttpOnly côté site public.

L'état des décisions d'architecture est tenu à jour dans
[`docs/decisions.md`](docs/decisions.md).

La comparaison avec le site déjà en ligne et les recommandations de lancement
sont dans [`docs/etude-comparative-plateformes.md`](docs/etude-comparative-plateformes.md).
