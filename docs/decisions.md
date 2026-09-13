# Registre des décisions d'architecture (ADR)

Version 1.1 · état vérifié le 28/08/2026 · à tenir à jour à chaque arbitrage.

Chaque décision issue de l'audit initial est consignée ici avec son statut.
Une décision `PROPOSÉE` engage le Prestataire mais reste réversible ; une
décision `ACTÉE` ne se change plus sans nouvelle entrée dans ce registre.

| Réf. | Sujet | Statut | Bloque |
|---|---|---|---|
| D-01 | Stratégie de localisation Payload | **ACTÉE** | prompt 03 ✔ |
| D-02 | Segments d'URL traduits FR/EN | **ACTÉE** | prompt 06 ✔ |
| D-03 | Route publique `/projets` | **ACTÉE** | prompt 06 ✔ |
| D-04 | Mode sombre | **ACTÉE : supprimé** | prompt 02 ✔ |
| D-05 | Collection `pages` pour les pages de liste | **ACTÉE** | prompt 03 ✔ |
| D-06 | Entités manquantes au MPD | **ACTÉE** | prompt 03 ✔ |
| D-07 | Versionnage natif Payload + audit séparé | **ACTÉE** | prompt 03 ✔ |
| D-08 | Hôte de l'API événements | **ACTÉE** | prompt 01 ✔ |
| D-09 | Polices auto-hébergées | **ACTÉE** | prompt 02 ✔ |
| D-10 | Séparation site public / administration par hôte | **ACTÉE** | prompt 01 ✔ |
| D-11 | Correctif de débordement horizontal à 320 px | **ACTÉE** | prompt 02 ✔ |
| D-12 | Design system distribué en source TypeScript | **ACTÉE** | prompt 02 ✔ |
| D-13 | Champ d'état nommé `editorialStatus` | **ACTÉE** | prompt 03 ✔ |
| D-14 | Règles d'état en hook, pas en accès de champ | **ACTÉE** | prompt 04 ✔ |

---

## D-01  -  Stratégie de localisation Payload  -  **ACTÉE le 26/08/2026**

**Décision du Client : localisation native Payload**, `docs/mpd-postgresql.sql`
conservé comme référence de conception. Mise en œuvre au prompt 03 : `fr` par
défaut, `en` en second, repli activé, et publication conditionnée à la
complétude réelle des deux langues (le repli masque un oubli, il ne le corrige
pas). Le détail du raisonnement est conservé ci-dessous.

### Contexte et options examinées

**Contexte.** `docs/mcd-mld.md` §4 impose des colonnes suffixées `_fr` / `_en`.
Payload gère nativement la localisation par tables `_locales` et colonne `_locale`,
avec sélecteur de locale dans le dashboard et paramètre `?locale=` dans l'API.
Les deux approches sont incompatibles.

**Options.**

| | Localisation native Payload | Colonnes `_fr` / `_en` |
|---|---|---|
| Dashboard | Sélecteur de langue natif, un champ par langue | Deux champs côte à côte dans chaque formulaire |
| API | `?locale=fr` et repli automatique | Sélection applicative des colonnes |
| Contrôle de complétude | Hook sur la locale courante | Contrôle direct des colonnes |
| Conformité au MPD | Le schéma diffère du `.sql` de conception | Conforme au `.sql` |
| Maintenance | Standard du framework, mises à jour suivies | Code maison à maintenir |

**Choix retenu.** Localisation **native Payload**, avec `localized: true` sur
les champs éditoriaux. `docs/mpd-postgresql.sql` reste ce qu'il est déjà déclaré
être  -  une **référence de conception**, jamais exécutée telle quelle  -  et le
schéma réel est produit par les migrations Payload versionnées. La règle RG-011
(titre, résumé et SEO complets dans les deux langues avant publication) est
implémentée par un hook `beforeChange`, ce qui est plus fiable qu'une contrainte
`NOT NULL` par colonne.

**Conséquence si l'option inverse est retenue.** Perte du sélecteur de locale
natif et de l'API localisée ; le prompt 03 double alors le nombre de champs de
chaque collection.

---

## D-02  -  Segments d'URL traduits FR/EN  -  **ACTÉE le 27/08/2026**

**Contexte.** `docs/urls-et-redirections.md` §2 définit des segments traduits
(`/en/products`, `/en/training-events`, `/en/training/{slug}`). Le prompt 06 ne
liste qu'un jeu de segments français sous `/[locale]/`.

**Décision : segments traduits.**

`/fr/produits` ↔ `/en/products`. Deux raisons, dans cet ordre :

1. Un visiteur anglophone à qui l'on envoie `/en/produits` lit une adresse
   qu'il ne comprend pas ; l'URL est le premier élément de contenu qu'il voit,
   avant même la page.
2. Les moteurs indexent le mot français sur la page anglaise. Le site vise
   quatre pays et une clientèle industrielle internationale : c'est du trafic
   perdu pour rien.

