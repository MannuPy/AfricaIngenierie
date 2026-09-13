# Matrice de traçabilité des exigences

État vérifié le 28/08/2026. Les lignes qui mentionnent une fonction partielle
décrivent un élément documenté ou préparé, mais pas encore disponible de bout
en bout.

| Exigence | Réponse technique | Document de référence | Preuve de recette |
|---|---|---|---|
| Plateforme dynamique administrable | Payload CMS + collections + revalidation ISR | `architecture-et-uml.md`, `regles-de-gestion.md` | Modification admin visible sur le public |
| Module Produits | Collection `products`, page catalogue et détail | `mpd-postgresql.sql`, `regles-de-gestion.md` | Création/publication/dépublication d’un produit |
| Réglages globaux | Singleton `site_settings`, navigation, légal, cookies, SEO | `mpd-postgresql.sql` | Modification du logo, menu, footer et meta |
| FR/EN | Champs bilingues et stratégie de repli | `mcd-mld.md`, `regles-de-gestion.md` | Parcours FR/EN sans écran vide |
| Rôles 2 × 3 | RBAC Administrateur/Publicateur/Éditeur | `comptes-dev-local.md` | Tests d’accès et refus de publication |
| Historique | `revisions` et `audit_logs` append-only | `mpd-postgresql.sql` | Vérification d’une publication et restauration |
| Sécurité | TLS local, CSP, sanitation et secrets hors Git ; rate limit contact partiel | `plan-recette-securite.md` | Headers et RBAC passés ; durcissement contact et ZAP à faire |
| Cookies | Consentement et chargement conditionnel des tiers | `politique-conservation-donnees.md` | Acceptation, refus et retrait |
| SEO | Metadata par page, canonical, hreflang, OG, sitemap | `urls-et-redirections.md` | Lighthouse et inspection HTML |
| Performance | Next.js SSR/ISR, images optimisées, cache | `plan-recette-securite.md` | Lighthouse mobile ≥ 90 |
| Événements sans paiement | Périmètre et contrat OpenAPI documentés ; routes non livrées | `openapi-evenements.yaml` | Implémentation et validation OpenAPI à faire |
| Développement local | Docker Compose, PostgreSQL, SeaweedFS/S3, SMTP test | `environnement-local-docker.md` | Démarrage local reproductible |
| Migration Framer | Nouvelles URL et redirections 301 | `urls-et-redirections.md` | Crawl sans 404 sur l’inventaire fourni |
| Médias IA de démonstration | Seeds et médias marqués démonstration | `architecture-et-uml.md` | Vérification droits/alt text avant production |

## Décisions restant à valider

- adresse professionnelle des six comptes de production ;
- textes juridiques définitifs ;
- durées de conservation définitives ;
- inventaire des anciennes URL Framer ;
- logo et médias définitifs ;
- nom de domaine et sous-domaine admin ;
- mode MFA et politique de mot de passe ;
- stratégie de repli lorsqu’une traduction anglaise manque.
