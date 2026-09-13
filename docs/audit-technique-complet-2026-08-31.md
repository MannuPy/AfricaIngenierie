# Audit technique complet de la plateforme Africa Ingénierie

Date : 31 août 2026
Périmètre : C:\Projet\Projets- ING
Méthode : inspection du code, contrôles statiques, smoke tests isolés et tentative de vérification HTTP locale.

## Mise à jour finale — audit UX/UI, bilinguisme et navigation

Cette mise à jour remplace le constat environnemental initial ci-dessous pour
les contrôles exécutés le 31 août 2026, après démarrage de la pile Docker et
recompilation du service web :

| Contrôle | Résultat | Preuve |
|---|---|---|
| TypeScript web, CMS et UI | PASS | trois commandes `tsc --noEmit` terminées avec le code 0 |
| ESLint | PASS | `node_modules/.bin/eslint.cmd .` ; seul l’avertissement Next sur le dossier `pages` reste informatif |
| Tests CMS Payload | PASS | 7 fichiers, 76 tests réussis |
| Routes publiques | PASS | 30/30 adresses, dont les routes FR/EN et les 404 attendues |
| Traduction EN des pages principales | PASS | accueil, À propos, expertises, formations/événements, événements, réalisations, produits et contact contrôlés sans résidu d’interface FR |
| État actif du menu | PASS | un seul `aria-current="page"` par route ; la rubrique parent reste active uniquement sur son chemin ou ses détails |
| Débordement horizontal | PASS | `scrollWidth` ne dépasse pas la fenêtre à 1280 px ; bloc À propos mesuré sans recouvrement image/texte |
| Médias et alt EN | PASS | cartes expertises, formations, événements, réalisations, produits et page À propos : images chargées et alt non vides |

Les résultats et blocages décrits dans les sections historiques de ce document
correspondent à la première passe, avant le démarrage de Docker. Ils doivent
être lus comme une liste de risques à surveiller, et non comme l’état actuel
des contrôles ci-dessus. Lighthouse et axe-core avec un runner dédié restent à
automatiser dans une prochaine passe.

### Mise à jour du 1er septembre 2026 — chiffres clés et responsive

Les contrôles complémentaires ont confirmé les points suivants :

| Contrôle | Résultat | Preuve |
|---|---|---|
| Section « Chiffres clés » | PASS | `Homepage.keyFigures`, titre et ordre des blocs sont gérés dans Payload ; les valeurs nulles ou égales à zéro sont masquées |
| Traduction EN du catalogue | PASS | accueil, catalogue et détail Produit contrôlés ; aucun résidu français dans l’en-tête, le contenu ou le pied de page |
| Responsive public | PASS | aucun débordement horizontal à 320, 390, 768 et 1440 px |
| Responsive administration | AMÉLIORÉ | règles mobiles ajoutées pour les formulaires, listes à colonnes, tableaux, en-tête et écran de connexion dans `payload-admin.css` |
| Journalisation | PASS statique | `auditAfterChange` et `auditAfterDelete` couvrent les collections publiables et suppriment les champs sensibles avant écriture |
| Requêtes CMS de l’accueil | CORRIGÉ | le filtre générique invalide `where[title][exists]` a été supprimé pour les collections sans champ `title` ; partenaires, témoignages et produits répondent à nouveau en 200 |
| Style des chiffres clés | CORRIGÉ | bloc clair à quatre indicateurs, repères lime, suffixes et libellés responsives selon la référence fournie |

Le dashboard `admin.localhost` n’a pas pu être ouvert pendant cette passe, car le
nom d’hôte n’était pas résolu par l’environnement d’exécution. La vérification
visuelle de l’administration doit être rejouée sur la machine locale après
l’ajout de `127.0.0.1 admin.localhost` dans le fichier hosts.

## 1. Verdict exécutif

Le projet possède un socle sérieux : monorepo séparant le site public Next.js, le CMS Payload, la validation partagée, PostgreSQL, MinIO et Nginx. TypeScript, ESLint, la syntaxe Compose et le smoke test isolé de l’API événements passent.

Le projet ne peut toutefois pas être déclaré fonctionnel ou prêt pour recette : Docker n’était pas démarré pendant l’audit. Les routes HTTP, le dashboard, PostgreSQL, MinIO, le flux de publication et la suite Payload n’ont donc pas été validés de bout en bout.

Défauts indépendants de Docker confirmés :