**Ce qui n'est PAS traduit : le slug du document.** Seul le segment de section
change. `/fr/realisations/sapin-monumental-ekpe` devient
`/en/case-studies/sapin-monumental-ekpe`. Traduire aussi le slug imposerait un
second champ localisé, donc deux URL canoniques par document, donc un arbitrage
de contenu dupliqué à chaque publication  -  pour un gain de référencement
marginal sur un nom propre.

**Correction apportée à la table.** `realisations` avait le même segment dans
les deux langues. En anglais, *a realisation* désigne une prise de conscience,
pas une étude de cas : le segment anglais devient **`case-studies`**, cohérent
avec le libellé validé « Case studies » de la collection.

`expertises` reste identique dans les deux langues : le mot existe en anglais
des affaires et c'est le libellé de navigation validé. Les segments `contact`,
`about`, `legal-notice`, `privacy-policy`, `products`, `training`,
`training-events`, `events` et `projects` sont traduits.

**Mise en œuvre.** La table `SEGMENTS` de `packages/validation/src/routes.ts`
est la seule source. Le site public, la prévisualisation du dashboard, la
création automatique de redirections 301 et la validation des destinations de
bouton produit (RG-023) la consomment toutes : aucune URL n'est écrite deux
fois dans le code.

**Conséquence à traiter au prompt 06.** Chaque page publie ses alternates
`hreflang` vers l'autre langue, et le changement de langue conserve la page
courante au lieu de renvoyer à l'accueil.

---

## D-03  -  Route publique `/projets`  -  **ACTÉE le 27/08/2026**

**Contexte.** Le module Projets figure au cahier des charges §2, la table
`projects` possède slug et champs SEO, le prototype expose `#/projets` et
`#/projets/:slug`  -  mais aucune URL n'est prévue dans le plan d'URL, et le
menu principal validé ne compte que sept entrées, sans « Projets ».

**Décision : route publique OUI, entrée de menu NON.**

- `/fr/projets` et `/en/projects` existent, liste et fiche.
- Le menu principal garde ses **sept entrées validées**. Ajouter une huitième
  entrée modifierait une maquette approuvée et déséquilibrerait l'en-tête, qui
  est déjà à sa limite de largeur à 1024 px (voir D-11).
- Les projets sont atteints depuis la page **Réalisations**, dans un bloc
  « Projets en cours et à venir », et depuis l'accueil.

**Pourquoi la route est nécessaire.** Un projet porte un titre, un résumé, une
description détaillée, un domaine lié, un visuel et ses propres métadonnées de
référencement. Sans adresse canonique, ces champs ne sont lus par personne, la
prévisualisation du dashboard pointe dans le vide, et le Publicateur voit un
bouton « Prévisualiser » qui ne mène nulle part  -  le genre de détail qui fait
perdre confiance dans tout l'outil.

**Pourquoi pas dans le menu.** Les deux projets de démonstration sont des
actions d'orientation scolaire, pas des références commerciales. Les placer au
même niveau que « Expertises » ou « Réalisations » donnerait au visiteur
industriel une lecture fausse de l'activité.

**Distinction éditoriale, à rappeler dans le dashboard.**

| | Réalisations | Projets |
|---|---|---|
| Temporalité | livré, terminé | planifié ou en cours |
| Preuve attendue | contexte, solution, **résultats mesurés** | intention et description |
| Champ d'état | `year` | `projectState` (planifié / en cours / achevé) |

**Réversible sans code.** Le global Navigation propose déjà la destination
`projets` avec une case « Visible ». Le jour où le Client veut la promouvoir au
menu, c'est une case à cocher  -  pas un développement.

---

## D-04  -  Mode sombre  -  **ACTÉE : supprimé**

`standalone.html` embarque un thème sombre complet et un bouton de bascule. Le
prompt 02 l'interdit explicitement et le critère de recette client vérifie
« aucun mode clair/sombre non demandé ». Le thème clair validé est seul retenu.
Le prototype n'est pas modifié : il reste la référence figée.

---

## D-05  -  Collection `pages` pour les pages de liste

**Contexte.** Les hero, sous-titres et métadonnées SEO de `/produits`,
`/expertises`, `/realisations`, `/formations-evenements`, `/evenements`,
`/a-propos` et `/contact` sont codés en dur dans le prototype et n'ont aucune
table dans le MPD. Le critère de recette exige que **tout** élément visible soit
administrable.

**Recommandation.** Créer une collection `pages` indexée par clé
(`produits`, `expertises`, …) portant hero, intro et SEO par locale.

---

## D-06  -  Entités manquantes au MPD

Absents du `.sql` et du prompt 03, mais présents au cahier des charges ou dans le
prototype : **Mot du PDG**, **Qui sommes-nous / piliers**, **chiffres clés**,
**horaires et délai de réponse**, **statut métier des projets**
(`planned` / `ongoing` / `done`, distinct du statut de publication).

**Recommandation.** Deux globals (`ceo-message`, `about-page`), un tableau de
chiffres clés dans le global `homepage`, deux champs supplémentaires dans
`site-settings`, et un champ `projectStatus` dans `projects`.

