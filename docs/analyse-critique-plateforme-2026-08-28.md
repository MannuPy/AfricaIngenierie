# Analyse critique de la plateforme Africa Ingénierie

Date : 28 août 2026  
Périmètre : `apps/web`, `apps/cms`, `packages/ui`, `packages/validation`, Docker Compose, Nginx, PostgreSQL, MinIO, tests et documentation.

> Mise à jour après corrections : ce document conserve les constats de l'audit
> initial comme historique. Les points P0 relatifs au contact et aux images de
> production ont été traités ; le statut courant est décrit dans le rapport de
> recette et dans le guide Oracle Cloud.

## 1. Synthèse exécutive

Le projet possède un socle sérieux pour le développement local : séparation Next.js / Payload, PostgreSQL et MinIO isolés par réseaux Docker, contenus bilingues, workflow éditorial, audit, revalidation signée, API événements, tests RBAC et test de publication Produit de bout en bout.

Il ne doit toutefois pas encore être présenté comme prêt pour la production. Les lacunes les plus importantes sont :

1. l’accès anonyme direct à la collection Payload `contact-messages` (constat
   historique, désormais fermé par un secret interne) ;
2. l’absence d’une vraie image Docker de production (constat historique,
   désormais corrigé par les images standalone non-root) ;
3. une CSP compatible développement avec `unsafe-inline` et `unsafe-eval`, sans profil strict de production ni HSTS actif ;
4. l’absence initiale de pipeline CI/CD et de scanners automatisés (un workflow
   CI et un script de contrôle sont maintenant fournis ; les scanners externes
   restent à brancher) ;
5. le rendu initial des images avec `<img>` original sans `srcset` ni `sizes`,
   désormais corrigé par les variantes Payload ;
6. le décalage documentaire initial, corrigé dans les documents principaux.

Le verdict est donc : **bon socle local, mise en production conditionnelle après traitement des priorités P0 et P1**.

## 2. Méthode et niveau de preuve

Les conclusions reposent sur la lecture du code, des migrations, des fichiers Compose/Nginx, des tests et du rapport de recette local existant. Les éléments sont classés ainsi :

- **Avéré** : visible directement dans le dépôt ou reproduit par les tests locaux ;
- **À confirmer** : nécessite un outil ou un environnement non disponible ici, par exemple Lighthouse, axe-core, ZAP, Trivy, SMTP réel ou HTTPS public.

Les tests déjà recensés sont positifs pour le démarrage Docker, les routes, le RBAC, l’API événements, le flux de publication Produit, la prévisualisation sécurisée, les médias et la restauration PostgreSQL/MinIO. Ils ne remplacent pas une validation de production.

## 3. Tableau de priorités de l'audit initial et statut actuel

Les actions P0/P1 ci-dessous sont conservées pour la traçabilité de l'audit.
Les entrées marquées « corrigé » ne constituent plus un blocage ; les contrôles
externes restent explicitement à exécuter sur une recette HTTPS.