1. README.md contient des marqueurs de conflit Git ;
2. la tâche d’anonymisation liée à retentionUntil n’est pas implémentée ;
3. le contrat OpenAPI ne décrit pas sa propre route /api/openapi.json ;
4. la sortie de prévisualisation draft n’existe pas ;
5. le déploiement Render ne reprend pas automatiquement les headers de sécurité ni le rate limit Nginx ;
6. plusieurs domaines de production sont encore codés en dur ;
7. le build et les tests directs sont sensibles à la disponibilité du CMS et à l’environnement.

Conclusion : pas de go pour la recette client tant que les points P0/P1 ne sont pas traités et que la pile locale n’a pas été redémarrée puis testée.

## 2. Résultats des tests

| Test | Résultat | Preuve | Sévérité | Statut |
|---|---|---|---|---|
| TypeScript workspace | PASS | pnpm typecheck sans erreur | Élevée | Validé |
| ESLint workspace | PASS | pnpm lint sans erreur | Élevée | Validé |
| Compose local | PASS | docker compose ... config --quiet retourne 0 | Élevée | Validé |
| Cohérence dépôt | FAIL | git diff --check signale README.md | Élevée | À corriger |
| Smoke API événements | PASS | validation locale, projection publiée et ICS | Élevée | Partiel |
| Suite CMS Payload | BLOQUÉ | DATABASE_URL absent puis ENOTFOUND postgres | Critique | À relancer |
| Tests déclarés | NON CONCLUANT | 77 appels it() recensés, PostgreSQL requis indisponible | Critique | À relancer |
| Routes publiques | FAIL environnemental | routes:check : 30/30 injoignables | Critique | À relancer |
| Navigateur local | FAIL environnemental | localhost:8080 : ERR_CONNECTION_REFUSED | Critique | À relancer |
| Build web production | NON CONCLUANT | EPERM sur apps/web/.next/trace | Élevée | À isoler |
| pnpm audit | NON EXÉCUTÉ | EPERM du wrapper pnpm | Moyenne | À exécuter |
| axe-core/Lighthouse | NON EXÉCUTÉS | aucun runner intégré | Élevée | À ajouter |
| ZAP/Trivy | NON EXÉCUTÉS | aucune exécution durant l’audit | Élevée | À ajouter |
| SMTP réel/restauration | NON EXÉCUTÉS | Docker indisponible | Critique | À tester |

Les 77 tests déclarés sont répartis ainsi : auth 11, bootstrap 3, events-contract 6, publication-flow 4, RBAC 23, schema 9, seed 9, workflow 12. Ce comptage ne signifie pas que les 77 tests passent.

## 3. Anomalies critiques et élevées

### A-01 — Pile locale non démarrée

Preuve : Docker renvoie une erreur de connexion au moteur dockerDesktopLinuxEngine ; le navigateur reçoit ERR_CONNECTION_REFUSED sur localhost:8080 ; le script de routes ne peut vérifier aucune page.

Impact : impossible de conclure sur le rendu public, le dashboard, les cookies, les API, les médias, la publication, le rate limit et les healthchecks.

Correction : démarrer Docker Desktop, attendre le moteur Linux, puis exécuter :

    cd C:\Projet\Projets- ING
    docker compose --env-file .env.local up -d
    docker compose --env-file .env.local ps
    pnpm routes:check
    pnpm test
    pnpm test:e2e

### A-02 — Marqueurs de conflit dans README.md

Preuve : git diff --check et rg '^<<<<<<<|^=======|^>>>>>>>' signalent README.md:1, README.md:4 et README.md:465.

Impact : documentation invalide et risque de livrer une fusion incomplète.

Correction : garder le README actuel, supprimer les trois marqueurs, puis relancer git diff --check.

### A-03 — Conservation des messages non automatisée

Preuve : ContactMessages.ts calcule retentionUntil, mais aucun script retention-cleanup, cron d’anonymisation ou job équivalent n’a été trouvé.

Impact : les données personnelles peuvent rester après la durée annoncée.

Correction : créer une tâche idempotente qui anonymise les messages expirés, conserve la preuve minimale, journalise sans recopier les données supprimées et s’exécute par cron Render ou cron VPS. Ajouter tests d’expiration et de reprise.

### A-04 — Headers de sécurité absents sur le chemin Render

Preuve : CSP, HSTS, nosniff, SAMEORIGIN, COOP et Permissions-Policy sont définis dans Nginx Oracle/local. Le Blueprint Render utilise deux services web natifs et ne déploie pas Nginx. Les next.config ne déclarent pas ces headers.

Impact : Render peut servir l’application sans les protections attendues.

Correction : appliquer les headers dans Next.js ou dans la couche proxy réellement utilisée par Render, puis tester les deux hôtes.

