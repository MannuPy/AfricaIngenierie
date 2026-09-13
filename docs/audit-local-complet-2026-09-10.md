# Audit complet de la plateforme locale — 10 septembre 2026

## 1. Conclusion exécutive

La plateforme démarre correctement, mais elle ne peut pas être déclarée entièrement fonctionnelle ni prête pour une recette complète dans son état observé.

Points validés :

* les six services Docker sont démarrés et indiqués healthy ;
* Nginx accepte sa configuration ;
* les contrôles TypeScript et ESLint passent ;
* l’accueil français, le contact, le catalogue produits, une fiche produit et les événements sont consultables ;
* le formulaire contient le téléphone et la sélection multiple des domaines ;
* la fiche produit contrôlée expose une vidéo et une présentation 360° ;
* le tri des événements place les événements futurs les plus proches avant les événements passés ;
* les en-têtes de sécurité et les limitations Nginx sont présents ;
* les collections d’administration testées sans session ne sont pas accessibles.

Blocages critiques constatés :

1. une transaction PostgreSQL inactive bloque des écritures et dégrade fortement les temps de réponse du CMS ;
2. plusieurs liens anglais générés par le site conduisent à des pages 404 ;
3. les pages légales ne sont pas publiées ou ne sont pas résolues correctement ;
4. des données de démonstration non validées sont encore visibles sur la vitrine ;
5. la fiche produit contrôlée ne présente pas de bouton de téléchargement PDF ;
6. le lien de téléphone du pied de page est construit avec un préfixe tel: en double.

**Avis actuel : recette bloquée jusqu’à résolution du verrou PostgreSQL et des routes bilingues/légales.**

## 2. Périmètre et méthode

Périmètre local :

* site public : http://localhost:8080 ;
* administration : http://admin.localhost:8080 ;
* code : apps/web, apps/cms, packages partagés, Docker et Nginx ;
* base locale PostgreSQL, uniquement par lectures techniques anonymisées.

Contrôles effectués :

* état et santé des conteneurs ;
* test de syntaxe Nginx ;
* tests HTTP des routes ;
* inspection visuelle/accessibilité de pages publiques ;
* inspection de l’écran de connexion d’administration, sans soumettre d’identifiants ;
* vérification des en-têtes et règles de sécurité ;
* TypeScript et ESLint ;
* état des sessions PostgreSQL et des requêtes bloquées ;
* vérification statique des clés React et du carousel.

Ce rapport n’est ni un test d’intrusion externe ni une certification de conformité. Aucun mot de passe ou contenu personnel n’est recopié.

## 3. État de l’infrastructure locale

| Service | Résultat |
|---|---|
| ai-web | Up, healthy |
| ai-cms | Up, healthy |
| ai-nginx | Up, healthy |
| ai-postgres | Up, healthy |
| ai-minio | Up, healthy |
| ai-mailpit | Up, healthy |

La configuration Nginx a répondu : syntax is ok et test is successful.

Les ports Docker observés sont liés à la machine locale. Aucun service PostgreSQL, MinIO ou Mailpit n’est directement exposé sur une interface publique dans cette configuration de développement.

## 4. Matrice des routes principales

### 4.1 Routes publiques observées

| Route | Résultat | Observation |
|---|---:|---|
| /fr | 200 | Accueil français chargé |
| /fr/contact | 200 | Formulaire et coordonnées visibles |
| /fr/produits | 200 | Catalogue chargé |
| /fr/produits/table-appoint-forme-c | 200 | Vidéo et 360° visibles dans la fiche contrôlée |
| /fr/evenements | 200 | Liste chargée et tri cohérent |
| /fr/realisations | 200 | Route chargée |
| /fr/formations-evenements | 200 | Route chargée |
| /en | 404 | Le lien de langue de l’en-tête mène pourtant à cette adresse |
| /en/products | 404 | L’alias anglais attendu par le sélecteur de langue est indisponible |
| /en/events | 404 | L’adresse anglaise d’événements est indisponible |
| /en/about | 404 | L’adresse anglaise À propos est indisponible |
| /en/contact | 200 | Contact anglais chargé |
| /en/training-events | 200 | Page anglaise chargée |
| /fr/mentions-legales | 404 | Document légal publié introuvable |
| /fr/confidentialite | 404 | Document de confidentialité publié introuvable |
| /en/legal-notice | 404 | Variante anglaise indisponible |
| /en/privacy-policy | 404 | Variante anglaise indisponible |

