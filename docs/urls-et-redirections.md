# Plan des URL, canonicals et redirections

## 1. Convention retenue

- URL publiques en minuscules ASCII.
- Locale explicite dans le chemin : `/fr/` et `/en/`.
- Slugs métier stables et sans accents.
- Pas de paramètre pour la langue.
- Une URL canonique par contenu et par locale.
- Redirection 301 depuis les anciennes URL Framer après inventaire complet.

Le domaine de production retenu pour le déploiement est `ingenierieafrica.com`.
Les chemins ci-dessous sont les chemins canoniques indépendants du domaine.

## 2. Nouvelles URL publiques

| Fonction | Français | English |
|---|---|---|
| Accueil | `/fr/` | `/en/` |
| Expertises | `/fr/expertises` | `/en/expertises` |
| Expertise détail | `/fr/expertises/{slug}` | `/en/expertises/{slug}` |
| Réalisations | `/fr/realisations` | `/en/realisations` |
| Réalisation détail | `/fr/realisations/{slug}` | `/en/realisations/{slug}` |
| Formations & événements | `/fr/formations-evenements` | `/en/training-events` |
| Formation détail | `/fr/formations/{slug}` | `/en/training/{slug}` |
| Événements | `/fr/evenements` | `/en/events` |
| Événement détail | `/fr/evenements/{slug}` | `/en/events/{slug}` |
| Produits | `/fr/produits` | `/en/products` |
| Produit détail | `/fr/produits/{slug}` | `/en/products/{slug}` |
| À propos | `/fr/a-propos` | `/en/about` |
| Contact | `/fr/contact` | `/en/contact` |
| Mentions légales | `/fr/mentions-legales` | `/en/legal-notice` |
| Confidentialité | `/fr/confidentialite` | `/en/privacy-policy` |

`Formations & événements` est un regroupement de navigation et de présentation. Les ressources restent distinctes dans le CMS et l’API afin de permettre un filtrage et une maintenance propres.

## 3. URL d’administration

```text
/admin
/admin/collections/products
/admin/collections/expertises
/admin/collections/realisations
/admin/collections/formations
/admin/collections/events
/admin/globals/homepage
/admin/globals/site-settings
/admin/users
/admin/collections/audit-logs
```

En production, l’administration est servie sur le sous-domaine distinct
`admin.ingenierieafrica.com` et doit être protégée par une authentification forte.

## 4. API événements en lecture seule

```text
/api/events
/api/events/{slug}
/api/events/{slug}/calendar
/api/openapi.json
```

Ces routes sont exposées en lecture seule par le site public. Elles ne renvoient
que les événements publiés et leurs champs descriptifs, avec validation des
paramètres, locale FR/EN, pagination plafonnée, cache contrôlé et génération
ICS. Aucun champ de paiement, prix, billet, panier ou commande n'est exposé.

## 5. Redirections obligatoires

Les anciennes URL Framer doivent être exportées avant la mise en production. Le fichier de travail devra respecter ce format :

```csv
source_path,target_path,status_code,reason
/ancienne-page,/fr/nouvelle-page,301,Migration Framer
```

Redirections déjà identifiées pour la maquette autonome :

| Ancienne route prototype | Nouvelle route |
|---|---|
| `#/` | `/fr/` |
| `#/expertises` | `/fr/expertises` |
| `#/realisations` | `/fr/realisations` |
| `#/formations` | `/fr/formations-evenements` |
| `#/produits` | `/fr/produits` |
| `#/a-propos` | `/fr/a-propos` |
| `#/contact` | `/fr/contact` |

Les fragments `#/...` ne sont pas envoyés au serveur HTTP ; ils servent uniquement à la démonstration locale et ne remplacent pas l’inventaire des anciennes URL Framer.

## 6. Contrôles SEO des URL

- Chaque page possède une balise canonical.
- Chaque paire FR/EN possède des balises `hreflang` réciproques.
- Les contenus archivés renvoient vers une page pertinente ou une 410 selon décision éditoriale.
- Aucune redirection ne doit créer de boucle.
- Les pages 404 ne sont pas indexées.
- Les slugs modifiés créent automatiquement une redirection depuis l’ancien slug.