| Priorité | Sujet | Constat | Risque | Action recommandée | Statut |
|---|---|---|---|---|---|
| P0 | Contact | Constat historique : `ContactMessages.create` était ouvert au public dans Payload | Spam, stockage abusif, contournement du hachage, du honeypot et du rate limit | Création anonyme refusée ; seule la route serveur dédiée avec secret interne écrit | Corrigé |
| P0 | Production Docker | Constat historique : Compose réutilisait l’image et les commandes de développement | Déploiement lent, code source exposé, surface d’attaque et comportement non reproductible | Images multi-stage standalone, runtime non-root, absence de bind mounts en production | Corrigé |
| P0 | CSP/TLS | Le profil de développement autorise encore des assouplissements ; le profil production est strict et HSTS dépend du TLS actif | XSS plus facile à exploiter et absence de garantie HTTPS en local | Utiliser uniquement le template production après certificat, puis vérifier les cookies Secure | Partiel, recette HTTPS requise |
| P0 | Livraison | Le workflow CI et le script de contrôle sont présents ; les scanners externes ne sont pas encore branchés | Régression ou vulnérabilité livrée sans contrôle | Ajouter Trivy/ZAP, axe et Lighthouse dans la CI | Partiel |
| P1 | Contrat CMS | `response.json()` est casté directement en types TypeScript dans `cms.ts` | Un changement Payload peut produire une page vide ou incohérente sans erreur explicite | Valider les réponses avec Zod ou générer un client typé ; distinguer erreur amont, absence légitime et contenu invalide | À améliorer |
| P1 | Images | Constat historique : `<img>` utilisait l’original, sans `srcset` ni `sizes` | Poids inutile sur mobile et LCP dégradé | Variantes Payload `thumbnail`/`card`/`hero` exposées avec `srcset` et `sizes` | Corrigé |
| P1 | Redirections | La collection `redirects` n’est plus lisible anonymement ; le proxy utilise une capacité interne dédiée | Inventaire des anciennes URL exposé inutilement | Conserver le secret interne hors dépôt et vérifier sa rotation | Corrigé |
| P1 | Médias | Le bucket MinIO de production est privé ; les médias explicitement publics passent par Payload | Énumération de médias et absence de séparation public/privé | Ajouter des URL signées pour les fichiers privés et un scan antivirus upload | Partiel |
| P1 | RBAC | Les rôles et transitions serveur sont couverts par les tests ; une MFA admin reste souhaitable | Dépublication ou archivage involontaire | Maintenir les tests de transition et ajouter MFA avant exploitation sensible | Partiel |
| P1 | Conservation | `retentionUntil` existe ; le nettoyage métier reste distinct des sauvegardes | Non-respect de la durée annoncée | Sauvegardes chiffrées, rotation et procédure fournies ; automatiser l’anonymisation métier après validation juridique | Partiel |
| P1 | Documentation | Les documents principaux sont synchronisés ; les constats historiques restent signalés comme tels | Mauvaise compréhension du périmètre réel | Mettre à jour tout nouveau changement dans le README et le dossier docs | Corrigé |
| P2 | UX mobile | Escape, clic extérieur et restitution du focus sont gérés ; le piège de focus complet reste à vérifier | Parcours clavier moins prévisible | Ajouter un test navigateur clavier et, si nécessaire, un focus trap | Partiel |
| P2 | Design system | Plusieurs styles inline et transitions dispersées | Maintenance visuelle plus coûteuse | Centraliser espacements, couleurs et états dans les tokens UI | À améliorer |
| P2 | Observabilité | Logs structurés limités à `console` et logger Payload, sans corrélation ni métriques | Diagnostic lent en production | Ajouter request-id, erreurs centralisées, métriques de latence, revalidation, SMTP et DB | À améliorer |

## 4. Design et UX/UI

### Points forts

- La charte du prototype est reprise dans `packages/ui` avec des tokens, une hiérarchie typographique et des composants partagés.
- Le site dispose d’un skip-link, d’un focus visible, de labels de formulaires, d’alternatives textuelles et d’un menu responsive.
- La navigation bilingue conserve la page courante grâce aux segments localisés.
- Les tests locaux ont vérifié les largeurs 320, 390, 768 et 1440 pixels sans débordement sur les pages représentatives.
- Les formulaires CMS sont regroupés par onglets Contenu, Détails, Visuels et SEO, ce qui réduit la charge cognitive.

### Faiblesses et améliorations

Le design public reste parfois trop dépendant des états de démonstration : une carte peut devenir une plaque de remplacement, et la cohérence du contenu dépend du seed. Il faut distinguer visuellement un média manquant d’un contenu réel et bloquer la publication lorsqu’un visuel obligatoire est absent.

Les cartes publiques utilisent encore la classe `ruled`, qui ajoute une ligne d’accent au survol. Si la règle produit exige qu’aucun trait indicatif ne soit visible dans les pages publiques, cette règle doit être supprimée du composant `Card` et couverte par un test visuel.

Le menu mobile est fonctionnel mais doit gérer le focus, Escape et le retour du focus sur le bouton. Les transitions doivent toutes respecter `prefers-reduced-motion`, pas seulement les skeletons. Il faut exécuter axe-core et un parcours clavier complet sur chaque gabarit, car les contrôles statiques ne prouvent pas l’accessibilité réelle.

Pour l’administration, le dashboard Payload reste principalement l’interface native. Le design system d’administration est utile pour les maquettes, mais ne garantit pas que toutes les pages `/admin` utilisent effectivement ces styles. La priorité UX est donc d’améliorer les libellés, descriptions, erreurs de validation et regroupements Payload avant d’ajouter de la décoration.

## 5. Architecture logicielle

### Évaluation

La séparation web public / CMS est saine : Next.js lit Payload via `CMS_INTERNAL_URL`, et le site ne lit pas directement PostgreSQL. La fabrique `contentCollection` centralise workflow, audit, versions, auteurs, SEO et prévisualisation. Cette mutualisation limite les oublis lorsqu’une nouvelle collection est ajoutée.

Les limites sont les suivantes :