Le site public répond sur localhost:8080, mais la même page appelée via 127.0.0.1:8080/fr a refusé ou dépassé le délai dans les contrôles effectués. Le script routes:check utilise par défaut 127.0.0.1 ; l’URL de base du script et la configuration de recette doivent être harmonisées.

Les liens visibles dans la page publique rendent ce défaut reproductible : le sélecteur EN de l’accueil pointe vers /en, et le sélecteur anglais du catalogue pointe vers /en/products, alors que ces adresses renvoient 404.

### 4.2 Administration et API

| Contrôle | Résultat | Observation |
|---|---:|---|
| admin.localhost:8080/admin/login | 200 | Écran de connexion visible |
| admin.localhost:8080/admin | 200 | Coquille Payload servie ; session non testée |
| admin.localhost:8080/api/users/me | 200 | Réponse d’état de session anonyme |
| admin.localhost:8080/api/contact-messages?limit=1 | 403 | Accès correctement refusé sans autorisation |
| admin.localhost:8080/api/globals/homepage | délai dépassé | Requête CMS bloquée par l’état PostgreSQL observé |
| admin.localhost:8080/api/products?limit=1 | délai dépassé | Même dégradation de disponibilité |
| admin.localhost:8080/api/testimonials?limit=1 | délai dépassé | Même dégradation de disponibilité |

Le parcours de publication dans le dashboard n’a pas été exécuté : il aurait nécessité de soumettre une session et de modifier des données. Il reste donc à valider après déblocage de la base.

## 5. Modules fonctionnels vérifiés

### Accueil

* logo affiché dans l’en-tête ;
* titre et texte de présentation présents ;
* carousel avec trois contrôles de visuels ;
* code du carousel configuré à 4 000 ms ;
* partenaires, expertises, produits, réalisations, actualités, témoignages et CTA présents.

Anomalie de contenu : la page affiche encore un logo Nike, un visuel Uber Eats et un portrait intitulé Portrait de Kylian Mbappé au Real Madrid. Ces données ressemblent à des valeurs de démonstration et ne doivent pas rester sur la vitrine de l’entreprise.

### Contact

* champ nom ;
* e-mail ;
* numéro de téléphone ;
* entreprise ;
* domaines d’intervention à sélection multiple ;
* description ;
* consentement ;
* coordonnées, téléphone, e-mail, WhatsApp et carte.

Anomalie : les liens de téléphone du pied de page sont rendus sous la forme tel:tel:+229..., alors que le lien du bloc principal Contact est correctement formé. Le pied de page ne doit conserver qu’un seul préfixe tel:.

Les liens Facebook et LinkedIn ne sont pas visibles dans l’état actuel des réglages publics. Cela peut être un choix de configuration vide, mais la recette doit vérifier que les champs de l’administration sont renseignés et que les icônes n’apparaissent qu’avec des URL valides.

### Produits

* catalogue de sept produits présents en base ;
* navigation vers les fiches ;
* fiche contrôlée avec image, référence, disponibilité et délai ;
* vidéo de présentation présente ;
* section Présentation 360° présente ;
* prix unitaire non affiché, cohérent avec la règle de devis.

Anomalie : la fiche contrôlée ne contient aucun lien ou bouton Télécharger la fiche PDF. Le champ peut être vide pour ce produit, mais il faut vérifier dans le dashboard que le champ PDF existe, que le fichier est bien associé et que le bouton public apparaît lorsqu’un PDF est publié.

### Événements

La liste française affiche actuellement les dates dans l’ordre suivant : 12 septembre 2026, 17 octobre 2026, puis 20 septembre 2025. Au 10 septembre 2026, cet ordre est conforme à la règle prochain événement le plus proche, puis les autres futurs, puis les passés.

### Administration

