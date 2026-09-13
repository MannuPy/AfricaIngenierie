# Rapport d’audit complet de la plateforme locale

Date d’exécution : 1 septembre 2026  
Périmètre : `C:\Projet\Projets- ING`  
Environnement : Docker Compose local, Nginx `127.0.0.1:8080`, PostgreSQL 17,
MinIO, Mailpit, Next.js 16.3.3 et Payload 3.88.0.

## Verdict

L’erreur affichée dans le navigateur (`ERR_CONNECTION_RESET`) n’est plus
reproductible après arrêt du serveur web, suppression du volume de cache
`africa-ingenierie_next_web` et recréation du conteneur. Les services Docker
sont sains et les routes publiques répondent.

Deux défauts fonctionnels ont été corrigés pendant cette passe :

1. l’endpoint `GET /api/events/:slug/calendar` n’était pas enregistré par
   Next.js et renvoyait 404 ; il passe maintenant par une route catch-all
   explicite qui distingue le détail et le calendrier ;
2. le build de production par défaut utilisait Turbopack et pouvait partager le
   volume `.next` du serveur de développement ; le script web utilise désormais
   `next build --webpack`, et le build a été vérifié avec `NODE_ENV=production`.

## Tableau de recette

| Test | Résultat | Preuve | Sévérité | Correction / statut |
|---|---|---|---|---|
| Services Docker | PASS | `docker compose ps` : cms, web, nginx, PostgreSQL, MinIO et Mailpit healthy | Critique | Validé |
| Cause du reset navigateur | CORRIGÉ | cache `.next` recréé ; `/healthz` et `/fr` répondent 200 | Critique | Corrigé |
| Résolution `localhost` Windows/Docker | CONTOURNÉ | `localhost` résout d’abord `::1` et la pile Docker Desktop réinitialise cette connexion ; `127.0.0.1` répond, Compose est lié explicitement à IPv4 | Critique | Utiliser `http://127.0.0.1:8080` ; ne pas modifier les fichiers de données |
| Santé web | PASS | `GET /healthz` et `GET /readyz` 200 | Critique | Validé |
| Santé Nginx | PASS | `GET /nginx-health` 200 dans la recette locale | Élevée | Validé |
| Routes publiques FR/EN | PASS | `BASE_URL=http://127.0.0.1:8080 ROUTE_TIMEOUT_MS=60000 node scripts/check-routes.mjs` : 30/30 bons codes ; médiane 2,56 s en `next dev` froid | Critique | Validé ; temps de compilation dev non représentatif de la production |
| Navigation et liens de langue | PASS statique | `lang=en`, chemins FR/EN et navigation active vérifiés dans les pages rendues | Élevée | Validé ; contrôle clavier visuel à rejouer |
| Ajout d’une entrée au menu principal | CORRIGÉ | le global `Navigation` est consommé par `mainNav` et `footerColumns`; aide bilingue et limite de 9 entrées ajoutées | Élevée | Corrigé ; enregistrer le global puis recharger le site |
| Logo dans le dashboard | CORRIGÉ | `AdminLogo` est rendu à la connexion et `AdminBrand` est injecté avant les liens Payload | Moyenne | Corrigé ; vérifier après authentification |
| Formulaire logo partenaire | AMÉLIORÉ | champ upload conservé dans l’onglet Visuels avec aide de téléversement FR/EN | Moyenne | Validé par typecheck ; vérifier le bouton de création média selon le rôle |
| Édition des chiffres clés | CORRIGÉ | `Homepage.keyFigures` comporte valeur, suffixe et intitulé localisés, avec valeur positive obligatoire | Élevée | Corrigé ; publier le global Page de garde |
| Centrage confiance / chiffres clés | CORRIGÉ | titres centrés et bandeau de confiance centré sur desktop, retour au défilement horizontal sur mobile | Moyenne | Vérifié par capture navigateur |
| API événements liste | PASS | `/api/events?locale=en&limit=2` 200, cache public et `Content-Language: en` | Élevée | Validé |
| API événement détail | PASS | `/api/events/explorateurs-2026?locale=en` 200 | Élevée | Validé |
| API calendrier ICS | CORRIGÉ / PASS | `/api/events/explorateurs-2026/calendar?locale=en` 200, `text/calendar` | Élevée | Corrigé |
| Contrat OpenAPI | PASS partiel | `/api/openapi.json` 200 ; tests contrat CMS verts | Élevée | Ajouter un test HTTP dédié en CI |
| Paramètres API | PASS | `limit=0` 400 et slug inconnu 404 | Moyenne | Validé |
| Données commerciales événements | PASS | projection contrôlée ; aucun champ paiement, prix, billet, panier ou commande | Élevée | Validé |
| RBAC | PASS | tests Payload des rôles administrateur, publicateur et éditeur, avec refus de publication/suppression selon rôle | Critique | Validé par la suite CMS |
| Publication et audit | PASS | workflow, versions, audit et échec de revalidation couverts par les tests CMS | Critique | Validé par la suite CMS |
| TypeScript et ESLint | PASS | web et CMS `typecheck` + `lint` terminés sans erreur | Élevée | Validé |
| Build production | PASS | `next build --webpack` avec `NODE_ENV=production`, artefact `.next/BUILD_ID` présent | Critique | Corrigé et validé |
| PostgreSQL | PASS | `pg_isready`, requête SQL et restauration dans `africa_audit_restore_20260901` puis suppression de cette base | Critique | Validé ; données sources conservées |
| MinIO | PASS | copie de 260 objets vers un bucket temporaire, comptage 260/260, bucket temporaire supprimé | Critique | Validé ; bucket source conservé |
| SMTP local | PASS | `scripts/smtp-test.mjs` : message accepté par Mailpit | Élevée | Validé |
| Headers de sécurité locaux | PASS statique/HTTP | nosniff, frame protection, Referrer-Policy, Permissions-Policy, COOP et CSP présents | Élevée | Profil développement ; CSP stricte dans Oracle |
| Secrets Git | PASS statique | `.env.local`, `.env.oracle` et bootstrap local ignorés par Git ; aucun secret affiché dans ce rapport | Élevée | Les valeurs de production doivent rester hors dépôt |
| Uploads | PASS statique/tests | types limités, SVG refusé, taille maximale 20 Mo, textes alternatifs FR/EN requis | Élevée | Scan antivirus à ajouter avant production |
| Rate limit contact | PASS | six requêtes de test : réponses 400 puis 429 | Élevée | Barrière applicative validée ; rate limit distribué Render à prévoir |
| Sanitation / audit | PASS tests | audit append-only et champs sensibles supprimés avant journalisation | Élevée | Validé par tests CMS |
| HTML et alt text | PASS statique | pages EN contrôlées : `lang=en`, un `h1`, aucun `img` sans `alt` détecté | Moyenne | Contrôle axe réel encore requis |
| Responsive 320/390/768/1440 | PARTIEL | règles CSS et contrôles antérieurs présents ; navigateur automatisé indisponible pendant cette passe | Élevée | Rejouer Playwright avant recette client |
| Accessibilité axe/clavier/focus/contraste | NON CONCLUANT | aucun runner `axe`/Playwright installé dans le projet | Élevée | À intégrer en CI, pas déclaré validé |
| Lighthouse mobile | NON EXÉCUTÉ | commande `lighthouse` absente ; le serveur local est en mode développement | Élevée | Exécuter sur `next start` avec seuils ≥ 90 |
| CVE dépendances/images Docker | NON CONCLUANT | `trivy` et scanner d’image absents de l’environnement ; `pnpm audit` n’a pas été concluant via le wrapper Windows | Élevée | Ajouter Trivy/Dependabot ou équivalent en CI |
| SEO | PASS partiel | sitemap.xml et robots.txt 200 ; canonical, metadata et hreflang présents sur les pages contrôlées | Moyenne | Ajouter assertions automatisées d’unicité et des 301 |
| Configuration production | PASS modèle / BLOQUÉ déploiement | Compose Oracle valide avec `.env.oracle.example`, mais aucun `.env.oracle` réel n’est présent | Critique | Créer les secrets de production avant déploiement |

