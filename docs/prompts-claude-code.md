# Pack de prompts Claude Code - développement local

## État d'avancement au 28/08/2026

Les prompts 01 à 07 ont produit le socle local, le modèle Payload, les pages
publiques, le bilinguisme, la publication Produit, la prévisualisation sécurisée
et la revalidation. Les compléments associés au contact, à la conservation et à
l'API événements ont également été intégrés. Ce document sert désormais de
journal de réalisation et de référence pour les contrôles de recette restants.

## Mode d’emploi

Donner d’abord le prompt permanent, puis exécuter les prompts dans l’ordre. Claude Code doit travailler dans le dossier racine du projet, lire les documents avant de modifier les fichiers et s’arrêter après chaque étape pour produire un rapport court.

Documents à fournir à Claude Code :

```text
Cahier_des_charges Africa_Ingenierie.docx
standalone.html
docs/README.md
docs/architecture-et-uml.md
docs/mcd-mld.md
docs/mpd-postgresql.sql
docs/openapi-evenements.yaml
docs/regles-de-gestion.md
docs/politique-conservation-donnees.md
docs/urls-et-redirections.md
docs/comptes-dev-local.md
docs/environnement-local-docker.md
docs/plan-recette-securite.md
docs/matrice-tracabilite.md
docs/audit-coherence-documents.md
```

## Prompt permanent  -  contexte et règles de travail

```text
Tu es l’architecte logiciel et l’ingénieur full-stack principal du projet Africa Ingénierie.

Objectif : transformer le prototype standalone.html en plateforme web locale complète, sécurisée, bilingue FR/EN, administrable sans intervention technique, puis préparer son déploiement Oracle Cloud Free Tier.

Sources d’autorité :
1. Le cahier des charges pour les exigences contractuelles.
2. Le dossier docs/ pour l’architecture, les données, les règles, la sécurité et la recette.
3. standalone.html comme référence visuelle et fonctionnelle validée.

Architecture obligatoire : Next.js pour le site public, Payload CMS pour le dashboard/API, PostgreSQL pour les données, MinIO pour les médias, Nginx comme reverse proxy et Docker Compose pour le local et la production.

Règles impératives :
- travaille d’abord en local ; aucun accès VPS et aucune action distante ;
- ne demande ni n’écris de secret réel dans les fichiers ; utilise .env.example et .env.local ignoré ;
- ne supprime pas standalone.html ; conserve-le comme référence et ajoute une copie de sauvegarde avant migration ;
- ne réinvente pas le design, les couleurs ou la typographie validés ;
- respecte le module Produits, le bilinguisme, le regroupement Formations & événements et l’absence d’Actualités ;
- aucune billetterie, aucun paiement et aucune commande dans le module Événements ;
- tous les contenus visibles doivent venir du CMS ou des réglages globaux, jamais de textes dupliqués en dur dans plusieurs composants ;
- ne publie jamais un contenu incomplet, non traduit ou sans alt text ;
- applique les rôles Administrateur, Publicateur et Éditeur ;
- chaque modification importante doit être testée, documentée et auditée ;
- privilégie une architecture simple, maintenable et adaptée à un VPS Oracle Cloud Free Tier ;
- après chaque étape, exécute les vérifications adaptées et signale tout blocage avant de continuer.

À chaque réponse, fournis : fichiers créés/modifiés, commandes exécutées, tests passés, problèmes restants et décision recommandée pour l’étape suivante.
``` 

## Prompt 00  -  audit initial en lecture seule

```text
Lis intégralement le cahier des charges, standalone.html et tous les fichiers docs/*.md, docs/*.sql et docs/*.yaml.

Ne modifie encore aucun fichier.

Produis :
1. l’inventaire du dépôt ;
2. la liste des routes et modules publics déjà présents dans standalone.html ;
3. la liste des modules Payload à créer ;
4. la matrice public visible → champ CMS → page admin ;
5. les contradictions éventuelles entre cahier, docs et prototype ;
6. les prérequis manquants ;
7. un plan d’exécution local en reprenant les prompts 01 à 11.

Vérifie spécialement : Products vs Produits, FR/EN, URLs, règles d’événements, rôles, conservation, SEO et médias.
Arrête-toi après le rapport d’audit.
```

## Prompt 01  -  initialisation du dépôt et Docker local

```text
Après validation de l’audit, initialise le monorepo local sans détruire le prototype.

Crée :
- apps/web pour Next.js ;
- apps/cms pour Payload ;
- packages/ui et packages/validation ;
- infra/nginx ;
- docker-compose.yml ;
- .env.example ;
- .gitignore ;
- README de démarrage.

Services Docker attendus : nginx, web, cms, postgres, minio et mailpit/mailhog.
Les réseaux frontend, backend et mail doivent être séparés. PostgreSQL et MinIO ne doivent pas être exposés publiquement.

Ajoute des healthchecks, des volumes persistants, des limites raisonnables de ressources et une configuration de développement claire.

Vérifie :
- docker compose config ;
- démarrage et arrêt des services ;
- healthchecks ;
- connexion PostgreSQL ;
- accès MinIO ;
- réception d’un e-mail de test dans Mailpit.

Ne commence pas encore les collections métier si le socle Docker n’est pas stable.
```

