# Plan de recette, sécurité et mise en production

## État de la recette au 28/08/2026

Le socle Docker, les healthchecks, le typage, le lint, la suite CMS et le
contrôle HTTP des adresses publiques passent en local. Le flux E2E de publication
Produit, l’API événements, le contact renforcé, les redirections, le sitemap et
les restaurations PostgreSQL/SeaweedFS ont été vérifiés. Les images et scripts
Oracle Cloud sont maintenant fournis ; Lighthouse/axe-core, les scans CVE/ZAP,
le SMTP réel et une restauration sur le VPS restent à exécuter avant le go
production. Voir le [rapport d’audit complet](./rapport-audit-complet-2026-08-28.md).

## 1. Calendrier validé

Le calendrier demandé est conservé :

| Phase | Durée | Livrable de sortie |
|---|---:|---|
| Design Figma | 2 jours | Maquettes desktop/mobile validées |
| Socle technique | 1 jour | Docker, dépôt, applications et base initiale |
| Développement | 3 jours | Modules et dashboard avec données de démonstration |
| Recette | 2 jours | Rapport de tests et corrections bloquantes |
| Déploiement | 2 jours | Plateforme Oracle Cloud fonctionnelle et HTTPS |
| Stabilisation | 20 jours | Correctifs post-lancement |

Ce calendrier est réalisable uniquement avec des décisions rapides, du contenu de démonstration déjà disponible et une validation quotidienne. Les tests de sécurité et la sauvegarde/restauration doivent être exécutés en parallèle, jamais supprimés pour tenir la date.

## 2. Definition of Done

Une fonctionnalité est terminée lorsque :

- elle fonctionne en français et en anglais ;
- elle est administrable avec le rôle attendu ;
- ses états vide, erreur, chargement et succès sont prévus ;
- les données sont validées côté serveur ;
- l’action est auditée ;
- les métadonnées SEO sont complètes ;
- le clavier et le mobile sont testés ;
- les tests automatisés passent ;
- aucune donnée secrète n’est commitée.

## 3. Matrice de tests fonctionnels

| Domaine | Tests minimum |
|---|---|
| Navigation | Toutes les routes, fil d’Ariane, mobile, 404, redirections |
| Bilinguisme | Activation FR/EN, contenu incomplet, repli, `hreflang` |
| Produits | Création, édition, catégorie, disponibilité, caractéristiques, média, SEO, publication, archivage |
| Expertises | Liste, détail, relation projet/réalisation, publication |
| Réalisations | Étude de cas, médias avant/après, mise en avant |
| Formations | Catalogue, objectifs, sessions, dates passées/futures |
| Événements | Liste et détail ; export ICS et API lecture seule sans paiement |
| Contact | Champs obligatoires, consentement, validation, statut, rate limit, anti-robot et audit ; SMTP réel à vérifier |
| Réglages | Logo, favicon, menu, langues, footer, réseaux, légal, cookies, SEO |
| Rôles | Permissions Administrateur/Publicateur/Éditeur et refus d’accès |
| Historique | Création, modification, publication, restauration, horodatage |

## 4. Tests automatisés

- Tests unitaires : validateurs, slugs, traductions, dates, permissions.
- Tests d’intégration : hooks Payload, PostgreSQL et SeaweedFS ; SMTP de test disponible pour la recette, notification applicative à vérifier avec les secrets de production.
- Tests end-to-end Playwright : parcours visiteur et parcours des trois rôles.
- Tests de contrat : validation de `openapi-evenements.yaml`.
- Tests de liens : aucun lien mort, aucune URL `#` vide, aucune boucle de redirection.
- Tests de régression : comparaison visuelle avec la référence `standalone.html`.

Parcours E2E critique : un Publicateur modifie un produit, le publie, puis le produit doit apparaître dans `/fr/produits` et `/fr/produits/{slug}` après revalidation ISR.

## 5. Audit accessibilité et performance

Objectifs de recette :

- Lighthouse mobile Performance ≥ 90 ;
- Lighthouse mobile Accessibility ≥ 90 ;
- aucun problème critique axe-core ;
- navigation clavier complète ;
- contraste WCAG AA ;
- aucun débordement à 320, 375, 390, 768 et 1440 px ;
- images optimisées et textes alternatifs présents ;
- chargement différé des médias non critiques.

## 6. Audit sécurité

Avant déploiement :

- vérification HTTPS et HSTS ;
- contrôle CSP et absence de ressources mixtes ;
- test de rate limiting connexion/contact ;
- test de verrouillage après échecs ;
- test RBAC par rôle ;
- test de sanitation du rich text ;
- test upload MIME/taille/nom ;
- scan dépendances ;
- scan des images Docker ;
- test OWASP ZAP sur l’environnement de recette ;
- contrôle d’absence de secrets dans Git et dans les logs ;
- restauration d’une sauvegarde PostgreSQL et SeaweedFS.

## 7. Procédure de déploiement

1. Geler les migrations et créer une sauvegarde.
2. Construire les images Docker depuis le commit validé.
3. Vérifier les variables de production hors dépôt.
4. Déployer PostgreSQL et SeaweedFS privés.
5. Exécuter les migrations.
6. Déployer Payload et le site Next.js.
7. Configurer Nginx, DNS et certificats TLS.
8. Tester le site, l’administration, SMTP, les médias et l’API.
9. Activer les sauvegardes planifiées.
10. Remettre le guide au Client.

## 8. Retour arrière

Le déploiement doit permettre :

- retour vers l’image Docker précédente ;
- restauration de la base avant migration ;
- restauration des objets SeaweedFS/S3 ;
- désactivation temporaire de la publication ;
- maintien des redirections et du HTTPS.

## 9. Critères de recette client

La recette est acceptée lorsque :

- tous les éléments visibles sont administrables ;
- les deux langues sont cohérentes ;
- les six comptes et leurs droits sont vérifiés ;
- les produits fonctionnent de bout en bout ;
- aucun contenu Actualités n’est exposé ;
- aucun mode clair/sombre non demandé n’est présent ;
- aucune anomalie de lien, contenu dupliqué ou SEO générique n’est détectée ;
- HTTPS est actif sans alerte critique ;
- le Client dispose du code source, des guides, de l’OpenAPI et des procédures de sauvegarde.