## Correctifs appliqués

### Routage de l’API événements

Le fichier `apps/web/src/app/api/events/[...slug]/route.ts` prend désormais en
charge les deux chemins :

- `/api/events/{slug}` pour le JSON descriptif publié ;
- `/api/events/{slug}/calendar` pour le fichier ICS.

La validation conserve les réponses 400/404, la locale FR/EN, le cache public
contrôlé et la projection sans données commerciales.

### Build et cache Next.js

Le script `build` de `apps/web/package.json` force Webpack. Un build de
production ne doit pas être exécuté en parallèle du serveur `next dev` sur le
même volume `.next`. La recette locale doit donc utiliser un conteneur de build
isolé, puis relancer le mode de développement si nécessaire.

### Recette PowerShell

`scripts/verify-stack.ps1` ignore désormais les commentaires contenant
`change-me` et signale seulement les valeurs réellement configurées. En
l’absence de `.env.oracle`, il valide le modèle de Compose avec
`.env.oracle.example` sans le présenter comme déployable.

## Points restant à traiter avant production

1. Remplacer les valeurs locales d’exemple dans `.env.local` si cette machine
   doit servir de référence partagée ; elles ne doivent jamais être réutilisées
   en production.
2. Créer et protéger `.env.oracle` avec des secrets uniques, puis exécuter la
   validation Compose avec ce fichier réel.