---

## D-07  -  Versioning

**Contexte.** Le MPD prévoit une table `revisions` ; Payload fournit nativement
`drafts`, `versions` et la restauration.

**Recommandation.** Utiliser le versioning **natif Payload** pour l'historique
éditorial et la restauration, et conserver une collection `audit-logs`
append-only distincte pour la traçabilité de sécurité (connexions, changements
de rôle, modifications de réglages)  -  les deux besoins n'ont ni le même cycle de
vie ni les mêmes droits de lecture.

---

## D-08  -  Hôte de l'API événements  -  **ACTÉE**

`docs/openapi-evenements.yaml` déclarait `http://localhost:3000/api`, alors que
l'entrée locale unique est Nginx sur le port 8080 et que l'API REST de Payload
occupe déjà `/api/*`.

**Décision.** L'API publique des événements est servie par **`apps/web`**
(Next.js), sur l'hôte du site public, derrière Nginx :
`http://localhost:8080/api/events`. L'API Payload reste sur l'hôte
d'administration. Le fichier OpenAPI sera corrigé au prompt 09.

---

## D-09  -  Polices auto-hébergées  -  **ACTÉE**

Le prototype charge Playfair Display et Plus Jakarta Sans depuis Google Fonts.
Une dépendance à un CDN externe pénalise l'objectif Lighthouse ≥ 90 et complique
la CSP stricte exigée par le cahier des charges §7. Les deux familles sont
auto-hébergées via `next/font/local` au prompt 02. **Le rendu visuel est
identique  -  seule la source de chargement change.**

---

## D-10  -  Séparation site public / administration par hôte  -  **ACTÉE**

Le site public est servi sur `localhost:8080`, l'administration sur
`admin.localhost:8080`. Cette séparation évite la collision `/api/*` entre
Payload et l'API des événements, et reproduit dès le développement le
sous-domaine d'administration recommandé en production
(`docs/urls-et-redirections.md` §3).

---

## D-11  -  Correctif de débordement horizontal à 320 px  -  **ACTÉE**

Mesuré au prompt 02 : `standalone.reference.html` déborde horizontalement à
320 px, sur l'accueil comme sur les pages de liste. Dans les 280 px utiles de
`.wrap`, la marque, le bouton « Contact » et le bouton de menu ne tiennent pas.

Le critère de recette exige l'absence de débordement à 320, 375, 390, 768 et
1440 px. L'appel à l'action de l'en-tête est donc masqué **sous 480 px
uniquement** ; il reste présent, en pleine largeur, dans le menu mobile.

Aucune couleur, typographie ou valeur d'espacement validée n'est modifiée.

Un second débordement, propre à l'extraction, a été corrigé au passage : un
élément réservé aux lecteurs d'écran en `position: absolute` sans ancêtre
positionné échappait au rognage du tableau défilant et élargissait le document.
L'utilitaire `.sr-only` du design system n'utilise donc pas `position: absolute`.

---

## D-12  -  Design system distribué en source TypeScript  -  **ACTÉE**

`@africa-ingenierie/ui` n'est pas précompilé : les applications le déclarent
dans `transpilePackages`. Cela évite une étape de build supplémentaire dans le
monorepo et garde le rechargement à chaud instantané pendant le développement.

Conséquence sur les imports internes du paquet : ils sont **sans extension**.
La résolution « Bundler » de TypeScript et le bundler de Next.js résolvent les
sources `.ts`/`.tsx` directement ; une extension `.js` ferait chercher un
fichier compilé qui n'existe pas.

---

## D-13  -  Champ d'état nommé `editorialStatus`  -  **ACTÉE**

Le champ d'état éditorial ne peut pas s'appeler `status`.

Le versionnage de Payload ajoute un champ interne `_status`. Les deux noms
produisent le **même** type énuméré PostgreSQL (`enum_<table>_status`) : le type
était créé avec les seules valeurs de Payload (`draft`, `published`), et les
valeurs `review` et `archived` du workflow contractuel étaient rejetées par la
base à l'exécution.

Le défaut a été trouvé par les tests d'intégration sur PostgreSQL réel. Il était
invisible en revue de code, et la migration s'appliquait sans erreur.

Le champ s'appelle donc **`editorialStatus`**, avec ses quatre valeurs. Un test
vérifie l'énumération sur chacune des onze collections de contenu.

---

## D-14  -  Les règles d'état vivent dans un hook, pas dans un accès de champ  -  **ACTÉE**

Premier réflexe : interdire à l'Éditeur d'écrire la valeur `published` par un
contrôle d'accès de champ. Vérification faite, **Payload retire silencieusement
un champ refusé** avant d'exécuter les hooks : l'enregistrement réussissait, la
valeur interdite était ignorée, et l'Éditeur recevait un « enregistré » alors
qu'il n'avait rien publié.

Un refus silencieux est pire qu'un refus : l'utilisateur croit avoir agi et le
journal d'audit ne consigne aucune tentative.