### A-05 — Rate limit contact non distribué sur Render

Preuve : api/contact/route.ts conserve les compteurs dans une Map mémoire. Le rate limit Nginx ne s’applique pas au Blueprint Render.

Impact : plusieurs instances ou redémarrages peuvent contourner la limite.

Correction : utiliser Redis/Upstash ou un WAF/proxy distribué ; conserver la limite applicative comme seconde barrière et ajouter un test multi-instance.

### A-06 — Domaine de production codé en dur

Preuve : occurrences dans oracle-security-headers.conf, events-api.ts, .env.oracle.example, .env.render.example, openapi-evenements.yaml et les seeds.

Impact : images CSP, liens ICS, canoniques, e-mails et documentation peuvent pointer vers un domaine obsolète.

Correction : paramétrer toutes les origines ; dériver l’UID ICS du hostname configuré ; remplacer les placeholders seulement après confirmation du domaine.

### A-07 — Contrat OpenAPI incomplet

Preuve : openapi-events.ts contient trois paths, alors que la route /api/openapi.json existe et que le test parle de quatre opérations.

Impact : la route de découverte du contrat n’est pas décrite dans le contrat vivant.

Correction : ajouter explicitement la route au contrat ou la déclarer hors périmètre ; ajouter un test HTTP de /api/openapi.json.

### A-08 — Sortie de prévisualisation absente

Preuve : apps/web/src/app/api/preview/route.ts existe, mais apps/web/src/app/api/preview/exit/route.ts est absent.

Impact : pas de sortie explicite du mode draft ; cookie et mode Next restent actifs jusqu’à expiration.

Correction : ajouter la sortie qui désactive draftMode, expire ai-preview-token, redirige vers une route locale sûre et tester token expiré/anonyme/sortie effective.

### A-09 — Build dépendant de la disponibilité du CMS

Preuve : les pages interrogent le CMS pendant la génération ; des builds précédents ont produit ENOTFOUND cms et des messages CMS indisponible ; la tentative locale s’est arrêtée sur EPERM lors de l’écriture de .next/trace.

Impact : un déploiement peut construire des pages vides ou des états de repli si le CMS est indisponible.

Correction : décider quelles pages sont dynamiques, garantir qu’une version vide ne soit pas publiée silencieusement, puis ajouter des tests build CMS disponible/indisponible.

### A-10 — Tests directs mal alignés avec l’environnement

Preuve : tests/setup.ts charge apps/cms/.env, absent du dépôt audité. La commande directe échoue sur DATABASE_URL absent ; avec l’environnement racine, la connexion échoue sur ENOTFOUND postgres.

Impact : parcours développeur confus et diagnostic ambigu.

Correction : documenter une commande canonique, charger explicitement .env.local seulement en local ou exiger DATABASE_URL_TEST, et afficher l’action manquante.

## 4. Risques moyens

### B-01 — Accessibilité, responsive et performance non automatisés

Aucun runner axe-core, Lighthouse, snapshots visuels ou test aux largeurs 320, 390, 768 et 1440 px n’est intégré. Les rapports historiques ne constituent pas une preuve reproductible.

Ajouter Playwright, axe-core et Lighthouse CI avec seuils sur accueil, catalogue produit, détail, événements, contact et login admin.

### B-02 — Images natives non mesurées

CmsImage utilise img natif et les variantes Payload. Ce choix doit être mesuré : LCP, CLS, poids réseau, erreur média, alt FR/EN et absence de média. Ajouter aussi un scan antivirus d’upload avant production.

### B-03 — Données de démonstration présentes

Le code contient isDemo, demoKey, seeds et visuels de démonstration. Ajouter un contrôle go-live qui échoue si un document publié est isDemo=true ou si un média conserve une mention de démonstration.

### B-04 — CSP dépendante de la topologie

La CSP locale autorise des assouplissements de développement et la CSP Oracle contient une origine admin codée en dur. Séparer les profils et retirer unsafe-eval en production.

### B-05 — Blueprint Render non validé par la CI

La CI valide le Compose Oracle mais pas render.yaml. Ajouter une validation de schéma ou une vérification Render avant merge.

### B-06 — Cookie de domaine à revalider

AUTH_COOKIE_DOMAIN vise le hostname Render du CMS. Après ajout d’un domaine personnalisé, cette valeur, Secure, HttpOnly et SameSite doivent être retestés sous HTTPS.

### B-07 — Observabilité revalidation incomplète

Les erreurs sont journalisées, mais il manque une corrélation uniforme, une alerte opérationnelle et une vue de suivi des livraisons échouées.

## 5. Vérification par domaine

