# Architecture, diagrammes UML et flux

> État au 28/08/2026 : les diagrammes distinguent les capacités implémentées
> des capacités planifiées. L'API événements, l'export ICS, la notification
> SMTP du contact et le rate limit applicatif du contact restent à réaliser.

## 1. Principes d’architecture

La plateforme est séparée en trois responsabilités : présentation, logique applicative et données. Le site public ne lit jamais directement PostgreSQL. Toute donnée passe par les services applicatifs et les règles de publication de Payload.

```mermaid
flowchart TB
  subgraph P[Couche présentation]
    Browser[Visiteur navigateur]
    AdminBrowser[Administrateur navigateur]
    Next[Next.js : pages publiques SSR/SSG/ISR]
    PayloadAdmin[Dashboard Payload CMS]
  end
  subgraph L[Couche logique applicative]
    BFF[API / BFF Next.js]
    CMS[Payload CMS API REST + GraphQL]
    Auth[Authentification + RBAC]
    Publish[Workflow brouillon / validation / publication]
    Validate[Validation Zod + sanitation rich text]
    MediaService[Service médias et alt text]
    Mail[Service notification SMTP planifié]
    EventsAPI[API Events et export ICS planifiés]
    Revalidate[Revalidation ISR / cache]
  end
  subgraph D[Couche données]
    PG[(PostgreSQL)]
    SeaweedFS[(SeaweedFS S3 objets médias)]
    Audit[(Journal d’audit)]
  end
  Browser --> Next
  AdminBrowser --> PayloadAdmin
  Next --> BFF
  PayloadAdmin --> CMS
  BFF --> CMS
  CMS --> Auth
  CMS --> Publish
  CMS --> Validate
  CMS --> PG
  MediaService --> SeaweedFS
  CMS --> MediaService
  CMS --> Audit
  CMS --> Mail
  EventsAPI --> CMS
  Publish --> Revalidate
  Revalidate --> Next
```

## 2. Diagramme de déploiement

### 2.1 Développement local

```mermaid
flowchart LR
  Dev[Machine développeur]
  Browser[Navigateur]
  subgraph Docker[Docker Compose local]
    Nginx[Nginx :8080 / HTTPS local]
    Web[web : Next.js]
    Cms[cms : Payload]
    Db[(postgres :5432)]
    Object[(seaweedfs :8333 S3)]
    Mailhog[mailpit ou SMTP de test]
  end
  Dev --> Browser
  Browser --> Nginx
  Nginx --> Web
  Nginx --> Cms
  Web --> Cms
  Cms --> Db
  Cms --> Object
  Cms --> Mailhog
```

### 2.2 Production Oracle Cloud Free Tier

```mermaid
flowchart LR
  User[Visiteurs et équipe éditoriale]
  DNS[Zone DNS du domaine]
  VPS[VPS Oracle Cloud]
  Proxy[Nginx + TLS Let's Encrypt]
  Web[Conteneur Next.js]
  Cms[Conteneur Payload CMS]
  DB[(Conteneur PostgreSQL privé)]
  Storage[(Conteneur SeaweedFS S3 privé)]
  SMTP[Compte SMTP professionnel]
  Backup[Stockage de sauvegardes chiffrées]
  User --> DNS
  DNS --> Proxy
  Proxy --> Web
  Proxy --> Cms
  Web --> Cms
  Cms --> DB
  Cms --> Storage
  Cms --> SMTP
  DB --> Backup
  Storage --> Backup
```

Règles de déploiement : PostgreSQL et SeaweedFS ne sont jamais exposés sur Internet ; seuls Nginx et les ports strictement nécessaires sont publics. Le DNS pointe vers le VPS uniquement après validation du serveur et du certificat.

## 3. Diagramme de composants UML