3. Ajouter Playwright + axe-core pour les gabarits accueil, catalogue, détail,
   événements, contact et connexion admin aux quatre largeurs demandées.
4. Exécuter Lighthouse mobile sur le build de production, pas sur `next dev`,
   et conserver les rapports comme preuves versionnées.
5. Ajouter un scanner de dépendances et d’images Docker dans la CI.
6. Ajouter une assertion HTTP de `/api/openapi.json`, des 301, des metadata
   uniques, des canonical et des hreflang.

## Commandes de reprise

```powershell
cd 'C:\Projet\Projets- ING'
docker compose --env-file .env.local ps
curl.exe -i http://127.0.0.1:8080/healthz
curl.exe -i 'http://127.0.0.1:8080/api/events?locale=en&limit=2'
curl.exe -i 'http://127.0.0.1:8080/api/events/explorateurs-2026/calendar?locale=en'
docker compose --env-file .env.local logs --tail=100 web cms nginx
```

Le nettoyage exécuté pendant l’audit a porté uniquement sur le cache `.next`
du web et sur des cibles temporaires explicitement créées pour les tests de
restauration. Les volumes PostgreSQL, MinIO source et Mailpit n’ont pas été
supprimés.

### Note Windows sur `localhost`

Sur cette machine, `localhost` possède une entrée IPv6 `::1`. Docker Desktop
réinitialise la connexion IPv6 du port publié, alors que la même pile répond
normalement sur IPv4. La commande et l’URL de recette retenues sont donc :

```text
http://127.0.0.1:8080
http://admin.localhost:8080/admin
```

Cette limitation concerne la résolution locale de Windows/Docker Desktop, pas
le rendu Next.js ni les données PostgreSQL/MinIO.

### Vérification ciblée interface et administration - 1 septembre 2026

Les corrections visuelles et éditoriales complémentaires ont été contrôlées
après redémarrage de `cms` et `web` :

- le logo complet est affiché à la connexion admin et une marque persistante
  est injectée avant la navigation Payload pour les écrans authentifiés ;
- le menu principal est limité à neuf entrées, chaque entrée possède une
  destination contrôlée, un libellé FR/EN et un état `Visible` ; la même source
  alimente l’en-tête et le pied de page publics ;
- le champ `logo` des partenaires documente maintenant le parcours de choix ou
  d’ajout d’un média, avec textes alternatifs FR/EN ;
- les chiffres clés disposent d’une valeur obligatoire positive et de champs
  localisés pour le suffixe et l’intitulé ;
- le bandeau « Ils nous font confiance » et le bloc « Chiffres clés » sont
  centrés, tandis que les cartes et l’image de présentation restent contenues
  sur les largeurs étroites ;
- le pied de page utilise désormais une colonne `Découvrir / Explore` distincte
  de la colonne des coordonnées, afin d’éviter un titre dupliqué ;
- typecheck CMS/frontend, lint CMS/frontend et `git diff --check` passent ; le
  readiness repasse à 200 après la compilation à froid du frontend.

### Corrections ciblées administration - 2 septembre 2026