- la couche d’accès CMS est un client REST maison, avec types partiels mais sans validation runtime ;
- `openapi-evenements.yaml` et `openapi-events.ts` sont deux sources manuelles susceptibles de diverger ;
- la logique de redirection est appelée dans le proxy sur le chemin des pages, ce qui ajoute une dépendance CMS à chaque navigation froide ;
- les opérations internes utilisant `overrideAccess` sont légitimes pour seed et maintenance, mais doivent être encapsulées dans une API de service très limitée et auditée ;
- l’absence de queue durable signifie que la revalidation repose sur le traitement de la requête Payload. Le retry borné protège le contenu, mais ne remplace pas une file persistante si le volume augmente.

### Recommandations

Adopter un BFF public ou un module de projection typé entre Payload et Next.js. Il exposerait uniquement les champs utiles, appliquerait validation, cache et observabilité, et éviterait de lier chaque page au format REST Payload.

Générer le contrat OpenAPI depuis une source unique ou valider automatiquement le document servi contre le YAML de référence. Pour la montée en charge, remplacer l’appel de redirection par un cache local court, un export versionné ou une table de lookup dédiée.

## 6. Base de données

### Points positifs

- PostgreSQL est le stockage relationnel adapté au workflow, au bilinguisme et à l’audit.
- Les migrations Payload sont versionnées et `push: false` évite le drift silencieux du schéma.
- Les relations principales ont des clés étrangères et des suppressions cohérentes, avec conservation des traces d’audit.
- Les indexes existent sur slugs, statuts, dates, références, médias et échéances de conservation.

### Points faibles

- Le MPD de `docs/mpd-postgresql.sql` est une référence de conception et non le schéma réellement exécuté ; il ne doit pas être présenté comme une photographie exacte de PostgreSQL.
- Les migrations générées doivent être comparées régulièrement à `payload.config.ts`. Le champ `alt_en` apparaît nullable dans la migration initiale alors que le modèle le déclare requis : cette divergence doit être vérifiée dans la base réelle et corrigée par migration si nécessaire.
- Les requêtes publiques filtrent fréquemment par statut puis trient ou filtrent par date. Des indexes composites, par exemple `(editorial_status, starts_at)`, doivent être décidés après `EXPLAIN ANALYZE`, pas ajoutés à l’aveugle.
- Les champs textuels et certaines règles métier sont validés par l’application, mais pas renforcés par des contraintes SQL. Les invariants critiques doivent être doublés lorsque Payload le permet.
- `maxPerDoc: 50` ne constitue pas une politique de rétention des versions. Il faut définir ce qui est conservé, archivé et purgé.

## 7. Sécurité

### Constat critique

L’audit initial avait constaté `create: () => true` sur `ContactMessages`. Le
correctif actuel exige `x-internal-contact-secret` et la route `/api/contact`
reste l’unique entrée prévue pour le navigateur. Le test RBAC vérifie désormais
qu’une création anonyme directe est refusée.

### Autres constats

- Les rôles sont bien contrôlés côté serveur, mais le graphe de transition doit être explicite, notamment pour les actions du Publicateur.
- Les comptes bénéficient d’un verrouillage et d’une expiration de session, mais l’absence de MFA laisse une protection importante à ajouter pour les comptes administrateurs.
- L’audit est append-only et retire plusieurs clés sensibles. Il devrait également prévoir une politique de taille, de masquage des données personnelles, d’export contrôlé et d’archivage immuable.
- Les médias sont limités par MIME, taille et texte alternatif, mais un antivirus, une inspection de contenu et une politique public/privé renforceraient la chaîne upload.
- La CSP active reste une CSP de développement. La production doit utiliser des origines explicites, supprimer `unsafe-eval`, limiter les scripts inline et activer HSTS avec TLS.
- Les secrets locaux ne sont pas suivis par Git, ce qui est positif. Il faut néanmoins faire échouer le déploiement si une valeur `change-me`, une clé faible ou un secret de développement est détecté.

## 8. Performance et montée en charge

Le temps de démarrage lent observé en local est principalement expliqué par `next dev`, la compilation à la demande et les bind mounts Windows vers Docker. Cela ne permet pas de conclure sur les performances de production.

Les améliorations prioritaires sont :

- construire et mesurer une image production ;
- remplacer les originaux d’images par les variantes Payload ;
- précharger uniquement le visuel hero réellement critique ;
- limiter les polices chargées au sous-ensemble réellement utilisé ;
- conserver le cache de lecture CMS mais mesurer son taux de hit ;
- mettre en cache la résolution des redirections ;
- ajouter des timeouts et budgets pour CMS, PostgreSQL, MinIO et SMTP ;
- exécuter Lighthouse mobile avec objectif Performance et Accessibility supérieur ou égal à 90 ;
- exécuter un test de charge k6 ou Artillery sur pages publiques, API événements et contact.

