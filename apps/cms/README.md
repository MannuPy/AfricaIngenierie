# @africa-ingenierie/cms  -  Payload CMS

Dashboard, API REST/GraphQL et modèle de données de la plateforme.
Servi sur l'hôte d'administration (`http://admin.localhost:8080` en local).

## Modèle de données

**17 collections**

| Collection | Rôle | Workflow |
|---|---|---|
| `users` | Comptes du dashboard, rôles, verrouillage |  -  |
| `media-assets` | Médiathèque, alt obligatoire, MinIO |  -  |
| `pages` | Hero et SEO des pages de liste (D-05) | oui |
| `expertises` | Six domaines d'expertise | oui |
| `projects` | Projets, avec avancement métier distinct | oui |
| `realisations` | Études de cas, avant/après, indicateurs | oui |
| `formations` | Catalogue de formations | oui |
| `formation-sessions` | Occurrences planifiées | oui |
| `events` | Événements descriptifs, **aucun champ commercial** | oui |
| `products` | Produits et équipements | oui |
| `team-members` | Équipe dirigeante | oui |
| `partners` | Partenaires | oui |
| `testimonials` | Témoignages, consentement obligatoire | oui |
| `legal-documents` | Mentions légales, confidentialité | oui |
| `contact-messages` | Demandes reçues, conservation limitée |  -  |
| `redirects` | Redirections 301 |  -  |
| `audit-logs` | Journal en ajout seul |  -  |

**5 globals** : `site-settings`, `navigation`, `homepage`, `ceo-message`, `about-page`.

### Bilinguisme

Localisation **native Payload** (décision D-01) : `fr` par défaut, `en` en
second, repli activé pour ne jamais rendre une page vide. La publication reste
conditionnée à la complétude réelle des deux langues  -  le repli masque un
oubli, il ne le corrige pas.

`docs/mpd-postgresql.sql` demeure une **référence de conception**. Le schéma
réel est produit par les migrations versionnées de `src/migrations/`.

### État éditorial

Le champ s'appelle **`editorialStatus`**, pas `status`.

Le versionnage de Payload ajoute un champ interne `_status`, et les deux
produisaient le **même** type énuméré PostgreSQL (`enum_<table>_status`) : les
valeurs `review` et `archived` disparaissaient silencieusement de la base. Le
défaut a été trouvé par les tests d'intégration ; il était invisible en revue
de code.

Valeurs : `draft` → `review` → `published` → `archived`.

## Sécurité

| Exigence | Mise en œuvre |
|---|---|
| Contrôle d'accès serveur | `src/access/`  -  évalué sur REST, GraphQL et API locale |
| Rôles | Administrateur, Publicateur, Éditeur (`src/access/roles.ts`) |
| Transitions d'état | `enforceStatusTransition`, hook `beforeValidate` |
| Verrouillage progressif | 5 tentatives, blocage 15 min (`Users.auth`) |
| Rate limiting connexion | Nginx, `infra/nginx/conf.d/20-admin.conf` |
| Cookies de session | `secure` en production, `SameSite=Lax`, expiration 2 h |
| Mot de passe initial | `mustChangePassword`  -  bloque toute écriture côté serveur |
| Compte suspendu | `isActive: false` retire tous les droits immédiatement |
| Historique | `audit-logs`, en ajout seul, résistant même à `overrideAccess` |
| Prévisualisation | Versions natives + URL de preview par collection |
| Confirmation d'archivage | Motif obligatoire, conservé au journal |

### Pourquoi la règle d'état n'est pas un contrôle d'accès de champ

Un champ refusé par `access` est **silencieusement retiré** des données avant
l'exécution des hooks : l'enregistrement réussirait, la valeur interdite serait
ignorée, et l'utilisateur croirait avoir publié. Le comportement a été vérifié
expérimentalement. La règle vit donc dans un hook `beforeValidate`, qui refuse
explicitement  -  et un test de non-régression le prouve.

## Commandes

```bash
# Migrations
pnpm --filter @africa-ingenierie/cms migrate
pnpm --filter @africa-ingenierie/cms migrate:create <nom>
pnpm --filter @africa-ingenierie/cms migrate:status

# Types et carte d'import
pnpm --filter @africa-ingenierie/cms generate:types
pnpm --filter @africa-ingenierie/cms generate:importmap

# Comptes de développement local (six comptes .test)
pnpm --filter @africa-ingenierie/cms bootstrap:users

# Tests (PostgreSQL requis)
pnpm --filter @africa-ingenierie/cms test
```

### Bootstrap des comptes locaux

Le script refuse de s'exécuter si `NODE_ENV=production`, si
`BOOTSTRAP_USERS_ENABLED` n'est pas à `true`, si `BOOTSTRAP_USERS_ENV` n'est pas
`local`, ou si `DATABASE_URL` ne pointe pas vers une base locale. Trois tests
automatisés vérifient ces refus.

Les mots de passe générés ne sont **ni affichés, ni committés** : ils sont
écrits dans `.bootstrap-users.local.json` (permissions `600`, ignoré par Git),
à supprimer une fois les six comptes initialisés. Chaque compte démarre avec
`mustChangePassword`.

## Tests

```bash
docker compose --env-file .env.local up -d postgres
pnpm --filter @africa-ingenierie/cms test
```

Les tests s'exécutent contre **une vraie base PostgreSQL et la vraie
configuration Payload**, via l'API locale avec `overrideAccess: false`  -
c'est-à-dire le chemin exact d'une requête REST ou GraphQL.

| Fichier | Portée |
|---|---|
| `tests/rbac.test.ts` | Droits des trois rôles, comptes suspendus ou non initialisés, visiteur anonyme |
| `tests/workflow.test.ts` | Complétude bilingue, archivage motivé, CTA, slugs, redirections, audit, versions |
| `tests/schema.test.ts` | Invariants de modèle, dont l'absence de champ commercial sur les événements |
| `tests/bootstrap.test.ts` | Refus du bootstrap hors environnement local |