- le dashboard Payload affiche maintenant des indicateurs calculés depuis la
  base (publications, brouillons et erreurs de revalidation réservées à
  l’administrateur), les cinq dernières publications et des raccourcis vers la
  page d’accueil, la navigation, la médiathèque, les produits et les aperçus
  FR/EN ;
- les champs upload des projets, membres d’équipe, témoignages, page d’accueil,
  page À propos, message du PDG et réglages généraux expliquent le parcours
  « choisir un média existant / ajouter un média », avec texte alternatif dans
  les deux langues quand le visuel est public ;
- les listes administratives affichent désormais le champ visuel des
  partenaires, témoignages, produits, réalisations, expertises et formations,
  afin de repérer immédiatement les fiches sans visuel ;
- les objectifs pédagogiques sont localisés, limités à huit entrées, validés
  comme textes d’au moins trois caractères et accompagnés d’exemples FR/EN ;
- un runner Playwright + axe-core couvre les gabarits publics FR/EN aux
  largeurs 320, 390, 768 et 1440 px ; il vérifie `lang`, le titre principal,
  les textes alternatifs, le débordement horizontal et les violations axe,
  puis produit une capture desktop dans les artefacts CI ;
- les Server Actions Payload derrière Nginx conservent désormais le port dans
  `Host` et `X-Forwarded-Host`, ce qui corrige le rejet d’origine observé lors
  de l’ouverture de la fenêtre d’ajout de média ; la même correction est
  appliquée au profil Oracle.
- un partenaire peut rester publiable avec son nom seul : le logo et l’URL
  externe sont facultatifs, et le composant public n’affiche l’image que si
  elle existe ;
- la grille des chiffres clés est maintenant adaptative et centrée : elle
  utilise trois colonnes pour trois indicateurs, quatre pour quatre, puis une
  colonne sur mobile, avec les repères visuels centrés sur chaque chiffre.
- la suite CMS a été rejouée après ces changements : **79 tests passent dans
  7 fichiers**, dont les invariants objectifs/visuels de Formation et de
  l’ensemble des collections ; typecheck,
  lint et `git diff --check` passent également.
- la section « Ils nous font confiance » agrandit les logos et n’affiche plus
  le nom lorsqu’un logo valide est disponible ; en l’absence de logo, le nom
  reste le seul contenu visible. Les liens avec image disposent toujours d’un
  libellé accessible.
- l’accueil demande maintenant jusqu’à cinq témoignages publiés et utilise
  un carrousel centré, avec hauteur équilibrée, guillemet décoratif et
  signature alignée en bas de chaque carte. Le jeu local actuel contient bien
  quatre fiches publiées ; trois sont explicitement marquées comme contenu de
  démonstration et doivent être remplacées par des témoignages validés avant
  la mise en production. Aucun avis client n’a été inventé dans le code.
- le contrôle visuel FR/EN confirme l’absence de débordement horizontal, la
  présence du bandeau de confiance et le chargement du carrousel.

### Vérification complémentaire interface - 3 septembre 2026

- le contrôle navigateur confirme les quatre diapositives actuellement
  disponibles dans le carrousel « Ce que disent nos clients », un logo partenaire rendu sans libellé texte
  et le bouton « Laisser un témoignage » dans le pied de page ; aucune largeur
  horizontale ne déborde à la largeur desktop contrôlée ;
- les logos partenaires utilisent maintenant une pastille plus grande
  (`clamp(150px, 15vw, 220px)`) et restent contenus avec `object-fit: contain` ;
- la page de connexion admin affiche la marque et le formulaire dans une
  colonne centrée de largeur bornée, avec champs et bouton pleine largeur ;
- le typecheck et le lint du frontend passent dans le conteneur `web`, ainsi
  que `git diff --check` ; la suite CMS ciblée a démarré mais reste bloquée
  après l’initialisation de Vitest sans produire de résultat, puis a été
  interrompue proprement. Ce blocage d’environnement est conservé comme
  point à traiter avant une validation CI finale.

### Parcours de dépôt et modération des témoignages - 4 septembre 2026

- le bouton du pied de page ouvre le mode `?sujet=temoignage`, avec un
  formulaire séparé du contact commercial : nom, fonction, entreprise,
  témoignage et consentement uniquement ;
