# Audit de cohérence du dossier technique

Date : 28 août 2026
Périmètre : cahier des charges, `standalone.html`, dossier `docs/` et état réel du code local.

## 1. Résultat global

Le dossier est cohérent après mise à jour, avec une distinction explicite entre
fonctionnalités livrées et travaux planifiés. Next.js présente les données
publiques, Payload porte l'administration et le workflow, PostgreSQL conserve
les données structurées, MinIO conserve les médias et Nginx expose uniquement
les entrées nécessaires.

## 2. Contrôles réalisés

| Contrôle | Résultat | Décision |
|---|---|---|
| Architecture en couches | Conforme | Présentation → logique → données |
| Déploiement | Conforme | Docker Compose local et VPS Oracle Cloud Free Tier |
| Produits | Conforme | Collection métier ajoutée officiellement |
| Formations/événements | Conforme | Regroupés dans le parcours, séparés dans les données |
| Bilinguisme | Conforme | FR/EN activés, stratégie de repli documentée |
| Rôles | Conforme | 2 Administrateurs, 2 Publicateurs, 2 Éditeurs |
| Publication | Conforme | Brouillon → validation → publication → revalidation |
| Médias | Conforme | MinIO, alt text obligatoire, sanitation |
| API événements | Conforme | Routes lecture seule, OpenAPI, locale, pagination, cache et ICS livrés |
| SEO | Socle conforme, recette production à faire | Métadonnées par locale, canonical, hreflang et routes validées |
| Conservation | Socle opérationnel fourni | Politique, rotation des sauvegardes et script chiffré livrés ; test VPS à exécuter |
| Développement local | Conforme | Services Docker et SMTP de test |
| Design | Conforme | `standalone.html` retenu comme référence visuelle |

## 3. Écarts identifiés et corrigés

### Écart A  -  Produits absent du tableau initial du cahier

Correction : Produits est désormais un module officiel dans le périmètre, le MCD, le MLD, le MPD, l’API de navigation, la matrice de recette et les prompts de développement.

### Écart B  -  Ambiguïté du regroupement Formations & événements

Correction : le regroupement est conservé côté navigation et expérience utilisateur, mais `formations`, `formation_sessions` et `events` restent des entités distinctes. Cette décision permet de préserver les filtres, les droits et l’API événements.

### Écart C  -  Confusion entre prototype autonome et plateforme dynamique

Correction : `standalone.html` est explicitement traité comme référence de design, contenu de démonstration et parcours. La version de production utilisera Payload, PostgreSQL, MinIO, authentification et revalidation ISR.

### Écart D  -  Comptes réels et mots de passe

Correction : les comptes locaux sont provisionnés par bootstrap sécurisé. Les comptes de production seront créés par invitation sur les adresses confirmées du Client. Aucun mot de passe réel ne doit être placé dans les documents ou le dépôt.

### Écart E  -  Domaine de production non fourni

Correction : les chemins d’URL sont définis ; le domaine reste explicitement provisoire jusqu’à validation du Client. Les anciennes URL Framer doivent encore être importées pour produire la table complète des 301.

### Écart F  -  Conservation des données

Correction : une politique technique est proposée, mais la durée définitive et les formalités locales doivent être validées par le Client et son conseil juridique avant production.

## 4. Points qui ne doivent pas être codés par approximation

- ne pas inventer les anciennes URL Framer ;
- ne pas inventer les adresses de comptes de production ;
- ne pas déposer de secrets SMTP, MinIO ou Payload dans Git ;
- ne pas publier de texte légal sans validation du Client ;
- ne pas ajouter de paiement, billetterie ou commande au module Événements ;
- ne pas créer une page publique qui contourne le statut de publication ;
- ne pas dupliquer les textes publics dans plusieurs composants quand ils doivent venir du CMS.

## 5. Verdict

Le dossier correspond maintenant au code réellement présent. Le socle local et
le pack Oracle sont exploitables pour poursuivre la recette. La notification
SMTP réelle, les scans externes (Lighthouse, axe-core, CVE/ZAP), le test de
restauration sur le VPS et la validation juridique des contenus restent des
conditions de go production.