La règle est donc appliquée par `enforceStatusTransition`, un hook
`beforeValidate`  -  donc antérieur au filtrage de champ  -  qui refuse
explicitement avec un message actionnable. Deux tests couvrent le cas : le refus
lui-même, et le fait que l'état en base reste inchangé.

---

## D-15  -  Le schéma PostgreSQL ne provient que des migrations (`push: false`)  -  **ACTÉE**

**Contexte.** Au premier démarrage complet de la pile, `pnpm migrate` a échoué :

```
ERROR: Error running migration 20260826_193331_initial_schema
  Failed query: CREATE TYPE "public"."_locales" AS ENUM('fr', 'en');
  caused by: error: type "_locales" already exists
```

**Cause.** `docker compose up -d` démarre le service `cms`, qui lance
`next dev`. En mode développement, l'adaptateur PostgreSQL de Payload pousse
automatiquement le schéma dans la base au démarrage (`push` implicite). La base
contenait donc déjà les 102 tables et tous les types AVANT la première
migration ; la migration versionnée entrait alors en collision avec un schéma
qu'elle était censée créer.

Le symptôme est trompeur : Payload demande d'abord « vous avez lancé Payload en
mode dev, une perte de données va survenir, continuer ? ». Répondre « oui » ne
règle rien, car la question ne porte pas sur la suppression du schéma poussé.

**Conséquences.** Un schéma poussé automatiquement dérive silencieusement des
migrations : la base de développement et la base de production cessent d'être
comparables, et plus rien ne garantit qu'une migration s'applique en production.
C'est exactement ce que la règle projet « utilise les migrations Payload, ne
joue pas le SQL de conception directement » interdit.

**Décision.**

1. `push: false` dans `postgresAdapter` (`apps/cms/src/payload.config.ts`). Le
   schéma ne vient plus que des fichiers de `apps/cms/src/migrations/`.
2. Le service `cms` joue `payload migrate` avant `next dev`. `payload migrate`
   est idempotent : les migrations déjà appliquées sont ignorées. L'ordre
   « migration puis serveur » ne peut donc plus être inversé par erreur, et un
   échec de migration arrête le conteneur au lieu de le laisser démarrer sur un
   schéma faux.
3. Toute évolution de modèle passe désormais par `pnpm migrate:create`, dont le
   fichier généré est relu et versionné.

**Coût assumé.** Modifier une collection n'est plus reflété en base par un
simple redémarrage : il faut générer une migration. C'est le prix de la
reproductibilité, et il est payé une fois par changement de modèle.

**Remise à zéro nécessaire une seule fois**  -  la base porte encore le schéma
poussé automatiquement, et `pnpm migrate` continuerait d'échouer dessus :

```powershell
pnpm dc rm -sf postgres
docker volume rm -f africa-ingenierie_postgres_data
pnpm up:data
pnpm migrate
pnpm bootstrap:users
pnpm up
```

Aucune donnée réelle n'existe à ce stade : la remise à zéro est sans perte.

**Corollaire  -  les commandes Payload s'exécutent dans le conteneur.** Lancé
depuis Windows, `payload migrate` ne voit ni `.env.local` (chargé par Docker
Compose via `env_file`) ni les noms d'hôtes `postgres`/`seaweedfs` (résolus par le
réseau Docker) : il échoue sur `missing secret key`, puis sur une base
injoignable. Les scripts racine `migrate`, `migrate:create`, `migrate:status`,
`bootstrap:users`, `generate:types` et `test` encapsulent donc
`docker compose run --rm cms`.

La correction rejetée était de créer un `apps/cms/.env` portant une seconde
valeur de `PAYLOAD_SECRET` : deux secrets divergents invalident toutes les
sessions dès qu'on change de chemin d'exécution, et un secret dupliqué dans
deux fichiers finit par être committé. Le secret reste dans `.env.local`, une
seule fois. `pnpm test:host` reste disponible pour un usage hors conteneur,
mais exige alors un environnement fourni par l'appelant.

---

## D-16  -  Le contenu de démonstration porte un marqueur en base  -  **ACTÉE**

**Contexte.** Le prompt 05 demande des jeux de démonstration « explicitement
marqués comme données de démonstration » et un seed qui « n'écrase jamais des
données réelles sans confirmation ».

**Problème.** Rien, en base, ne distinguait une fiche de démonstration d'une
fiche réelle. Une convention de nommage ou un préfixe dans le texte ne tient
pas : le premier éditeur qui corrige un titre efface le marqueur sans le
savoir. C'est ainsi qu'un texte provisoire finit en production.

**Décision.** Un champ `isDemo` est ajouté à toutes les collections de contenu
(fabrique `contentCollection`), aux sessions de formation et à la médiathèque  -
migration versionnée `20260827_030123_demo_flag`, générée puis appliquée sur une
base PostgreSQL réelle avant livraison.

Il porte trois usages :

