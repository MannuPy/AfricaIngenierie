# Règles de gestion et intégrité

> Les règles ci-dessous distinguent les invariants déjà appliqués par Payload
> des règles cibles des modules encore planifiés. L'API événements et l'export
> ICS ne sont pas exposés dans les routes actuelles ; leurs règles s'appliqueront
> lors de leur implémentation.

## 1. Règles générales de publication

RG-001  -  Tout contenu public possède un statut `draft`, `review`, `published` ou `archived`.

RG-002  -  Seul un contenu `published` et complet est exposé par le site public ou l’API événements.

RG-003  -  Un Éditeur peut créer et modifier un brouillon, mais ne peut pas le publier.

RG-004  -  Un Publicateur peut publier les contenus métier, mais ne peut pas gérer les comptes ni les réglages de sécurité.

RG-005  -  Seul un Administrateur peut gérer les utilisateurs, les réglages globaux, les suppressions et les restaurations.

RG-006  -  Toute modification, publication, dépublication, archive ou suppression est inscrite dans `audit_logs`.

RG-007  -  Une suppression métier est d’abord un archivage. La suppression physique est réservée à une procédure administrateur documentée.

## 2. Règles bilingues

RG-010  -  Le français et l’anglais sont activés.

RG-011  -  Un contenu doit posséder un titre, un résumé et des métadonnées SEO dans les deux langues avant publication bilingue.

RG-012  -  Si une traduction est incomplète, le système ne rend pas une page vide. Il applique la stratégie de repli définie par le CMS ou masque proprement la page dans la locale concernée.

RG-013  -  Les slugs sont uniques, stables, en minuscules ASCII, sans accents ni espaces.

RG-014  -  Les dates, références, identifiants et valeurs techniques ne sont pas traduits.

## 3. Cardinalités métier

| Relation | Cardinalité | Règle |
|---|---:|---|
| Un rôle  -  utilisateurs | 1:N | Un utilisateur possède un rôle principal. |
| Une expertise  -  réalisations | 1:N | Une réalisation peut être rattachée à zéro ou une expertise. |
| Une expertise  -  projets | 1:N | Un projet peut être rattaché à zéro ou une expertise. |
| Une formation  -  sessions | 1:N | Une formation peut avoir zéro ou plusieurs sessions. |
| Une session  -  formation | N:1 | Une session appartient à une seule formation. |
| Une section accueil  -  produits | N:N | Relation ordonnée par `position`. |
| Une section accueil  -  réalisations | N:N | Seules les réalisations publiées peuvent être mises en avant. |
| Une section accueil  -  formations | N:N | Seules les formations publiées peuvent être mises en avant. |
| Une section accueil  -  événements | N:N | Seuls les événements publiés et pertinents peuvent être mis en avant. |
| Un produit  -  média principal | N:1 | Un produit peut avoir un média principal et une galerie future. |
| Un média  -  contenus | 1:N | Un média peut illustrer plusieurs contenus. |
| Un témoignage  -  consentement | 1:1 | La date de consentement est obligatoire avant publication. |
| Un message  -  agent | N:1 | Un message peut être assigné à un utilisateur. |
| Un contenu  -  révisions | 1:N | Chaque version conserve un snapshot immuable. |

## 4. Règles spécifiques aux Produits

RG-020  -  `reference` et `slug` sont uniques.

RG-021  -  Un produit publié doit posséder : nom FR/EN, résumé FR/EN, description FR/EN, catégorie FR/EN, disponibilité FR/EN, SEO FR/EN et texte alternatif FR.

RG-022  -  Une caractéristique produit est stockée sous forme structurée, par exemple `{ "label_fr": "Compatibilité", "value_fr": "..." }`, et non comme HTML libre non contrôlé.

RG-023  -  Le CTA produit ne peut pointer que vers une route interne autorisée ou une URL HTTPS validée.

RG-024  -  Un produit `draft` ou `archived` n’apparaît ni dans le catalogue, ni dans la recherche, ni dans les sections mises en avant.

RG-025  -  La modification d’un produit publié crée une nouvelle révision ; l’ancienne version reste restaurable.

## 5. Règles spécifiques aux événements

RG-030  -  Un événement possède une date de début, un titre, un résumé, un lieu et les contenus FR/EN requis.

RG-031  -  Un événement passé reste consultable s’il est publié, mais n’est plus présenté comme prochain événement.

RG-032  -  L’API événements n’expose aucun champ de paiement, panier, billet, prix ou commande.

RG-033  -  L’export ICS est généré uniquement pour un événement publié.

## 6. Intégrité référentielle

- Les références vers un média supprimé deviennent `NULL` ou bloquent la suppression si le média est obligatoire.
- La suppression d’une formation supprime ses sessions par `ON DELETE CASCADE`.
- La suppression d’une expertise ne supprime jamais les projets ou réalisations ; elle met la relation à `NULL` et déclenche une alerte éditoriale.
- La suppression d’un utilisateur conserve les contenus et remplace l’auteur par `NULL` dans les journaux.
- Les tables de liaison utilisent une clé primaire composite pour empêcher les doublons.
- Les chemins de redirection source sont uniques.
- Les statuts et les valeurs de type sont limités par des enums ou des contraintes.
- Les dates de fin ne peuvent pas précéder les dates de début.

## 7. Règles médias et accessibilité

- Types acceptés : JPEG, PNG, WebP, AVIF et PDF selon l’usage.
- Taille maximale recommandée : 20 Mo par fichier.
- Chaque image publiée doit avoir un texte alternatif en français ; l’anglais est requis si l’image est exposée sur la version anglaise.
- Le nom de fichier fourni par l’utilisateur est neutralisé avant stockage.
- Les SVG arbitraires sont refusés au départ pour réduire le risque XSS ; ils pourront être ajoutés après pipeline de sanitation dédié.

## 8. Règles données personnelles

- Le formulaire collecte uniquement les données nécessaires à la réponse.
- Le consentement est horodaté et lié au message.
- Les adresses IP et user-agents sont hachés, jamais conservés en clair dans la table métier.
- Les demandes d’accès, rectification et suppression sont traitées par un administrateur selon la politique de conservation.