## 9. Qualité, tests et déploiement

La suite CMS est une bonne base : tests de schéma, seed, authentification, workflow, RBAC, contrat API et publication E2E. La séparation entre base de test et base de travail est une décision saine.

La couverture externe reste incomplète : le workflow CI et le script de contrôle
sont présents, mais aucun test navigateur public complet, axe-core, Lighthouse
ou scan CVE/ZAP n’a encore été exécuté dans cet environnement. Le test E2E de
publication doit utiliser une base jetable en CI.

Pipeline recommandé :

1. installation avec lockfile strict et cache pnpm ;
2. formatage, lint et typecheck ;
3. migration sur PostgreSQL vierge puis tests CMS ;
4. test de contrat OpenAPI ;
5. tests Playwright publics et admin, incluant langues, publication et refus RBAC ;
6. axe-core, snapshots visuels et tests responsive ;
7. build production et smoke tests ;
8. Lighthouse mobile sur build, seuils bloquants ;
9. audit dépendances, scan image Docker et DAST ;
10. publication d’image immuable puis déploiement avec migration contrôlée et rollback documenté.

## 10. Alternatives techniques

| Décision | Option actuelle | Alternative | Avantage de l’alternative | Coût ou inconvénient |
|---|---|---|---|---|
| Images | `<img>` + variantes Payload | `next/image` ou proxy d’images | Optimisation automatique, tailles adaptées | Configuration des domaines internes et contrôle du cache |
| Accès contenu | REST Payload interne | BFF typé ou GraphQL généré | Contrat stable et projection minimale | Couche supplémentaire à maintenir |
| Revalidation | Webhook HMAC direct | Queue durable, par exemple Redis/BullMQ | Reprise après panne et débit contrôlé | Infrastructure et supervision supplémentaires |
| Stockage | MinIO sur VPS | S3/OVH Object Storage | Durabilité et gestion opérationnelle externalisées | Coût mensuel, dépendance fournisseur |
| Reverse proxy | Nginx | Cloudflare ou Traefik | TLS, WAF et cache simplifiés | Dépendance externe ou nouvelle complexité |
| Auth admin | Session Payload + mot de passe | MFA ou SSO OIDC | Réduction forte du risque de compte compromis | Administration des identités et dépendance IdP |

## 11. Feuille de route recommandée

### Sprint 0, avant toute exposition

- vérifier en recette la création directe `contact-messages` désormais fermée ;
- déployer les images Docker de production sans bind mount ;
- activer le profil CSP/TLS/HSTS production après émission du certificat ;
- exécuter le workflow CI et ajouter les scanners externes ;
- vérifier le schéma réel `alt_en`, les droits médias et les valeurs de configuration.

### Sprint 1, fiabilisation

- ajouter validation runtime des réponses CMS ;
- ajouter les indexes composites après analyse des plans ;
- valider la politique de conservation et automatiser l’anonymisation métier ;
- centraliser OpenAPI ;
- ajouter Playwright, axe-core, Lighthouse et snapshots visuels ;
- intégrer une observabilité avec request-id, métriques et alertes.

### Sprint 2, qualité produit

- améliorer focus et navigation clavier du menu mobile ;
- rationaliser les styles inline et les états de chargement ;
- finaliser les textes, droits médias, coordonnées et documents juridiques réels ;
- tester la charge et le comportement de cache ;
- préparer le déploiement Oracle Cloud avec rollback et procédure d’incident.

## 12. Vision prospective

La plateforme peut évoluer vers un véritable socle éditorial B2B si les frontières sont conservées : site public stateless, CMS privé, projection API stable, médias séparés, événements descriptifs indépendants de toute billetterie, et audit exploitable.

À moyen terme, les évolutions les plus pertinentes sont MFA/SSO, file de revalidation, recherche structurée, cache CDN, stockage objet managé, monitoring de parcours et tableau de bord éditorial basé sur des indicateurs de publication. Il faut éviter d’ajouter des fonctionnalités commerciales dans le module événements tant qu’un besoin métier distinct n’a pas été validé.

## Conclusion

Le projet est cohérent pour poursuivre le développement local et dispose de
plusieurs protections correctement pensées. L’exposition directe de
`contact-messages` et la fausse production Docker ont été corrigées ; la CSP de
développement reste volontairement permissive, tandis que le profil de
production est fourni.

La priorité est maintenant d’exécuter la recette HTTPS et les contrôles externes
sur le VPS : scan de sécurité, Lighthouse, axe-core, SMTP réel, conservation et
test de restauration automatisé.
