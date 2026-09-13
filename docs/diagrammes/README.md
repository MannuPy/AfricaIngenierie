# Diagrammes UML 2.5 de la plateforme Africa Ingénierie

Deux diagrammes, conformes à la spécification **OMG UML 2.5.1 (formal/17-12-05)**.
Chacun est fourni en **SVG** (source vectorielle, éditable et redimensionnable sans
perte) et en **PNG** haute résolution, au format paysage.

| Fichier | Type UML | Section de la norme | Dimensions PNG |
|---|---|---|---|
| `architecture-deploiement.svg` / `.png` | Diagramme de déploiement | §19 | 5360 × 3000 |
| `architecture-base-de-donnees.svg` / `.png` | Diagramme de classes | §11 | 6600 × 3270 |

## 1. Architecture de déploiement

Cadre de diagramme `dep`. Il montre :

- les **noeuds** (`«device»`, `«executionEnvironment»`) : poste client, hôte Docker,
  et un environnement d'exécution par conteneur (`:nginx`, `:web`, `:cms`,
  `:postgres`, `:minio`, `:mailpit`) ;
- les **composants** (`«component»`) déployés dans chaque noeud, avec leur rôle réel
  (hôtes virtuels Nginx et zones de limitation de débit, `proxy.ts`, App Router,
  `lib/cms.ts`, gestionnaires de routes, contrôle d'accès RBAC, hooks métier,
  adaptateurs PostgreSQL et S3) ;
- les **artefacts** (`«artifact»`) : fichiers de configuration, migrations, jeu de
  démonstration, paquets du monorepo, volumes persistants ;
- les **interfaces fournies et requises** en notation boule et douille
  (`IContenuREST`, `ISQL`, `IStockageS3`) ;
- les **chemins de communication** avec leur protocole (`«HTTP»`, `«SMTP»`) et les
  **dépendances** `«deploy»`.

Point d'architecture rendu explicite par le diagramme : le site public ne se
connecte jamais à PostgreSQL. Toute lecture traverse l'API du CMS
(`CMS_INTERNAL_URL`), donc son contrôle d'accès.

## 2. Architecture de la base de données

Cadre de diagramme `class`. Il montre :

- la classe abstraite **`ContenuÉditorial`** qui factorise l'identifiant, le slug,
  l'état éditorial, l'horodatage, les auteurs, le bloc SEO et le statut de
  versionnement, avec ses **contraintes** de publication ;
- les **11 sous-classes** reliées par un arbre de généralisation partagé, chacune
  avec ses seuls attributs propres, typés, avec visibilité, multiplicité et chaîne
  de propriétés (`{localized}`, `{unique}`, `{readOnly}`, `{composite}`) ;
- **`FormationSession`**, volontairement hors de la hiérarchie et rattachée à
  `Formation` par une **composition** ;
- les classes hors circuit éditorial : `User`, `AuditLog`, `ContactMessage`,
  `Redirect`, `MediaAsset` ;
- les **5 réglages globaux**, les **11 types composés** (`«dataType»`) et les
  **16 types énumérés** métier ;
- des notes expliquant le **mappage physique** (pourquoi 22 entités logiques
  donnent 102 tables PostgreSQL) et le **bilinguisme** (tables `_locales`).

## 3. Régénérer les diagrammes

Les diagrammes sont produits par programme, à partir du schéma réel du dépôt.
Ils doivent être régénérés après toute migration qui modifie le modèle.

```bash
cd docs/diagrammes/generateurs
npm install playwright            # une seule fois
python3 gen_arch.py               # produit architecture-deploiement.svg
python3 gen_db.py                 # produit architecture-base-de-donnees.svg
node render.js architecture-deploiement.svg architecture-deploiement.png 2
node render.js architecture-base-de-donnees.svg architecture-base-de-donnees.png 1.5
```

`render.js` écrit aussi un fichier `.json` listant la boîte englobante de chaque
texte : il sert au contrôle automatique de débordement effectué avant livraison.

## 4. Sources des données

Tout le contenu des diagrammes provient du dépôt, à la date du 28 août 2026 :

- `apps/cms/src/payload-types.ts` — entités, attributs, types et relations ;
- `apps/cms/src/collections/*.ts` et `apps/cms/src/globals/*.ts` — champs traduits ;
- `apps/cms/src/migrations/*.ts` — tables physiques et types énumérés ;
- `docker-compose.yml` et `infra/nginx/` — noeuds, ports et limitation de débit ;
- `apps/web/src/` — routes, composants et client CMS.
