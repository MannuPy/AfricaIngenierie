# Rapport d’audit complet de la plateforme locale

Date : 28 août 2026  
Périmètre : Docker Compose, Next.js public, Payload CMS, PostgreSQL, MinIO, Mailpit et Nginx.  
Références : cahier des charges et `standalone.html`.

## Conclusion exécutive

Le socle local est exploitable pour poursuivre le développement. Les services
sont sains, les routes principales répondent, le RBAC est couvert, le flux
Produit « modification → publication → catalogue → détail » passe en E2E, et
les sauvegardes PostgreSQL et MinIO ont été restaurées avec succès.

Aucun défaut critique ou élevé ne reste ouvert dans le périmètre vérifiable en
local. Les contrôles Lighthouse, axe-core, CVE, OWASP ZAP et SMTP réel ne sont
pas installés dans cet environnement ; ils restent des conditions de recette
avant production.

## Mise à jour après préparation Oracle Cloud

Depuis l’exécution initiale de cet audit, les corrections et livrables suivants
ont été ajoutés :

- la création anonyme directe de `contact-messages` est refusée par le CMS ;
- les images standalone `web`, `cms`, `cms-migrator`, `nginx` et `backup` sont
  construites en runtime non-root lorsque le service le permet ;
- le Compose Oracle est autonome, avec réseaux frontend/backend séparés,
  migrations avant démarrage, TLS bootstrap, sauvegardes chiffrées et rotation ;
- MinIO reste privé et le CMS reçoit un compte applicatif limité au bucket média ;
- le workflow CI GitHub et le script `scripts/ci-check.sh` valident typecheck,
  lint, build, Compose et tests ;
- la suite CMS vérifiée dans le conteneur local est passée à **76/76 tests**.

Ces éléments ne remplacent pas les contrôles externes de performance,
d’accessibilité, de vulnérabilités et de SMTP réel listés ci-dessous.

## Tableau de recette

| Test | Résultat | Preuve | Sévérité | Correction | Statut |
|---|---|---|---|---|---|
| Services Docker/healthchecks | 6 services sains | `docker compose ps` : cms, web, nginx, PostgreSQL, MinIO, Mailpit healthy | Critique | Aucune | PASS |
| Routes/navigation | 30 routes couvertes ; pages FR/EN spot-checkées | `scripts/check-routes.mjs`, codes attendus 200/404/308 | Élevée | Proxy et chemins d’accueil corrigés | PASS |
| API événements | Contrat et HTTP conformes | 6 tests OpenAPI + liste/détail/ICS/OpenAPI en 200, 400 et 404 | Élevée | Validation, locale, pagination, cache, champs descriptifs | PASS |
| Publication Produit | Flux réel validé | E2E : 4/4, publication puis catalogue et détail | Critique | Revalidation signée avec 3 tentatives | PASS |
| Prévisualisation draft | Protégée | Token court signé et contrôle d’accès testés | Élevée | Aucun accès anonyme accepté | PASS |
| Erreur de revalidation | Ancienne version conservée | E2E webhook indisponible + audit de livraison | Élevée | Retry borné et `recordDeliveryFailure` | PASS |
| Formulaire contact | Validation/anti-abus actifs | 201 honeypot neutre, 422 champs manquants, 429 au dépassement | Élevée | Rate limit Nginx + applicatif, taille 32 KiB, hachage IP/UA | PASS |
| Médias | Média public servi | JPEG HTTP 200, `image/jpeg`, 215 Ko ; schéma MediaAssets testé | Élevée | Types, taille, alt FR/EN et MinIO | PASS |
| Admin/réglages | Admin accessible et login protégé | `/admin` vers login ; mauvais identifiants 401 ; collections rendues | Élevée | Routes Payload et états vérifiés | PASS |
| RBAC | Trois rôles/refus couverts | `tests/rbac.test.ts` : 22 tests, Éditeur/Publicateur/suspendu | Critique | Permissions et transitions conservées | PASS |
| Suite CMS | 75/75 tests passés ; ciblée 18/18 | Vitest complet après reconstruction pnpm, dont RBAC 22, schéma 9 et contrat 6 | Élevée | Volumes pnpm recréés et workspace ciblé | PASS |
| En-têtes | Présents public/API/admin | CSP, nosniff, SAMEORIGIN, Referrer-Policy, Permissions-Policy, COOP, noindex admin | Élevée | CSP et snippet Nginx ajoutés | PASS |
| Cookies/auth | Politique de production codée | Session Payload ; `Secure` à vérifier sur HTTPS réel | Moyenne | Vérification non intrusive en local | À compléter |
| Sanitation/validation | Validations serveur présentes | Schémas, transitions bilingues et tests CMS | Élevée | Aucune régression | PASS |
| Uploads | Contraintes présentes | JPEG/PNG/WebP/AVIF/PDF, SVG refusé, 20 MiB, alt bilingue | Élevée | MIME/taille/stockage contrôlés | PASS |
| Secrets | Aucun secret local suivi | `git ls-files .env.local` vide ; fichier ignoré | Critique | Placeholders uniquement dans `.env.example` | PASS |
| Dépendances | Lockfile valide | Installation `--frozen-lockfile` réussie dans Docker | Moyenne | Volume `node_modules` reconstruit | PASS |
| Images Docker | Runtime épinglé | Digests PostgreSQL/MinIO/Mailpit/Nginx/mc ; config Compose valide | Élevée | Digests ajoutés et digest MinIO corrigé | PASS conditionnel |
| Accessibilité structurelle | Positif sur pages représentatives | H1 unique, labels, alt, skip-link et `:focus-visible` | Élevée | Structure et styles conservés | PASS partiel |
| axe-core | Non exécuté | Runner dédié absent ; dépendance seulement transitive dans lockfile | Moyenne | Ajouter axe-Playwright en CI | À faire |
| Clavier/focus | Styles présents, interaction inconclusive | Focus CSS vérifié ; Tab automatisé non concluant | Moyenne | Refaire avec Playwright de recette | À faire |
| Responsive | Aucun débordement | 320, 390, 768, 1440 : `scrollWidth == clientWidth`, alt OK | Élevée | Aucun correctif requis | PASS |
| Performance | Warm acceptable, cold dev lent | Routes warm généralement <2 s ; compilation Next dev >10 s possible | Moyenne | Mesurer build production | À faire |
| Lighthouse mobile | Non exécuté | Binaire absent ; objectifs ≥90 non déclarés atteints | Moyenne | Installer Lighthouse CI | À faire |
| SEO metadata | FR/EN corrects | title, description, canonical ; `/fr` et `/en` sans slash final | Élevée | SEO centralisé et `homePath` corrigé | PASS |
| sitemap/robots | HTTP 200 | `/sitemap.xml` XML ; `/robots.txt` avec sitemap | Élevée | Routes metadata ajoutées | PASS |
| Redirection 301 | Validée | Ancienne URL Produit → nouvelle URL en 301 | Élevée | Lookup CMS dans proxy | PASS |
| Backup PostgreSQL | Restauré | `postgres_restore_ok`, 100 tables dans base temporaire | Critique | Procédure testée puis base temporaire supprimée | PASS |
| Backup MinIO | Restauré | `minio_restore_ok`, 260 objets source/restaurés | Critique | Bucket temporaire supprimé après test | PASS |