1. **Le seed ne réécrit que ce qu'il a produit.** Un document existant dont
   `isDemo` est faux est laissé intact et listé en fin d'exécution. `--force`
   lève la protection, et exige `SEED_FORCE_CONFIRMED=yes`.
2. **L'inventaire de ce qui reste à remplacer est lisible** dans le tableau de
   bord, sans requête SQL.
3. **Un test de non-régression** vérifie qu'un document démarqué survit à une
   nouvelle exécution du seed.

**Réglages globaux.** Ils n'ont qu'un exemplaire et donc pas de marqueur : le
seed ne les écrit que s'ils sont vides, en testant un champ témoin
(`siteName`, `mainMenu`, `personName`, `presentation`, `heroTitle`).

---

## D-17  -  Les visuels de démonstration sont générés, pas photographiés  -  **ACTÉE**

**Contexte.** Le prompt 05 demande un pack média de démonstration, chaque
visuel portant texte alternatif, type, poids et mention de droits.

**Options écartées.**

- *Photographies de banque d'images libres.* Leurs licences imposent malgré
  tout des conditions  -  attribution, usage commercial, redistribution  -  que
  personne ne relira avant la mise en production. Et un visuel réaliste finit
  toujours par être pris pour un visuel réel : c'est le mécanisme même par
  lequel une photo de démonstration se retrouve sur le site livré.
- *Binaires versionnés dans le dépôt.* Vingt-six images alourdissent le clone
  pour une donnée jetable.

**Décision.** Les visuels sont calculés à l'exécution (`sharp`, motif abstrait
aux couleurs du design system : bleu de marque, bleu profond, bande d'accent).
Aucun droit de tiers, aucun binaire au dépôt, et un aplat abstrait ne peut pas
être confondu avec une photographie.

Le texte alternatif dit ce que l'image montre réellement : « Visuel de
démonstration, en attente d'une photographie : intervention de maintenance sur
une ligne de production. » Un texte alternatif qui décrirait une photographie
inexistante serait faux pour un lecteur d'écran et invisible en relecture.

**Aucun portrait, aucun logo de partenaire n'est généré.** Un motif abstrait
présenté comme le portrait d'une personne nommée, ou comme le logo d'une
entreprise réelle, serait un faux. Ces emplacements restent vides et le site
public affiche son état vide  -  ce que le design system prévoit déjà
(`MediaPlaceholder`, `EmptyState`).

---

## D-18  -  Ce qui vient du CMS, et ce qui n'en vient pas  -  **ACTÉE**

**Règle du projet.** « Tous les contenus visibles doivent venir du CMS ou des
réglages globaux, jamais de textes dupliqués en dur. »

**Application.** Titres, accroches, descriptions, appels à l'action, chiffres,
libellés de navigation, coordonnées, textes légaux, ordre et visibilité des
sections d'accueil, en-têtes de rubrique et états vides : **tout** vient du CMS.
Le site public ne contient aucun texte éditorial.

**Exception, unique et circonscrite.** Les libellés de STRUCTURE  -
`apps/web/src/lib/ui-strings.ts` : lien d'évitement, repère de fil d'Ariane, et
les intitulés qui nomment un CHAMP du modèle (« Contexte », « Résultats »,
« Prochaines sessions », libellés du formulaire).

Les exposer au tableau de bord donnerait au Client le pouvoir de renommer
« Contexte » sur toutes les fiches à la fois  -  besoin qui n'existe pas  -  et
celui de les vider, ce qui casserait la page. Ces libellés reprennent mot pour
mot les `label` bilingues déjà déclarés sur les champs Payload. Ils sont
regroupés dans UN fichier, exhaustif, pour qu'un audit les vérifie d'un coup
d'œil.

**Corollaire livré au passage.** `Header` et `Footer` du design system
écrivaient leurs libellés en français en dur (« Aller au contenu principal »,
« Navigation principale », « Tous droits réservés »). Sur les pages anglaises,
un lecteur d'écran annonçait donc du français. Les deux composants acceptent
désormais des `labels`, dont les valeurs par défaut restent celles du prototype.

---

## D-19  -  Images rendues par `<img>`, pas par `next/image`  -  **ACTÉE**

Deux raisons, dans cet ordre :

1. **L'optimiseur ne peut pas atteindre les médias.** Ils sont servis par
   `admin.localhost`, un nom qui n'existe que dans le fichier hosts du
   visiteur. Le conteneur `web` ne le résout pas : l'optimiseur échouerait sur
   chaque image.
2. **Payload génère déjà quatre tailles** à l'import (`thumbnail`, `card`,
   `hero`, `og`). Ré-optimiser ferait le travail deux fois.

**Règle d'accessibilité appliquée.** Un média sans texte alternatif dans la
langue de la page n'est **jamais** rendu comme image : on retombe sur la plaque
d'attente, qui énonce ce que le visuel montrera. Une image sans alternative est
invisible pour un lecteur d'écran  -  l'absence assumée vaut mieux.

---

## D-20  -  Segments traduits par dossiers, pas par réécriture  -  **ACTÉE**

