# Étude comparative des plateformes Africa Ingénierie

Date : 28 août 2026  
Périmètre : projet local du dépôt et site public actuellement en ligne.

## 1. Méthode et limites

Cette étude compare la surface publique observable du site en ligne avec les
fonctionnalités réellement présentes dans le dépôt local. Elle ne déduit pas
la technologie interne du site en ligne lorsque celle-ci n'est pas observable.
Les constats sur le site actuel sont donc fonctionnels et éditoriaux, tandis
que les constats sur le projet local sont vérifiés dans le code, les tests et
les services Docker.

L'URL fournie `ingenierieafrica.com` est la référence du site actuellement en
ligne. Elle est distincte du domaine cible du nouveau déploiement, qui est
`africaingenieries.com`.

## 2. Comparaison non technique

| Sujet | Site actuellement en ligne | Projet local en développement | Apport du projet local |
|---|---|---|---|
| Positionnement | Vitrine industrielle centrée sur l'excellence et les domaines d'expertise | Parcours structuré autour des expertises, produits, réalisations, formations et événements | Message plus lisible et parcours orienté vers la prise de contact |
| Navigation | Parcours public principalement vitrine | Navigation bilingue FR/EN avec routes dédiées et regroupement Formations et événements | Accès plus prévisible sur ordinateur et mobile |
| Produits | Aucun catalogue public clairement mis en avant dans la surface observée | Catalogue et pages détail Produits prévus et alimentés par Payload | Nouveau levier de présentation de l'offre et de qualification des demandes |
| Formations et événements | Présentation mêlée aux actualités et aux formations à venir | Module public regroupé, avec entités CMS séparées | Meilleure distinction entre programme, session et événement |
| Réalisations | Études de cas visibles avec logique avant et après | Liste, détail, médias et publication bilingue | Présentation plus durable et administrable des preuves de savoir-faire |
| Crédibilité éditoriale | La surface observée contient des valeurs statistiques à zéro, une expertise répétée et un témoignage sans rapport avec l'industrie | Contenus de démonstration marqués, remplaçables depuis le dashboard | Réduction du risque de publier un contenu incohérent avant mise en production |
| Appel à l'action | Découverte et contact présents | CTA centralisés et contrôlables par les réglages globaux | Cohérence des boutons, des liens et des coordonnées |
| Bilinguisme | La présence et la complétude FR/EN ne sont pas démontrées de manière suffisante sur la surface observée | Champs bilingues, segments d'URL FR/EN et contrôle de complétude à la publication | Meilleure cohérence entre langues et référencement international |
| Gouvernance | Le mode de mise à jour éditoriale n'est pas observable publiquement | Rôles Administrateur, Publicateur et Éditeur, versions, audit et prévisualisation autorisée | Autonomie éditoriale et responsabilité des publications |
| Identité visuelle | Présence industrielle et institutionnelle déjà identifiable | `standalone.html` conservé comme référence visuelle et design system réutilisable | Évolution contrôlée sans repartir d'un template générique |

## 3. Comparaison technique

| Capacité | Site en ligne observable | Projet local vérifié | Évaluation |
|---|---|---|---|
| Rendu public | Pages marketing accessibles au navigateur | Next.js avec pages localisées, métadonnées, données CMS et cache de rendu | Le projet local est plus industrialisable |
| Administration | Fonctionnement interne non observable depuis le site public | Payload CMS avec dashboard et collections métier | Avantage local, sous réserve de recette et durcissement final |
| Données | Modèle et stockage non observables | PostgreSQL avec migrations versionnées et types Payload | Traçabilité locale supérieure |
| Médias | Médias publics visibles, pipeline non documenté publiquement | MinIO, alt text, média de démonstration marqué et contrôles d'upload | Meilleure gouvernance locale |
| Publication | Workflow non observable | Brouillon, validation, publication, version, audit et webhook HMAC de revalidation | Avantage local vérifié dans le code et la suite E2E dédiée |
| Prévisualisation | Non observable | Endpoint de preview avec jeton signé et contrôle d'autorisation | Fonction utile pour l'équipe éditoriale |
| SEO | Présence de pages et de contenus, règles techniques non vérifiables depuis la surface | Canonical, hreflang, métadonnées par locale, sitemap et routes validées | Fondations SEO plus explicites localement |
| Sécurité | Stack interne inconnue | Hôtes séparés, CSP, RBAC, verrouillage compte, réseau Docker privé et secrets hors dépôt | Bon socle local, mais recette production encore nécessaire |
| Contact | Formulaire public disponible | POST via Next.js vers Payload avec validation et consentement | Fonction opérationnelle, protection anti-abus encore incomplète |
| API événements | API publique non démontrée sur la plateforme existante | Routes `/api/events`, ICS et OpenAPI livrées en lecture seule dans le projet local | Maintenir le périmètre descriptif sans paiement ni billetterie |
| Exploitation | Hébergement réel disponible | Docker Compose local, Nginx, PostgreSQL, MinIO et Mailpit prêts pour la recette | Le site en ligne gagne sur la disponibilité, le local gagne sur la maîtrise |