- la route serveur valide la locale, les longueurs, le consentement, le
  honeypot et la limitation de débit, puis crée un document `draft` dans
  Payload avec une date de consentement ; le navigateur ne possède jamais le
  secret de création ;
- la collection `Témoignages` accepte cette création interne contrôlée, mais
  la lecture publique reste limitée à `editorialStatus = published`. Les
  rôles autorisés peuvent laisser en brouillon, soumettre à validation,
  publier ou archiver avec motif ;
- jusqu’à cinq témoignages publiés sont rendus dans un carrousel accessible : un
  seul commentaire visible à la fois, changement automatique toutes les 25
  secondes, pause au survol ou au focus, flèches et indicateurs utilisables au
  clavier, et respect de `prefers-reduced-motion` ;
- le rendu HTTP confirme `200` pour le formulaire FR et le formulaire EN,
  l’absence des champs Contact dans ce mode, ainsi que `422` pour une
  soumission incomplète. Le carrousel expose les quatre diapositives présentes,
  deux flèches et quatre indicateurs ; sa requête publique est plafonnée à cinq.
- une soumission complète de contrôle a retourné `201` et a créé un brouillon
  dans Payload ; la fiche temporaire a ensuite été supprimée avec contrôle de
  son identifiant et de son nom. La base conserve quatre témoignages publiés.

### Vérification du correctif - 4 septembre 2026

- le témoignage récemment déposé est bien conservé en `draft` tant que sa
  traduction anglaise n’est pas remplie : la base contient cinq fiches, dont
  quatre publiées et une brouillon. Ce comportement est volontaire et protège
  la règle bilingue ; la fiche ne peut apparaître sur le site qu’après
  complétion FR/EN et passage effectif à `published` ;
- après redémarrage propre du service `web`, la vitrine publique répond `200`,
  rend quatre diapositives publiées et n’expose pas la fiche brouillon. La
  requête de la page est plafonnée à cinq et triée par `-publishedAt` : les
  nouveaux avis prennent donc la place des plus anciens dans la vitrine, sans
  suppression de l’historique CMS ;
- le logo partenaire est maintenant rendu avec `object-fit: contain` via une
  propriété explicite de `CmsImage`, et non une règle CSS écrasée par le style
  inline. Contrôle navigateur : cadre `192 x 192`, image centrée `contain`,
  aucun recadrage ;
- contrôle navigateur complémentaire : un seul slide actif, quatre boutons
  indicateurs, deux flèches, et aucun avertissement `warn`/`error` console ;
- intégrité PostgreSQL contrôlée : les collections `testimonials` (5/5),
  `partners` (5/5), `pages` (8/8), `products` (4/4), `formations` (3/3) et
  `events` (3/3) ont autant d’identifiants distincts que de lignes. Le
  warning React de clé dupliquée n’est donc pas reproduit après purge du
  service web ;
- typecheck web, lint web et typecheck CMS passent dans les conteneurs. Le
  scénario Playwright de plafond à cinq témoignages est ajouté dans
  `apps/web/tests/visual-a11y.spec.ts` ; l’exécution complète axe/Playwright
  reste une recette CI à lancer avec le navigateur de test installé.

### Limite et administration finale - 4 septembre 2026

- la limite publique est désormais de cinq témoignages ; lors de la publication
  d’un sixième, le plus ancien est automatiquement repassé en brouillon, sans
  supprimer son historique. L’administrateur peut aussi retirer manuellement
  un témoignage en repassant son état à `Brouillon` ;
- `Homepage.keyFigures` est une section d’administration dédiée : les valeurs,
  suffixes et intitulés sont localisés FR/EN et chaque chiffre peut être rendu
  visible ou masqué depuis le global `Page de garde` ;
- le proxy CMS `/api/logo?id=…` produit un PNG transparent pour les logos
  partenaires, avec cache public contrôlé. L’original de la médiathèque n’est
  jamais écrasé ;
- vérification réelle : le logo de test renvoie `200 image/png` et contient
  `53 321` pixels entièrement transparents sur `348 × 348` ; les types,
  l’ESLint ciblé, `git diff --check`, les routes publiques FR/EN et les
  marqueurs de traduction du HTML anglais passent.

### Vérification finale de l’audit - 4 septembre 2026