## Détails fonctionnels

Le script `scripts/check-routes.mjs` couvre les pages d’accueil, expertises,
réalisations, projets, formations, événements, produits, à propos, contact,
mentions légales, confidentialité et 404 dans les deux langues. Le changement
de langue conserve la page via les segments localisés (`/fr/produits` ↔
`/en/products`, `/fr/formations-evenements` ↔ `/en/training-events`).

Payload valide, versionne et audite les contenus. Le webhook signé déclenche la
revalidation Next.js ; une panne est observée et ne supprime pas la version
publique précédente. L’API événements filtre `editorialStatus=published` et
n’expose aucun prix, paiement, billet, panier ou commande. Les réponses 400/404
et les bornes de pagination sont cohérentes.

## Sécurité

La CSP, `nosniff`, `SAMEORIGIN`, Referrer-Policy, Permissions-Policy et COOP
sont injectés par Nginx ; l’admin est `noindex, nofollow, noarchive`. Le contact
dispose d’un honeypot, d’une taille maximale, de limites Nginx/applicative et de
hachages d’identifiants réseau. Les uploads sont restreints par type, taille et
alt bilingue. `.env.local` est ignoré et non suivi. Les images runtime sont
immuables par digest, mais aucun scanner CVE n’est présent pour certifier
l’absence de vulnérabilité.

## Accessibilité, responsive et performance

Le contrôle navigateur/statique a trouvé des labels, des alt, un H1 et aucun
débordement aux quatre largeurs demandées. Le focus visible est défini dans
`packages/ui/src/styles/base.css`. Axe-core et la séquence clavier complète
doivent être ajoutés à la CI ; ils sont explicitement non validés ici.

Les temps de développement sont gonflés par la compilation à la demande.
Lighthouse doit être exécuté sur une build production pour valider Performance
et Accessibility ≥90 et l’objectif de chargement inférieur à deux secondes.

## SEO et sauvegardes

Les métadonnées bilingues, canoniques, alternates, `robots.txt`, sitemap
dynamique et 301 CMS sont présents. Les URLs d’API et ICS utilisent le domaine
public configuré, jamais l’origine interne du conteneur. Les restaurations
PostgreSQL et MinIO ont été réalisées dans des cibles temporaires isolées puis
nettoyées.

## Corrections réalisées pendant l’audit

1. CSP et limite Nginx sur `/api/contact` ; honeypot, taille et hachage réseau.
2. `robots.ts`, `sitemap.ts`, canoniques d’accueil et redirections 301 CMS.
3. Retries bornés du webhook avec journalisation sans perte de version valide.
4. URLs publiques de l’API événements et de l’ICS corrigées.
5. Images Docker épinglées par digest ; digest MinIO invalide corrigé.
6. Volumes pnpm recréés pour restaurer l’exécution Vitest.

## Actions avant production

1. Installer axe-Playwright, Lighthouse CI, Trivy/Docker Scout et OWASP ZAP.
2. Tester HTTPS/HSTS, cookies sécurisés, SMTP réel et seuils de rate limit.
3. Mesurer une build production et retirer les assouplissements CSP de dev.
4. Planifier conservation/restauration périodique et remplacer les démos.

## Verdict

**PASS LOCAL / GO CONDITIONNEL RECETTE PRODUCTION** : aucun problème critique
ou élevé ouvert dans les fonctionnalités testées ; les outils de certification
non présents restent des conditions explicites avant déploiement.