**Ce qui a été essayé.** Un proxy réécrivant `/en/products` vers
`/en/produits`, pour n'avoir qu'une arborescence de fichiers.

**Pourquoi cela a échoué.** Next.js convertissait la réécriture en redirection
308 vers l'adresse d'origine : **toutes les pages anglaises tournaient en
boucle**. Ni le typage, ni la compilation, ni les tests unitaires ne le
voyaient. Seul un appel HTTP réel l'a révélé  -  d'où la vérification des 26
routes, désormais partie de la recette.

**Ce qui est retenu.** Chaque segment anglais est un dossier qui **réexporte**
la page française :

```
app/[locale]/case-studies/page.tsx  →  export { default, generateMetadata } from '../realisations/page'
```

Une seule implémentation, deux adresses. Les deux langues ne peuvent pas
diverger, puisqu'il n'existe qu'une page. Treize dossiers, aucun routage
dynamique à déboguer.

Le proxy ne fait plus que trois choses : la racine vers la langue par défaut,
le préfixe de langue manquant, et la transmission du chemin courant aux pages.

**Deux pièges rencontrés, notés pour la suite :**

- `headers()` dans un composant serveur lit les en-têtes de la **requête**, pas
  de la réponse. Poser `x-pathname` sur la réponse ne remontait jamais aux
  pages : la surbrillance du menu et le changement de langue retombaient
  silencieusement sur l'accueil.
- `new URL(request.url)` peut porter un hôte différent de celui de la requête.
  `nextUrl.clone()` est la seule construction sûre.

Le fichier s'appelle `proxy.ts` : Next.js 16 a renommé la convention
`middleware`.

---

## D-21  -  Rendu à la demande, données mises en cache  -  **ACTÉE**

**Choix.** Les pages sont rendues **à la demande** (SSR) ; ce sont les
**lectures du CMS** qui sont mises en cache, 5 minutes, par étiquette
(`cms:products`, `cms:global:homepage`…).

**Pourquoi pas du statique.** L'en-tête met en surbrillance la rubrique
courante et le sélecteur de langue pointe vers la page équivalente : les deux
exigent de connaître le chemin demandé, donc un rendu par requête. Sacrifier la
surbrillance et le changement de langue contextuel pour gagner quelques
millisecondes serait un mauvais échange.

**Ce que cela coûte réellement.** Le CMS est interrogé au plus une fois par
requête distincte et par tranche de 5 minutes ; le rendu HTML lui-même est peu
coûteux. Les étiquettes de cache sont invalidées à la publication par un
webhook HMAC signé, et les chemins de liste et de détail concernés sont
revalidés sans invalider inutilement tout le site.

Une erreur de livraison est observable dans les logs et le journal d'audit ;
elle ne supprime pas la dernière version publique valide. Les sauvegardes en
brouillon ne déclenchent pas ce mécanisme. La prévisualisation passe par un
jeton HMAC court, vérifié côté CMS et côté site, et reste limitée aux comptes
Payload actifs autorisés.

**Contenus non publiés.** Chaque lecture ajoute
`editorialStatus = published`, et le contrôle d'accès de Payload l'impose déjà
pour un visiteur anonyme. Un brouillon appelé par son adresse renvoie 404  -
vérifié sur `/fr/produits/inexistant`.

---

## D-22  -  Les tests ont leur propre base  -  **ACTÉE**

**Ce qui a été constaté.** Le tableau de bord affichait, mêlés aux vrais
contenus, des produits `REF-ANON-DRAFT`, `REF-PUB-DELETE`, `REF-PUB-PUBLISH`,
`REF-EDITOR-DELETE`, `REF-EDITOR-ARCHIVE`. Pire : un produit fabriqué par un
test et laissé à l'état **publié**  -  « Équipement publié depuis le dashboard
… »  -  était visible sur `/fr/produits`, en catalogue, à côté des vraies fiches.

**Cause.** `pnpm test` s'exécutait sur la base de développement. La suite
écrivait donc dans les contenus de travail à chaque exécution.

**Pourquoi le nettoyage ne suffisait pas.** Un `resetTestContent` existait. Il
ne couvrait qu'une partie des cas, et surtout il ne s'exécute pas quand un test
échoue au milieu  -  c'est-à-dire précisément quand il y aurait le plus à
nettoyer. Faire reposer l'intégrité de la base de travail sur la discipline
d'un `afterAll` est un pari qu'on finit toujours par perdre.

**Décision : isolation structurelle.** `apps/cms/tests/setup.ts` redirige
`DATABASE_URL` vers une base dédiée  -  la base de travail suffixée `_test`, ou
`DATABASE_URL_TEST` si elle est définie. Le fichier **refuse de démarrer** si
les deux URL coïncident : il ne peut plus y avoir d'écriture accidentelle.

`pnpm test` appelle d'abord `prepare-test-db.ts`, qui crée la base si besoin et
y joue les **mêmes migrations versionnées** que la base réelle  -  la base de
test ne peut donc pas diverger du schéma.