## 4. Forces et faiblesses de la nouvelle plateforme

### Forces

- architecture séparée entre site public et dashboard ;
- contenu métier pilotable par le CMS dans les deux langues ;
- produits intégrés au périmètre et reliés au parcours de contact ;
- publication protégée par validation, versionnage, audit et revalidation ;
- routes publiques vérifiées par un contrôle HTTP automatisé ;
- design system issu de la référence validée, sans mode sombre ajouté ;
- développement local reproductible avec Docker.

### Faiblesses actuelles à traiter avant production

- la route de contact n'a pas encore de limitation de débit applicative, d'anti-robot, de hachage IP ou de notification SMTP ;
- la tâche automatique de conservation et d'anonymisation n'est pas encore implémentée, même si `retentionUntil` existe dans le modèle ;
- l'API événements, l'export ICS et la documentation OpenAPI sont désormais exposés en lecture seule sur le site en développement ;
- les visuels, portraits, logos, textes légaux et coordonnées de démonstration doivent être remplacés ou validés ;
- le test E2E du flux complet Produit doit être exécuté sur une pile locale démarrée avant tout go de production ;
- les performances de production doivent être confirmées par un build optimisé et Lighthouse, pas seulement par `next dev`.

## 5. Recommandations par priorité

### Priorité P0, avant mise en ligne

1. Finaliser la protection du formulaire de contact : rate limit applicatif,
   anti-robot, hachage IP et user-agent, journalisation utile, notification
   SMTP contrôlée et messages d'erreur génériques.
2. Décider le sort de l'API événements : l'implémenter complètement ou retirer
   les routes annoncées des documents et de la recette.
3. Exécuter le test de publication Produit de bout en bout : modification dans
   Payload, publication, webhook signé, revalidation, catalogue, détail et
   conservation de l'ancienne version en cas d'échec.
4. Mettre en place la tâche de conservation, la rotation des sauvegardes et un
   test de restauration PostgreSQL et MinIO.
5. Remplacer chaque contenu de démonstration et faire valider les textes
   juridiques, les coordonnées, les médias et les droits d'utilisation.

### Priorité P1, lancement et croissance commerciale

1. Ajouter un moteur de recherche et des filtres simples pour Produits,
   Expertises, Réalisations et Formations.
2. Ajouter des fiches Produits plus qualifiantes : caractéristiques, usages,
   documentation téléchargeable, disponibilité et CTA de demande d'information.
3. Mettre en place des tableaux de suivi éditorial : contenus incomplets,
   brouillons anciens, médias sans usage et traductions manquantes.
4. Ajouter une mesure d'audience respectueuse du consentement et des indicateurs
   de conversion sur les CTA et le formulaire de contact.
5. Mettre en place CI, scan des dépendances, scan des images Docker et contrôle
   automatique des routes avant chaque déploiement.

### Priorité P2, évolution de la plateforme

- espace client sécurisé pour suivre les demandes et télécharger des documents ;
- workflow de demande de devis sans transformer le site en boutique ;
- recherche globale avec indexation des contenus publiés ;
- CDN et optimisation d'images lorsque le volume média augmentera ;
- observabilité centralisée avec alertes sur erreurs de revalidation, SMTP,
  temps de réponse et saturation du stockage ;
- MFA administrateur et séparation plus fine des permissions éditoriales.

## 6. Recommandation de décision

La plateforme locale est le meilleur socle pour la prochaine version : elle
apporte une gouvernance éditoriale, un vrai module Produits, le bilinguisme et
une architecture maîtrisée. Le site déjà hébergé reste utile comme référence
de contenu, de positionnement et de disponibilité, mais il ne doit pas être
utilisé comme référence technique.

Pour orienter le Client vers la nouvelle plateforme de façon honnête, il faut
la présenter comme une version plus administrable, plus traçable et plus
évolutive, tout en annonçant clairement les cinq chantiers P0 restants. Le go
de production ne sera raisonnable qu'après clôture de ces chantiers et
validation d'une recette publique bilingue.