```mermaid
flowchart TB
  VisitorUI[Interface publique Next.js]
  AdminUI[Dashboard Payload]
  Router[Routeur et middleware locale]
  ContentAPI[API contenu]
  EventsAPI[API événements OpenAPI lecture seule]
  Auth[Auth / RBAC]
  ContentService[Services de contenu]
  SEO[SEO / sitemap / redirections]
  Media[Service SeaweedFS S3]
  Contact[Service contact, validation anti-abus et audit]
  Audit[Service audit log]
  Revalidate[Webhook revalidation]
  PG[(PostgreSQL)]
  SeaweedFS[(SeaweedFS)]
  SMTP[SMTP]
  VisitorUI --> Router
  AdminUI --> Auth
  Router --> ContentAPI
  ContentAPI --> ContentService
  EventsAPI --> ContentService
  ContentService --> PG
  ContentService --> SEO
  AdminUI --> ContentAPI
  AdminUI --> Media
  Media --> SeaweedFS
  AdminUI --> Audit
  ContentService --> Audit
  Contact --> ContentService
  Contact --> SMTP
  ContentService --> Revalidate
  Revalidate --> VisitorUI
```

## 4. Séquence UML  -  publication d’un produit

```mermaid
sequenceDiagram
  actor Publicateur
  actor Editeur as Éditeur
  participant UI as Dashboard
  participant Auth as Auth + RBAC
  participant CMS as Payload API
  participant Val as Validation
  participant DB as PostgreSQL
  participant Audit as Audit log
  participant ISR as Revalidation Next.js
  participant Public as Page publique Produits
  Publicateur->>UI: Ouvre Produits et modifie la fiche
  UI->>Auth: Vérifie session et rôle
  Auth-->>UI: Autorisation accordée ou refusée
  UI->>CMS: Envoie contenu FR/EN + média + SEO
  CMS->>Val: Valide champs obligatoires, slug, URL, alt text
  Val-->>CMS: Données valides
  CMS->>DB: Enregistre nouvelle version
  CMS->>Audit: Journalise l’action et les changements
  alt Publicateur autorisé et statut publié
    CMS->>ISR: Déclenche revalidation de /produits/[slug]
    ISR-->>Public: Nouvelle fiche visible
  else Éditeur ou contenu incomplet
    CMS-->>UI: Brouillon / soumission à validation
  end
  UI-->>Editeur: Confirmation et lien de prévisualisation
```

## 5. Séquence UML  -  visiteur et formulaire de contact

> Cette séquence décrit le flux implémenté. La notification SMTP réelle reste
> un contrôle de recette dépendant des identifiants de production.

```mermaid
sequenceDiagram
  actor Visiteur
  participant Web as Site Next.js
  participant API as API contact
  participant Rate as Rate limiter
  participant Val as Validation serveur
  participant DB as PostgreSQL
  participant SMTP as SMTP professionnel
  participant Admin as Dashboard messages
  Visiteur->>Web: Remplit le formulaire
  Web->>API: POST /api/contact + consentement
  API->>Rate: Vérifie IP et fréquence
  alt Limite dépassée
    Rate-->>API: Refus 429
    API-->>Web: Message générique de temporisation
  else Requête autorisée
    API->>Val: Valide nom, e-mail, besoin, message et consentement
    alt Données invalides
      Val-->>API: Erreurs par champ
      API-->>Web: Réponse 400 exploitable
    else Données valides
      API->>DB: Enregistre message + date d’expiration
      API->>SMTP: Envoie notification interne et accusé
      SMTP-->>API: Succès ou échec contrôlé
      API-->>Web: Confirmation sans révéler de données internes
      Admin->>DB: Consulte et traite le message
    end
  end
```

## 6. Diagramme de collaboration UML

Le scénario ci-dessous décrit la communication entre objets lors d’une publication.

```mermaid
flowchart LR
  A[1 Dashboard] -->|2 submitContent| B[3 ContentController]
  B -->|4 authorize| C[5 AuthorizationService]
  B -->|6 validate| D[7 ContentValidator]
  D -->|8 normalized payload| E[9 ContentRepository]
  E -->|10 transaction| F[(11 PostgreSQL)]
  E -->|12 record change| G[13 AuditService]
  E -->|14 published event| H[15 RevalidationQueue]
  H -->|16 purge/revalidate| I[17 Next.js cache]
  I -->|18 page refreshed| J[19 PublicProductPage]
```

## 7. Flux de données