L’écran de connexion est accessible et présente les champs e-mail, mot de passe et récupération de mot de passe. L’interface affiche encore un badge de développement 1 Issue. Le détail de cet avertissement doit être ouvert et corrigé avant une recette finale ; un badge d’erreur ne doit pas être laissé visible dans un environnement de validation.

## 6. Dégradation PostgreSQL — priorité P0

État observé dans pg_stat_activity :

* une session idle in transaction depuis environ 9 heures ;
* cette session a pour dernière requête une lecture de audit_logs ;
* six écritures dans users attendent un verrou de type transactionid détenu par cette session ;
* les requêtes CMS ont été observées avec des durées de 5,7 à 6,2 minutes ;
* plusieurs appels HTTP ont expiré après 20 secondes ;
* Nginx a journalisé des timeouts vers des fichiers médias et l’application a journalisé des HeadersTimeoutError.

**Impact :** administration lente ou inutilisable, publications non fiables, tests instables, risque de connexions saturées et impossibilité de conclure sur le fonctionnement réel des écritures.

**Cause probable :** transaction de test ou de maintenance non clôturée. Cette hypothèse doit être confirmée à partir des journaux et du processus qui a ouvert la connexion.

Actions recommandées avant toute nouvelle recette :

1. identifier le propriétaire de la session bloquante ;
2. récupérer ou annuler proprement la transaction après validation de l’impact ;
3. vérifier le teardown des tests et la fermeture des clients PostgreSQL ;
4. définir idle_in_transaction_session_timeout côté PostgreSQL ;
5. ajouter des timeouts de requête et une alerte sur les transactions inactives ;
6. relancer les tests sur une base de test isolée ;
7. refaire la matrice HTTP après retour de temps de réponse normal.

Aucune session n’a été interrompue pendant l’audit.

## 7. Qualité du code et sécurité

| Contrôle | Résultat |
|---|---|
| TypeScript workspace/CMS/web | PASS, code de sortie 0 |
| ESLint workspace/CMS/web | PASS, code de sortie 0 |
| nginx -t | PASS |
| X-Request-ID | Présent sur la réponse publique contrôlée |
| X-Content-Type-Options | Configuré |
| X-Frame-Options | Configuré |
| Referrer-Policy | Configuré |
| Permissions-Policy | Configuré |
| CSP | Configurée, mais encore permissive pour le mode développement |
| Limitation login/contact/API admin | Configurée dans Nginx |
| Accès anonyme aux messages de contact | Refusé en 403 |

Le code du carousel et des onglets utilise des clés React combinant l’identifiant et l’index lorsque nécessaire. Le cas ancien key={item.title} observé dans le rapport précédent n’est plus présent dans story-tabs.tsx.

La CSP contient encore unsafe-eval et unsafe-inline pour permettre le développement Next.js et le hot reload. Elle doit être durcie dans le build de production, puis vérifiée avec les médias, YouTube et la carte.

## 8. Données techniques présentes

Compteurs anonymisés lus en base :

| Table | Nombre |
|---|---:|
| utilisateurs | 21 |
| produits | 7 |
| événements | 3 |
| témoignages | 9 |
| messages de contact | 2 |
| journaux d’audit | 15 800 |

Le nombre élevé de journaux est cohérent avec la traçabilité mise en place, mais la présence de 21 utilisateurs et de données de test doit être revue avant mise en production. Les données de démonstration ne doivent pas être confondues avec les données métier validées.

## 9. Plan de correction priorisé

### P0 — avant toute recette ou déploiement

* débloquer PostgreSQL et supprimer la cause des transactions laissées ouvertes ;
* vérifier que les API CMS répondent en quelques centaines de millisecondes à quelques secondes selon le mode ;
* corriger les liens de langue et fournir une page anglaise réellement publiée pour chaque entrée annoncée ;
* publier et tester les mentions légales et la politique de confidentialité dans les deux langues ;
* supprimer ou remplacer les logos, images et portraits de démonstration non validés.

### P1 — avant validation client