**Preuve.** Base de travail relevée avant et après une suite complète :
12 produits, dont 8 `REF-`, avant ; **12 produits, dont 8 `REF-`, après**.
Aucune écriture. Les mêmes tests écrivent bien dans `africa_test`.

**Rattrapage de l'existant.** `pnpm db:clean-tests` liste puis retire les
traces déjà présentes : produits `REF-*`, contenus au titre fabriqué, et
visuels de démonstration orphelins. Il n'agit que sur une base locale, et
n'efface rien sans `--apply`.

---

## D-23  -  L'interface dit pourquoi elle refuse  -  **ACTÉE**

**Ce qui a été constaté.** Un administrateur ouvrait « Expertises », voyait la
liste… et aucun bouton « Créer ». Aucun message. Conclusion naturelle : le
tableau de bord est cassé.

**Cause.** Le contrôle d'accès refusait la création parce que le compte n'avait
pas encore changé son mot de passe initial (RG : `mustChangePassword` bloque
toute écriture). Payload retire alors l'action de l'interface  -  comportement
correct, puisqu'un bouton qui échoue est pire qu'un bouton absent.

**Ce qui manquait.** Le lien entre la cause et l'effet. Un refus silencieux est
indiscernable d'une panne.

**Décision.** Un bandeau `WriteBlockedNotice` s'affiche en tête de chaque liste
et nomme la cause :

| Situation | Message |
|---|---|
| Mot de passe initial non changé | explique le blocage, lien direct vers le changement |
| Compte suspendu | indique qu'un administrateur doit le réactiver |
| Rôle Éditeur | rappelle que la publication passe par un Publicateur |

La règle n'est pas modifiée  -  seule son explication est ajoutée. Un contrôle
d'accès qui se tait transforme une règle de sécurité en bogue apparent.

---

## D-24  -  Un visuel manquant n'interrompt pas le seed  -  **ACTÉE**

`generateMediaFile` lisait les visuels de `seed/assets/` sans vérifier leur
présence. Un seul fichier absent  -  clone partiel, renommage, LFS non installé  -
et `sharp` levait : **le seed entier s'arrêtait**, sans écrire aucun contenu.

La lecture est désormais protégée : à défaut du fichier, le motif calculé prend
le relais et un avertissement nomme le visuel manquant. Vérifié en supprimant
les treize visuels : les 12 tests de seed passent, chaque visuel absent est
signalé.

---

## D-25  -  Les tests de bout en bout sont une suite à part  -  **ACTÉE**

**Découvert par D-22.** Une fois la base des tests isolée, trois tests de
`publication-flow.test.ts` sont passés au rouge avec « Pas trouvé » (404).

**Ce que cela a révélé.** Ces tests écrivent par l'API locale, puis relisent en
HTTP sur `http://cms:3001` et `http://web:3000`. Or ces conteneurs sont branchés
sur la base de TRAVAIL. Les deux moitiés du test regardaient donc deux bases
différentes.

Ils n'étaient verts que parce que tout partageait une seule base  -  c'est-à-dire
grâce au défaut que D-22 corrige. L'isolation n'a rien cassé : elle a rendu
visible un test qui ne testait pas ce qu'il prétendait.

**Décision.** Deux suites, deux natures :

| | `pnpm test` | `pnpm test:e2e` |
|---|---|---|
| Portée | API locale + vraie base | traverse `cms`, `web` et Nginx |
| Base | isolée (`…_test`) | base de travail, assumé |
| Pile démarrée | non requise | **requise** |
| Dans la CI par défaut | oui | non |

Les mêler rendrait `pnpm test` rouge dès que les conteneurs sont arrêtés  -  un
signal faux, qu'on finit par ignorer, et c'est ainsi qu'on manque une vraie
panne.

**Reste à faire.** Les trois tests exclus ne sont pas réparés, seulement
déplacés. Ils doivent être relancés pile démarrée (`pnpm up && pnpm test:e2e`)
et corrigés si le flux de publication du prompt 07 a un vrai défaut.

---

## D-26  -  Les lectures du CMS sont dédoublonnées par rendu  -  **ACTÉE**

Une page publique demandait plusieurs fois la même donnée : les réglages
généraux étaient lus par l'ossature (en-tête et pied de page), par
`generateMetadata`, puis parfois par la page  -  trois requêtes HTTP identiques
vers le CMS pour un seul rendu. L'en-tête de rubrique était lu deux fois.

`findGlobal`, `loadSiteChrome` et `loadSectionPage` sont enveloppés dans
`cache()` de React : le résultat est mémorisé pour la durée d'UN rendu.

À ne pas confondre avec le cache de `fetch` (5 minutes, entre les requêtes,
D-21) : `cache()` ne vit que le temps d'un rendu, et agit donc aussi en
développement, où Next.js désactive le cache de `fetch`. C'est précisément là
que le gain se voit.

---

## D-27  -  Les formulaires d'administration sont organisés en onglets  -  **ACTÉE**