La passe finale a repris les points signalés dans les captures et les
exigences cumulées du projet :

| Test | Résultat | Preuve | Sévérité | Correction / statut |
|---|---|---|---|---|
| Avertissement React dans l’administration | CORRIGÉ | la liste des témoignages affichait une version d’audit avec `id = null` ; `_testimonials_v.id = 277`, `parent_id = NULL` et le libellé « Audit automatique du 4 septembre 2026 » | Élevée | suppression ciblée de cette seule trace de test orpheline ; la liste passe de 7 à 6 lignes valides et les nouveaux logs ne contiennent plus `same key` |
| Intégrité des versions témoignages | PASS | `SELECT COUNT(*) FROM _testimonials_v WHERE parent_id IS NULL` retourne `0` après nettoyage | Élevée | Validé |
| Suite CMS complète | PASS | **83 tests dans 9 fichiers**, scénarios publication, workflow, RBAC, bootstrap, seed, schéma, événements, logos et témoignages | Critique | Validé sur la base isolée `africa_ingenierie_test` |
| TypeScript frontend | PASS | `@africa-ingenierie/web typecheck` retourne 0 | Élevée | Validé |
| TypeScript CMS | PASS | `@africa-ingenierie/cms typecheck` retourne 0 | Élevée | Validé |
| API événements | PASS | OpenAPI 200 ; liste FR/EN 200 ; locale invalide 400 ; limite invalide 400 ; slug inconnu 404 ; détail 200 ; calendrier 200 `text/calendar` | Critique | Validé |
| Services locaux | PASS | CMS, web, Nginx, PostgreSQL, MinIO et Mailpit `healthy` | Critique | Validé |
| Routes publiques FR/EN | PASS | `scripts/check-routes.mjs` : 30/30 réponses attendues | Critique | Validé |
| Playwright + axe-core | NON EXÉCUTÉ | le binaire Playwright n’est pas disponible dans l’environnement hôte et `pnpm exec` est bloqué par `EPERM` ; les contrôles navigateur CUA ont été réalisés manuellement | Élevée | À exécuter en CI ou après installation des navigateurs Playwright |
| Lighthouse mobile | NON EXÉCUTÉ | aucun runner Lighthouse disponible dans l’environnement de cette passe | Élevée | À exécuter sur le build de production avec seuils Performance/Accessibility ≥ 90 |

Le nettoyage de données a été limité à l’unique version d’audit orpheline
identifiée par son identifiant, son absence de parent et son libellé de test.
Les contenus éditoriaux réels, les versions rattachées, PostgreSQL et MinIO
source n’ont pas été supprimés. Les avertissements de dépréciation `pg` et les
warnings attendus de doublon de redirection dans la suite de tests ne sont pas
des échecs : ils proviennent volontairement des scénarios d’idempotence et ne
modifient pas le résultat des 83 tests passés.

### Recommandations implémentées après l’audit

- le contrôle HTTP automatisé est centralisé dans `scripts/check-http.mjs` :
  contrat OpenAPI événements, projection descriptive sans champs commerciaux,
  locales FR/EN, pagination bornée, erreurs 400/404, cache, ICS, SEO,
  redirections 301 et en-têtes de sécurité sont vérifiés à chaque recette ;
- le contrôle de seuil Lighthouse est fourni par
  `scripts/assert-lighthouse.mjs`. La CI construit désormais l’image web
  de production, la démarre dans le réseau du CMS, puis refuse la livraison
  si Performance ou Accessibility est inférieur à 90 sur mobile ;
- la CI vérifie également le lint, le typage, le build, les contrats HTTP,
  Playwright/axe-core, l’audit des dépendances, les secrets et les
  configurations Docker avec Trivy, ainsi que les images web, CMS et Nginx ;
- `scripts/ci-check.sh` exécute aussi les contrôles HTTP lorsque la recette
  E2E est activée.

Les 83 tests CMS et le contrôle HTTP ont été exécutés localement avec succès.
Playwright/axe-core, Lighthouse, `pnpm audit` et Trivy nécessitent les
binaires ou l’environnement CI correspondant ; ils sont maintenant des
contrôles bloquants dans la pipeline et ne sont pas déclarés « passés » pour
la présente machine locale tant qu’ils n’y ont pas été exécutés.