* rendre le téléchargement PDF visible lorsque le champ est renseigné ;
* corriger tel:tel: dans le composant du pied de page ;
* harmoniser localhost et 127.0.0.1 dans Nginx, les scripts de contrôle et la documentation locale ;
* tester la publication d’un témoignage, son retrait, la limite de cinq témoignages et le remplacement du plus ancien ;
* tester une modification des chiffres clés dans l’administration et sa répercussion publique ;
* tester les liens WhatsApp, Facebook et LinkedIn avec des réglages réels ;
* ouvrir le badge 1 Issue du dashboard et corriger l’avertissement ;
* exécuter un parcours administrateur complet après authentification sur une base de recette.

### P2 — durcissement et qualité

* passer le build de production sans unsafe-eval ;
* ajouter un timeout de transaction PostgreSQL et une alerte sur les sessions bloquantes ;
* exécuter axe-core, Lighthouse, Trivy, pnpm audit et un DAST depuis un environnement dédié ;
* tester les largeurs mobile, tablette et desktop ;
* confirmer sauvegarde, restauration, rotation des secrets et centralisation des logs.

## 10. Verdict initial

**Score de disponibilité de recette au moment de l’audit : non validé.**

Le socle technique est présent et plusieurs fonctions métier sont déjà visibles. Cependant, l’état de la base et les routes bilingues cassées empêchent de considérer la plateforme comme totalement fonctionnelle. Après résolution des P0, il faudra refaire cet audit, exécuter un vrai parcours de publication dans le dashboard et fournir les preuves de résultat côté public.

## 11. Corrections appliquées après l’audit

Le 10 septembre 2026, les corrections suivantes ont été appliquées et vérifiées sur la pile locale :

| Constat du rapport | Correction / vérification | État |
|---|---|---|
| Transaction PostgreSQL bloquante | Session obsolète arrêtée après identification, CMS redémarré proprement, fermeture ajoutée au script ponctuel, timeouts PostgreSQL configurés (`idle_in_transaction_session_timeout=60s`, `statement_timeout=120s`) | Corrigé |
| Routes anglaises et pages légales en 404 | Matrice HTTP relancée : les routes prévues répondent correctement, y compris les pages anglaises et légales | Corrigé |
| Anciennes données de démonstration visibles | Ancien partenaire Nike archivé, logo AIC non validé retiré de la publication, portrait DG non validé détaché ; les médias restent conservés pour éviter une suppression irréversible | Corrigé côté publication |
| Fiche PDF produit absente de l’interface | Champ CMS, rendu conditionnel et téléchargement vérifiés sur une fiche possédant un PDF | Corrigé |
| Vidéo produit et galerie 360 | Embed YouTube sécurisé et galerie 360 vérifiés sur la fiche produit de recette | Corrigé |
| Lien `tel:tel:` du pied de page | Normalisation centralisée du numéro et protection du composant UI contre le double préfixe | Corrigé |
| En-têtes de sécurité Nginx non effectifs | Inclusion corrigée dans le proxy ; `nginx -t` et contrôle HTTP des en-têtes validés | Corrigé |
| Clés React non uniques | Clés rendues stables et uniques dans les listes concernées ; TypeScript et ESLint passent | Corrigé |
| Contrôle local incohérent | Scripts HTTP et routes harmonisés sur `http://localhost:8080` | Corrigé |
| Ancienne route produit de démonstration contrôlée comme obligatoire | Contrôle remplacé par le slug du produit validé actuellement publié | Corrigé |

Contrôles finaux : conteneurs CMS/web/Nginx/PostgreSQL sains, absence de transaction `idle in transaction` bloquante, 30 routes conformes, contrôles HTTP complets conformes, TypeScript conforme, ESLint conforme.

Restent volontairement dépendants de la configuration métier du client : les URL Facebook et LinkedIn ne sont pas inventées et resteront masquées tant que l’administrateur ne les aura pas renseignées ; la recette d’un parcours administrateur authentifié nécessite également les identifiants de recette. La CSP du serveur de développement conserve les permissions nécessaires au hot reload ; le profil de production doit être utilisé pour la mise en ligne.

Le verdict local après correction est : **validé pour une nouvelle recette fonctionnelle locale**, sous réserve des deux points de configuration et de recette indiqués ci-dessus.