**Ce qui a été constaté.** Ouvrir une réalisation présentait seize champs
empilés dans une seule colonne, sans hiérarchie : le texte à rédiger, les
métadonnées facultatives, les visuels et le référencement au même niveau. Rien
n'indiquait par où commencer ni ce qui était réellement attendu.

**Décision : quatre onglets, du plus obligatoire au plus technique.**

| Onglet | Contenu |
|---|---|
| **Contenu** | ce qu'il faut écrire pour que la fiche existe  -  tout obligatoire |
| **Détails** | métadonnées facultatives (client, année, indicateurs…) |
| **Visuels** | téléversements d'images |
| **Référencement** | titre et description propres à la page |

La colonne latérale ne garde que ce qui **pilote** la fiche  -  slug, état,
mise en avant, ordre d'affichage  -  jamais son contenu.

Une réalisation présente désormais **cinq champs** à l'ouverture, au lieu de
seize. Rien n'a été perdu : ce qui alimente le site public est toujours là,
simplement rangé.

**Ce qui a été RETIRÉ du modèle**, parce que le coût de saisie dépassait
l'usage :

- `products.gallery`  -  une galerie secondaire que le site public n'affichait
  pas. Un champ que personne ne voit est un champ rempli pour rien.
- `products.ctaHref`  -  la destination du bouton, avec sa règle de validation.
  Toutes les fiches pointaient vers Contact, seul comportement sensé pour un
  catalogue sans prix. Le bouton y mène désormais toujours.

**Effet sur RG-023.** La règle exigeait qu'un bouton produit ne vise qu'une
route interne ou une URL `https`. Elle était appliquée par une validation sur
un champ libre. Le champ n'existe plus : une adresse arbitraire ne peut plus
être saisie, ni par le tableau de bord, ni par l'API, ni par une requête
forgée. C'est une garantie plus forte qu'une validation. Le test de RG-023
vérifie désormais cet invariant de schéma.

**Ce qui a été AJOUTÉ.** `realisations.media`  -  un visuel principal. Les
réalisations n'avaient qu'un couple avant/après ; la carte affichait donc
l'« après » faute de mieux. Le visuel principal prime, l'« après » sert de
repli.

---

## D-28  -  Publier dès la création est refusé  -  **ACTÉE**

**Ce qui a été constaté.** Une réalisation créée par un administrateur portait
« Titre  -  fr », « Secteur  -  fr » et l'état « Publié » : la fiche était en ligne
avec sa moitié anglaise vide. Le site anglais affichait donc du français.

**Cause.** Payload n'écrit qu'une locale à la fois. Le contrôle de complétude
bilingue (RG-011) ne s'appliquait qu'aux mises à jour, jamais à la création  -
et remplir le français puis cocher « Publié » était le chemin le plus naturel.

**Décision.** La création avec l'état « Publié » est refusée, avec la marche à
suivre dans le message : enregistrer en brouillon, basculer la langue avec le
sélecteur « Paramètres régionaux », compléter, puis publier.

Le refus est délibérément placé là où l'erreur se commet. Un contenu à moitié
traduit ne peut plus atteindre le site  -  ce que RG-011 exigeait depuis le
départ, sans que le chemin le plus court le respecte.

---

## D-29  -  Import map Payload régénéré après ajout des composants admin  -  **ACTÉE le 28/08/2026**

Une page `/admin` vide pouvait provenir d'un import map généré incomplet après
l'ajout des composants personnalisés. L'import map est désormais régénéré et
les réponses HTTP du dashboard et de la page de connexion sont vérifiées.

## D-30  -  Lint et typage explicites dans le monorepo  -  **ACTÉE le 28/08/2026**

Les scripts `lint` et `typecheck` utilisent des configurations explicites pour
Next.js 16 et TypeScript. La recette locale vérifie ces commandes en plus des
tests CMS et du contrôle HTTP des routes.

## D-31  -  Fonctions transverses non livrées déclarées comme backlog  -  **ACTÉE le 28/08/2026**

Le rate limit applicatif et l'anti-robot du contact, la notification SMTP, le
nettoyage de conservation et l'API événements ne doivent pas être décrits comme
disponibles tant que leurs routes, tests et déploiement ne sont pas terminés.

## Décisions restant à la charge du Client

Reprises de `docs/matrice-tracabilite.md` et de l'audit initial, non tranchables
par le Prestataire :

- nom de domaine et sous-domaine d'administration ;
- inventaire des anciennes URL Framer (aucune ne doit être inventée) ;
- textes juridiques définitifs ;
- durées de conservation validées juridiquement ;
- identités et adresses professionnelles des six comptes de production ;
- secrets SMTP et adresse de réception des demandes ;
- logo, favicon et médias réels, ou autorisation écrite du pack de
  démonstration généré ;
- position sur le livrable Figma, contractuellement préalable au développement ;
- définition du « périmètre » du rôle Publicateur (archivage, lecture des
  messages) et de l'accès des Éditeurs aux messages ;
- arbitrage du planning : 10 jours ouvrés pour les phases 0 à 4.