### Validation complémentaire - 4 septembre 2026

La construction réelle de `infra/docker/web.Dockerfile` a d’abord révélé une
erreur de typage dans la configuration Playwright : `reducedMotion` n’est pas
une option `use` reconnue par la version installée. La configuration a été
corrigée avec `page.emulateMedia({ reducedMotion: 'reduce' })` dans le test.

Après correction :

| Contrôle | Résultat | Preuve |
|---|---|---|
| Image web de production | PASS | `docker build ... infra/docker/web.Dockerfile` terminé avec succès ; Next.js a compilé les routes et généré l’image standalone |
| Démarrage de l’image web | PASS | conteneur temporaire sur le réseau CMS : `/healthz = 200`, `/fr = 200`, réponse de 117 498 octets |
| Contrat HTTP via Nginx | PASS | `node scripts/check-http.mjs` sur `http://127.0.0.1:8080` : API, SEO, traductions, redirections et en-têtes passent |
| Contrat HTTP direct sur l’image | PARTIEL INTENTIONNEL | l’image applicative ne porte pas les en-têtes Edge ; ceux-ci sont fournis par Nginx et sont contrôlés via le port public 8080 |

Le conteneur temporaire de validation a été supprimé après le test. Aucun
conteneur, volume PostgreSQL ou objet MinIO de travail n’a été supprimé.

### Correctifs finaux vérifiés - 4 septembre 2026

- le traitement des logos partenaires détecte maintenant la couleur réelle du
  fond à partir des pixels de coin. Les fonds noirs, blancs et presque blancs
  deviennent transparents avec un contour anti-crénelé ; le média original
  reste inchangé et le logo est rendu en `contain` dans le cadre circulaire ;
- le plafond des témoignages tient compte du document tout juste publié, même
  lorsqu’il n’est pas encore visible dans la lecture transactionnelle
  PostgreSQL. Le sixième témoignage est donc bien rétrogradé en brouillon,
  tandis que le bouton précédent/suivant du carrousel continue de parcourir
  uniquement les témoignages publiés ;
- l’ordre des hooks CMS a été sécurisé : la limitation métier s’exécute avant
  la revalidation du site public, afin que le cache soit invalidé sur l’état
  final et non sur l’état intermédiaire ;
- la section `Chiffres clés` reste pilotée par le global `Page de garde` :
  valeurs, suffixes, libellés FR/EN et visibilité sont modifiables depuis
  l’administration.

| Contrôle final | Résultat | Preuve |
|---|---|---|
| Publication et plafond des témoignages | PASS | test d’intégration dédié : 6 publications, 5 visibles, le plus ancien repassé en brouillon |
| Suite CMS complète | PASS | 9 fichiers, **84 tests réussis** sur `africa_ingenierie_test` |
| Typecheck workspace | PASS | UI, validation, CMS et web retournent tous un code 0 |
| Contrôles HTTP publics | PASS | `node scripts/check-http.mjs` : API, SEO, traduction, redirections et sécurité passent via Nginx `:8080` |
| Logos à fond uni | PASS | tests Sharp noir/blanc : fond transparent, logo conservé, sans modification de l’original |

### Contact, export et carte - 4 septembre 2026

- le formulaire public contient maintenant un numéro de téléphone facultatif,
  typé `tel`, avec autocomplétion mobile et validation de longueur côté serveur ;
- le message conserve le téléphone dans la boîte `Messages reçus`, où il est
  visible dans les colonnes de liste et exportable avec le nom, l’e-mail,
  l’entreprise, le besoin, le message, l’état, le consentement et les dates de
  conservation. Les empreintes IP et navigateur ne sont jamais exportées ;
- l’administration dispose d’une barre « Suivi et export » avec filtres par
  état et période. L’endpoint `/api/contact-messages/export` vérifie le rôle
  Administrateur/Publicateur, utilise une réponse `no-store`, échappe chaque
  cellule CSV et parcourt les pages jusqu’à 10 000 messages ;
- les réglages généraux disposent de `Latitude de la carte`, `Longitude de la
  carte` et `Niveau de zoom`. Une fois ces trois informations renseignées, une
  carte OpenStreetMap lazy-loadée est affichée dans Contact en grand format et
  dans le pied de page en format compact. Sans coordonnées valides, aucun cadre
  vide n’est rendu ;