Design/UX : l’architecture de composants et les pages FR/EN sont présentes, mais le rendu réel, le clavier, le focus, le contraste, les erreurs et les débordements mobiles restent non prouvés.

Architecture : la séparation web/CMS/validation est saine. Les risques principaux sont les appels CMS au build, les constantes d’environnement évaluées au chargement et le rate limit sans couche partagée Render.

Base de données : migrations, versions, audit et index déclaratifs sont présents, mais PostgreSQL n’a pas été interrogé. À vérifier : migrations, EXPLAIN des listes, unicité des slugs, relations média/auteurs, données demo et restauration isolée.

Sécurité : points positifs statiques : secrets hors Git, bootstrap production refusé, RBAC serveur, verrouillage Payload, SVG refusé, taille upload limitée, audit append-only et webhook HMAC. Lacunes : headers Render, rate limit mémoire, CSP dépendante du domaine, scans CVE/ZAP/Trivy non exécutés.

Performance : cache ISR/fetch et variantes médias sont présents. Aucun score Lighthouse ni mesure RUM n’a été obtenu.

Qualité/livraison : typecheck, lint et Compose config passent ; README est invalide ; CI ne couvre pas axe, Lighthouse, ZAP, Trivy ou Blueprint Render.

## 6. Cas d’erreur à couvrir

| Zone | Cas | Attendu |
|---|---|---|
| Routes | locale inconnue, slug invalide | redirection ou 400 documenté, jamais 500 |
| API événements | brouillon, traduction absente, date invalide | 404/400 cohérent, aucun champ commercial |
| API événements | CMS indisponible | 503 contrôlé, cache précédent conservé |
| ICS | virgule, point-virgule, accents, retour ligne | échappement et pliage conformes |
| Publication | EN absente | publication refusée |
| Publication | webhook échoue | ancienne version visible, audit de l’échec |
| Preview | anonyme, rôle invalide, token expiré | 401, aucun draft exposé |
| RBAC | éditeur publie, publicateur supprime, compte suspendu | refus serveur |
| Auth | échecs répétés, compte inactif, mot de passe provisoire | verrouillage/refus/changement |
| Contact | JSON invalide, champ long, honeypot, multi-instance | 400/422/201 neutre/429 distribué |
| Upload | SVG, MIME falsifié, >20 MiB, alt absent | refus contrôlé |
| SEO | titre vide, canonical erronique, domaine changé | contrôle bloquant |
| Données | migration/dump/objet média manquant | arrêt contrôlé et alerte |

## 7. Priorités de correction

### P0

1. démarrer Docker et obtenir healthy pour les six services ;
2. nettoyer le conflit README ;
3. exécuter migrations, tests CMS et E2E publication Produit ;
4. vérifier qu’aucun contenu demo n’est publié ;
5. restaurer PostgreSQL et MinIO dans des cibles isolées ;
6. corriger headers et rate limit pour Render ;
7. confirmer le domaine et supprimer les origines codées en dur.

### P1

1. implémenter retention-cleanup ;
2. ajouter preview/exit ;
3. compléter et tester OpenAPI ;
4. stabiliser le build CMS disponible/indisponible ;
5. ajouter Playwright/axe/Lighthouse ;
6. tester cookies, CSP, uploads, SMTP et RBAC via HTTP ;
7. valider render.yaml et le bootstrap sécurisé du premier compte réel.

### P2

1. métriques et request-id ;
2. optimisation LCP/CLS/INP ;
3. scans CVE/ZAP/Trivy récurrents ;
4. snapshots visuels ;
5. procédure incident et rollback.

## 8. Commandes de reprise

    cd C:\Projet\Projets- ING
    docker compose --env-file .env.local up -d
    docker compose --env-file .env.local ps
    pnpm typecheck
    pnpm lint
    pnpm test
    pnpm test:e2e
    pnpm routes:check
    pnpm verify

Ensuite vérifier : accueil FR/EN, catalogue et détail Produit, événements et ICS, API 400/404/503/OpenAPI, login et trois rôles admin, publication Produit complète, échec de revalidation, contact/Mailpit, médias/alt/MinIO, largeurs responsive et Lighthouse mobile.

## 9. Conclusion

Le code est suffisamment structuré pour poursuivre le développement, mais les résultats historiques annonçant des tests HTTP, E2E, restauration, Lighthouse ou accessibilité PASS doivent être considérés comme non reproductibles jusqu’à leur réexécution avec preuves archivées.

Prochain jalon : pile Docker saine, tests Payload réellement exécutés, corrections P0/P1, puis seconde passe d’audit automatisée.