| Flux | Entrée | Traitement | Sortie | Contrôles |
|---|---|---|---|---|
| Contenu éditorial | Formulaire dashboard | Auth, validation, sanitation, versioning | Brouillon ou contenu publié | RBAC, champs requis, audit |
| Média | Upload image/document | Taille, MIME, nom sûr, alt text, stockage SeaweedFS/S3 | URL média signée ou publique contrôlée | Extension autorisée, droits, antivirus si disponible |
| Site public | Requête HTTP | Next.js lit l’API/CMS et utilise ISR | HTML, métadonnées, JSON-LD | Cache, locale, statut publié |
| Publication | Action publicateur/admin | Transaction DB + événement de revalidation | Page publique actualisée | Audit, cohérence et rollback |
| Contact | Formulaire visiteur | Validation, consentement, anti-abus et audit ; SMTP à vérifier en recette | Message DB | Conservation limitée |
| Événements API | Requête lecture seule | Projection des événements publiés, locale, pagination et cache | JSON ou ICS | Aucun paiement ni billetterie |
| Réglages globaux | Dashboard administrateur | Validation singleton | Navigation, footer, cookies, SEO | Administrateur uniquement |

## 8. Spécification des cas d’utilisation

```plantuml
@startuml
left to right direction
actor Visiteur
actor Editeur
actor Publicateur
actor Administrateur
actor SMTP

rectangle "Plateforme Africa Ingénierie" {
  usecase "Consulter le site" as UC1
  usecase "Changer de langue" as UC2
  usecase "Consulter un produit" as UC3
  usecase "Consulter formations\net événements" as UC4
  usecase "Envoyer une demande" as UC5
  usecase "Créer un brouillon" as UC6
  usecase "Soumettre à validation" as UC7
  usecase "Publier un contenu" as UC8
  usecase "Gérer les produits" as UC9
  usecase "Gérer les réglages globaux" as UC10
  usecase "Gérer les utilisateurs" as UC11
  usecase "Consulter l'historique" as UC12
  usecase "Consulter les messages" as UC13
}
Visiteur --> UC1
Visiteur --> UC2
Visiteur --> UC3
Visiteur --> UC4
Visiteur --> UC5
Editeur --> UC6
Editeur --> UC7
Publicateur --> UC6
Publicateur --> UC8
Publicateur --> UC9
Administrateur --> UC8
Administrateur --> UC9
Administrateur --> UC10
Administrateur --> UC11
Administrateur --> UC12
Administrateur --> UC13
SMTP --> UC5
@enduml
```

## 9. Scénarios détaillés

### UC-01  -  Publier un produit

1. L’utilisateur autorisé ouvre le module Produits.
2. Il crée ou modifie la fiche en français et en anglais.
3. Le système vérifie le slug, la catégorie, la disponibilité, le contenu, l’alt text et le SEO.
4. Le publicateur publie ; l’éditeur soumet à validation.
5. Le système enregistre une version et une entrée d’audit.
6. Next.js est revalidé.
7. Le produit apparaît dans `/produits` et `/produits/[slug]`.

### UC-02  -  Modifier les réglages globaux

1. L’administrateur ouvre Réglages généraux.
2. Il modifie logo, navigation, langues, coordonnées, réseaux, textes légaux ou SEO.
3. Le système valide chaque URL et chaque champ sensible.
4. La modification est enregistrée dans une transaction.
5. Les pages publiques sont revalidées.

### UC-03  -  Envoyer un message

1. Le visiteur remplit les champs obligatoires et accepte la politique de confidentialité.
2. Le serveur applique la validation. Le rate limiting applicatif reste à ajouter.
3. Le message est enregistré avec une date d’expiration.
4. Une notification SMTP sera envoyée après livraison du service de notification.
5. Le visiteur reçoit une confirmation générique.

### UC-04  -  Gérer les comptes

1. Seul l’administrateur peut créer, suspendre ou modifier un compte.
2. Le rôle est choisi parmi Administrateur, Publicateur et Éditeur.
3. Le système force l’activation initiale par lien à usage unique.
4. Le mot de passe n’est jamais visible dans le dashboard ni dans les logs.
5. Toute action est auditée.