## Prompt 02  -  extraction du design system

```text
Analyse standalone.html et extrais le design system validé dans packages/ui.

Conserve exactement :
- palette de couleurs ;
- typographies ;
- hiérarchie des titres ;
- boutons ;
- cartes ;
- formulaires ;
- tableaux admin ;
- états vides et messages ;
- responsive desktop/tablette/mobile.

Crée des composants réutilisables : Header, Footer, Button, Card, Badge, Breadcrumbs, FormField, EmptyState, MediaPlaceholder, DataTable, AdminShell et Toast.

Ne crée pas de mode sombre. Ne réintroduis pas la section Actualités.

Ajoute une page Storybook ou une route interne de démonstration des composants si cela reste compatible avec le délai.

Vérifie visuellement les dimensions 320, 390, 768 et 1440 px et compare avec standalone.html.
```

## Prompt 03  -  modèle Payload/PostgreSQL

```text
Implémente le modèle de données décrit dans mcd-mld.md et mpd-postgresql.sql.

Crée les collections/globals :
SiteSettings, SocialLinks, NavigationItems, LegalDocuments, HomepageSections, Expertises, Projects, Realisations, Formations, FormationSessions, Events, Products, TeamMembers, Partners, Testimonials, MediaAssets, ContactMessages, Redirects, Revisions et AuditLogs.

Exigences :
- statuts draft/review/published/archived ;
- champs FR/EN explicites ;
- slugs uniques ;
- timestamps ;
- auteurs et derniers éditeurs ;
- métadonnées SEO par locale ;
- alt text obligatoire ;
- relations et suppressions conformes aux règles de gestion ;
- produits complets : référence, catégorie, disponibilité, délai, caractéristiques, média, CTA et SEO ;
- événements sans paiement, billet, prix, panier ou commande.

Utilise les migrations Payload. N’exécute pas le SQL de conception directement en production sans migration versionnée.

Vérifie les contraintes, index, relations et réexécution des migrations sur une base vide.
```

## Prompt 04  -  dashboard, authentification et RBAC

```text
Configure le dashboard Payload et les permissions.

Rôles :
- Administrateur : accès complet, réglages globaux, utilisateurs, audit, publication ;
- Publicateur : création, modification et publication des contenus métier ;
- Éditeur : brouillons et soumission à validation, sans publication.

Implémente :
- authentification sécurisée ;
- session avec cookies sécurisés ;
- changement obligatoire du mot de passe initial ;
- verrouillage progressif après échecs ;
- rate limiting de connexion ;
- contrôle d’accès serveur, pas uniquement dans l’interface ;
- historique append-only ;
- prévisualisation avant publication ;
- confirmation avant archivage/suppression.

Ajoute le bootstrap local des six comptes .test documentés, sans mot de passe dans Git et avec refus automatique en production.

Écris des tests prouvant que l’Éditeur ne peut pas publier et qu’un Publicateur ne peut pas modifier les réglages globaux.
```

## Prompt 05  -  seeds de démonstration et migration du prototype

```text
Transforme les données DB de standalone.html en seeds de démonstration idempotents.

Mappe :
domains → Expertises
projets → Projects
realisations → Realisations
formations → Formations
evenements → Events
produits → Products
dirigeant → Mot du PDG / contenu À propos
piliers → Qui sommes-nous

Les données sont explicitement marquées demo et ne doivent jamais écraser les données réelles sans confirmation.

Prépare les médias de démonstration autorisés par le client. Chaque média doit avoir un alt text, un type, une taille et une note de droits.

Vérifie que le seed peut être lancé deux fois sans doublon et que tous les contenus publiés respectent les règles de complétude FR/EN.
```

## Prompt 06  -  site public Next.js

```text
Implémente les pages publiques Next.js à partir du parcours et du design de standalone.html.

Routes :
/[locale]/
/[locale]/expertises
/[locale]/expertises/[slug]
/[locale]/realisations
/[locale]/realisations/[slug]
/[locale]/formations-evenements
/[locale]/formations/[slug]
/[locale]/evenements
/[locale]/evenements/[slug]
/[locale]/produits
/[locale]/produits/[slug]
/[locale]/a-propos
/[locale]/contact
/[locale]/mentions-legales
/[locale]/confidentialite

La page d’accueil doit respecter l’ordre validé : hero, confiance, Qui sommes-nous, expertises, produits, chiffres, réalisations, formations/événements, direction, témoignages et CTA.

Tous les textes, cartes, médias, liens, boutons, chiffres et visibilités doivent être fournis par le CMS ou SiteSettings.

Utilise SSR/SSG/ISR selon le contenu. Les contenus non publiés ne doivent jamais être rendus.
```

