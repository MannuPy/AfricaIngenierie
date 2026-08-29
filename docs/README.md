# Dossier technique  -  Africa Ingénierie

Version : 1.2 · 28 août 2026
Statut : socle local implémenté, audit local exécuté, recette production conditionnelle

## Objet

Ce dossier transforme le cahier des charges et le prototype `standalone.html` en spécifications techniques exploitables pour construire la plateforme.

Le cahier des charges reste la source des exigences contractuelles. Le prototype constitue la référence visuelle et fonctionnelle validée. Les ajouts demandés par le client sont intégrés ici : bilinguisme FR/EN confirmé, module Produits officiellement inclus, nouveaux parcours URL, images IA autorisées pour la démonstration et développement local avec Docker Compose.

## Documents

- [Architecture, UML, flux et cas d’utilisation](./architecture-et-uml.md)
- [MCD et MLD](./mcd-mld.md)
- [MPD PostgreSQL](./mpd-postgresql.sql)
- [API Événements  -  OpenAPI](./openapi-evenements.yaml)
- [Règles de gestion et intégrité](./regles-de-gestion.md)
- [Politique technique de conservation des données](./politique-conservation-donnees.md)
- [Plan des URL et redirections](./urls-et-redirections.md)
- [Comptes et accès de développement local](./comptes-dev-local.md)
- [Plan de recette, sécurité et mise en production](./plan-recette-securite.md)
- [Étude comparative avec la plateforme en ligne](./etude-comparative-plateformes.md)
- [Rapport d’audit complet du 28/08/2026](./rapport-audit-complet-2026-08-28.md)
- [Analyse critique architecture, UX/UI, sécurité et performance](./analyse-critique-plateforme-2026-08-28.md)
- [Guide de déploiement Oracle Cloud](./deploiement-oracle-cloud.md)
- [Guide de déploiement Render](./deploiement-render.md)

## Architecture retenue

- Site public : Next.js, rendu hybride SSR/SSG/ISR.
- CMS et dashboard : Payload CMS, Node.js, TypeScript.
- Base de données : PostgreSQL.
- Médias : MinIO en local, stockage S3-compatible durable recommandé sur Render.
- Reverse proxy : Nginx en local ; terminaison TLS et routage assurés par Render
  en production.
- Orchestration locale : Docker Compose. Production recommandée : Render
  Blueprint (`render.yaml`) avec services Node natifs et PostgreSQL managé.
- API : REST/GraphQL Payload ; l’API publique événements est disponible en
  lecture seule avec contrat OpenAPI, pagination, cache et export ICS.

## Périmètre fonctionnel

Le périmètre comprend les modules du cahier des charges et le module Produits ajouté officiellement : Accueil, Mot du PDG, Qui sommes-nous, Équipe dirigeante, Expertises, Projets, Réalisations, Formations, Événements, Produits, Contact, Médias, Réglages globaux, Utilisateurs et Historique.

La rubrique Formations & événements est regroupée dans le parcours public, mais reste séparée dans le modèle de données pour préserver la clarté éditoriale et l’API événements.

## Règle d’implémentation importante

`standalone.html` reste la référence visuelle. Le socle local utilise désormais
Next.js, Payload, PostgreSQL, MinIO et Nginx. Les collections métier, le
bilinguisme, le versionnage, l'audit, la prévisualisation sécurisée, la
revalidation Produit, le contact renforcé et l'API événements sont implémentés.
Lighthouse/axe-core, le scan CVE/ZAP, le test SMTP réel et un test de
restauration sur le VPS restent des contrôles à exécuter avant production. Les comptes,
mots de passe, secrets SMTP et clés MinIO ne doivent jamais être écrits dans ce
dépôt.