- la CSP locale et Oracle autorise uniquement l’iframe
  `https://www.openstreetmap.org`, tout en conservant les restrictions de
  scripts, d’images et de formulaires existantes.

| Contrôle | Résultat | Preuve |
|---|---|---|
| Migration téléphone/carte | PASS | `20260904_170000_contact_phone_map` appliquée et types Payload régénérés |
| Accès export anonyme | PASS | requête sans session : `403` JSON, aucune donnée retournée |
| Schéma contact/carte | PASS | 13 tests de schéma, champ téléphone et endpoint `/export` présents |
| Régression CMS finale | PASS | 9 fichiers, **84 tests réussis** |
| Typecheck et lint | PASS | workspace complet sans erreur |
| Contrôle HTTP | PASS | API, SEO, traductions, sécurité et redirections via Nginx validés |

### Réseaux sociaux publics - 5 septembre 2026

- WhatsApp, Facebook et LinkedIn sont contrôlés depuis `Réglages généraux`.
  WhatsApp est saisi comme numéro d’entreprise ; Facebook et LinkedIn comme
  URLs `https://` directes dans la liste des réseaux sociaux.
- Les trois icônes apparaissent dans le pied de page de toutes les pages
  publiques dès qu’une valeur valide est configurée. WhatsApp utilise
  `https://wa.me/<numéro>` et ouvre directement une conversation ; les liens
  sociaux externes s’ouvrent dans un nouvel onglet avec `noopener noreferrer`.
- Les espaces, parenthèses, tirets et signe `+` du numéro WhatsApp sont
  normalisés avant génération du lien. Les valeurs invalides et les URLs
  absentes restent masquées afin de ne jamais afficher de lien mort.
- Les réseaux configurés en doublon sont dédupliqués côté rendu ; cela évite
  également les avertissements React de clés répétées dans la barre sociale.

| Contrôle | Résultat | Preuve |
|---|---|---|
| Réglages CMS WhatsApp/Facebook/LinkedIn | PASS | champs WhatsApp validé, tableau social administrable et options LinkedIn/Facebook présents |
| Rendu public des icônes | PASS | `socialLinks()` injecte WhatsApp depuis le numéro et conserve les URLs CMS Facebook/LinkedIn |
| Sécurité des liens | PASS | URLs sociales validées en `https://`, ouverture externe protégée par `noopener noreferrer` |
| Régression schéma | PASS | 13 tests ciblés réussis, dont les champs sociaux et cartographiques |
| Contrôle HTTP public | PASS | `node scripts/check-http.mjs` : API, SEO, traduction, sécurité et redirections validés |

### Résultat du build CMS - 4 septembre 2026

La compilation applicative et le typecheck passent. Le build Next de
l’administration échoue toutefois pendant le pré-rendu interne de
`/_global-error` avec `Cannot read properties of null (reading 'useContext')`
dans `LayoutRouterContext`. Le même échec a été reproduit avec Turbopack et
Webpack ; il ne provient ni du formulaire Contact, ni de l’export, ni des
migrations. Le shell Payload a été rendu dynamique et un fallback global
indépendant a été ajouté, mais Next 16.3.3 continue d’évaluer son boundary
interne hors contexte. Ce point reste **BLOQUANT pour le build CMS**, tandis
que le serveur local et les 84 tests fonctionnels restent opérationnels.

| Contrôle | Résultat | Preuve |
|---|---|---|
| Compilation et TypeScript CMS | PASS | `next build` atteint la génération statique après compilation et typecheck sans erreur |
| Build Next Turbopack | BLOQUÉ | échec reproductible sur `/_global-error`, `LayoutRouterContext` nul |
| Build Next Webpack | BLOQUÉ | même échec reproductible avec `next build --webpack` |

Le build du site public compile également le code et le TypeScript, puis
rencontre le même défaut interne Next.js 16.3.3 pendant le pré-rendu de
`/_global-error` (`LayoutRouterContext` nul). Le serveur de développement et
les contrôles HTTP restent opérationnels ; ce défaut est conservé comme point
bloquant de compatibilité framework dans l’audit.