## Prompt 07  -  synchronisation CMS → site public

```text
Raccorde le site public aux données Payload et implémente la publication réelle.

Lorsqu’un Publicateur publie ou modifie un contenu :
1. Payload valide le contenu ;
2. la version et l’audit sont enregistrés ;
3. un webhook signé déclenche la revalidation Next.js ;
4. les listes et pages détail sont rafraîchies ;
5. une erreur de revalidation reste observable sans supprimer l’ancienne version valide.

Implémente la prévisualisation draft sécurisée uniquement pour les utilisateurs autorisés.

Teste obligatoirement le flux : modification d’un Produit dans le dashboard → publication → apparition dans le catalogue et dans la page détail.
```

## Prompt 08  -  contact, cookies, légal, conservation et SEO

```text
Implémente les fonctions transverses conformément aux documents.

Contact : validation serveur, consentement obligatoire, rate limiting, enregistrement PostgreSQL, notification SMTP et accusé contrôlé.

Cookies : aucun service non nécessaire avant consentement ; carte et mesure d’audience conditionnelles ; possibilité de retrait.

Données : implémente retention_until, tâche retention-cleanup, anonymisation et journalisation sans recopier les données supprimées.

SEO : metadata unique par locale, canonical, hreflang, Open Graph, sitemap, robots, JSON-LD, pages 404 non indexées et redirections 301.

Les textes légaux viennent de LegalDocuments et ne doivent pas être dupliqués en dur.

Vérifie que les contenus SEO, cookies et mentions peuvent être modifiés depuis Réglages généraux.
```

## Prompt 09  -  API événements et OpenAPI

```text
Implémente l’API événements en lecture seule selon openapi-evenements.yaml.

Routes :
GET /api/events
GET /api/events/:slug
GET /api/events/:slug/calendar
GET /api/openapi.json

Expose uniquement les événements publiés et les champs descriptifs. N’ajoute aucun champ de paiement, de prix, de billet, de panier ou de commande.

Ajoute :
- validation des paramètres ;
- locale FR/EN ;
- pagination limitée ;
- réponses 400/404 cohérentes ;
- cache public contrôlé ;
- génération ICS ;
- tests de contrat OpenAPI.
```

## Prompt 10  -  tests, audit et optimisation

```text
Exécute l’audit complet de la plateforme locale.

Tests fonctionnels : routes, navigation, publication, produits, formulaires, API, médias, réglages.
Tests RBAC : les trois rôles et les refus d’accès.
Tests sécurité : headers, CSP, cookies, rate limit, sanitation, uploads, secrets, dépendances et images Docker.
Tests accessibilité : axe-core, clavier, focus, contraste, titres, formulaires et alt text.
Tests responsive : 320, 390, 768 et 1440 px.
Tests performance : Lighthouse mobile avec objectif Performance et Accessibility ≥ 90.
Tests SEO : metadata uniques, canonical, hreflang, sitemap, robots et 301.
Tests backup : restauration d’un dump PostgreSQL et des objets MinIO.

Produit un rapport avec : test, résultat, preuve, sévérité, correction et statut.
Corrige les problèmes critiques et élevés avant de conclure.
```

## Prompt 11  -  documentation et préparation du déploiement

```text
Prépare la livraison locale et la production Oracle Cloud sans déployer.

Mets à jour :
- README de démarrage local ;
- guide dashboard bilingue non technique ;
- guide comptes et récupération ;
- guide sauvegarde/restauration ;
- guide migrations ;
- guide configuration SMTP ;
- guide MinIO ;
- guide Nginx/TLS/DNS Oracle Cloud ;
- documentation OpenAPI ;
- matrice de recette ;
- plan de redirections ;
- procédure de rollback.

Génère une checklist finale indiquant les éléments qui nécessitent encore une décision humaine : domaine, anciennes URL Framer, textes juridiques, identités de production, secrets SMTP, contenus réels et validation finale.

Ne considère pas le projet prêt tant que les tests, sauvegardes et guides ne sont pas vérifiés.
```

## Prompt final  -  audit de livraison

```text
Réalise un audit final sans modifier le code au premier passage.

Compare le résultat réel au cahier des charges, à standalone.html et à tous les documents docs/.
Vérifie notamment :
- aucun élément public non administrable ;
- aucun doublon Actualités ;
- aucun mode sombre ;
- Produits contrôlé de bout en bout ;
- FR/EN cohérents ;
- rôles correctement appliqués ;
- API événements sans commerce ;
- URLs et 301 ;
- SEO par page ;
- sécurité ;
- backups ;
- performance et accessibilité.

Produis un rapport PASS/FAIL avec preuves. Corrige uniquement après avoir listé les écarts, puis relance les tests concernés. Termine par une recommandation explicite : prêt pour recette client ou non.
```
