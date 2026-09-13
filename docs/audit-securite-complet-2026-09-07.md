# Audit de sécurité complet — Africa Ingénierie

**Date :** 7 septembre 2026  
**Périmètre :** dépôt local, application Next.js publique, CMS Payload/PostgreSQL, stockage MinIO, reverse proxy Nginx, Docker Compose, scripts de sauvegarde et workflow CI/CD.  
**Nature :** audit défensif de configuration et de code, complété par des contrôles HTTP locaux. Ce document n’est pas une certification ni un test d’intrusion externe.

**Note de lecture :** les constats et la note des sections 1 à 13 décrivent l’état observé au début de l’audit. Les correctifs appliqués ensuite, ainsi que leur statut de vérification, sont consignés en section 14.

## 1. Synthèse exécutive

### Note globale indicative : 6,5 / 10

La plateforme dispose déjà de bonnes fondations : séparation public/CMS, contrôle d’accès côté serveur, rôles éditeur/publicateur/administrateur, statuts éditoriaux, verrouillage des comptes, limitation de débit, validation des formulaires, filtrage des types de fichiers, prévisualisation par jeton signé, en-têtes HTTP de sécurité et sauvegardes chiffrées.

La note initiale est limitée par plusieurs sujets qui deviennent importants dès que le site est exposé sur Internet :

- aucun second facteur obligatoire pour les comptes administrateurs ;
- la date `retentionUntil` était calculée, mais aucune tâche de purge/anonymisation n’était encore active ;
- aucune preuve dans le dépôt d’un WAF, d’une protection DDoS, d’un IDS ou d’un SIEM centralisé ;
- les limites de débit applicatives sont conservées en mémoire et ne sont donc pas partagées entre plusieurs instances ;
- le chiffrement des sauvegardes utilise AES-CBC avec checksum, mais pas un mode authentifié de type GCM/age ;
- plusieurs éléments de la chaîne de livraison utilisaient des tags (`latest`, versions d’actions GitHub) au lieu de références immuables ;
- le chiffrement au repos de PostgreSQL/MinIO, la rotation des clés, les règles réseau du cloud et les tests de restauration doivent être prouvés en environnement de production.

**Conclusion :** aucun exploit critique n’a été confirmé par l’analyse locale, mais la mise en production doit être conditionnée par les actions P0/P1 de la section 11.

## 2. Méthode, périmètre et limites

### Sources examinées

- Code Next.js public : `apps/web`.
- CMS Payload et API : `apps/cms`.
- Composants partagés : `packages/ui`.
- Reverse proxy : `infra/nginx`.
- Conteneurs : `docker-compose.yml`, `docker-compose.override.yml`, `docker-compose.prod.yml`, `infra/docker`.
- CI/CD : `.github/workflows/ci.yml`.
- Sauvegardes : `scripts/backup-oracle.sh`, `scripts/backup-render.sh`.
- Politique de conservation : `docs/politique-conservation-donnees.md`.

### Contrôles effectués

- lecture statique des contrôles d’accès et des routes sensibles ;
- recherche de sorties HTML dangereuses, SQL brut, `eval` et configurations de secrets ;
- contrôle des types et tailles d’upload ;
- vérification des règles Nginx et des réseaux Docker ;
- requêtes locales non destructives vers le site public et le CMS ;
- vérification des tests et contrôles déjà présents dans la CI.

### Limites

Les éléments suivants ne peuvent pas être confirmés depuis le dépôt local : règles du pare-feu Oracle/Cloud, ports réellement ouverts sur Internet, certificat et SAN réellement déployés, configuration du fournisseur DNS, protection DDoS du fournisseur, paramètres de chiffrement des volumes managés, contenu du coffre de secrets, qualité des mots de passe réels, exécution réelle des sauvegardes et restauration sur un environnement isolé.

## 3. Tableau des constats

| ID | Domaine | Constat | Gravité | État |
|---|---|---|---|---|
| SEC-01 | Authentification | MFA/2FA/WebAuthn absent du parcours administrateur | Haute | À corriger |
| SEC-02 | Données personnelles | `retentionUntil` existe mais aucune purge/anonymisation automatique n’est implémentée | Haute | Écart confirmé |
| SEC-03 | Exploitation | Pas de pipeline centralisé de logs, alertes, IDS/SIEM ou procédure d’incident démontrée | Haute | À mettre en place |
| SEC-04 | Disponibilité | Rate limiting applicatif en mémoire, non partagé entre réplicas et perdu au redémarrage | Moyenne | À renforcer |
| SEC-05 | Sauvegardes | AES-CBC + SHA-256 protège la confidentialité et la corruption, pas l’authenticité cryptographique | Moyenne | À renforcer |
| SEC-06 | Supply chain | Images applicatives `:latest` et actions GitHub référencées par tags | Moyenne | À durcir |
| SEC-07 | Fichiers | Les médias sont lisibles publiquement par conception ; la séparation public/privé doit être garantie | Moyenne | Vérification métier requise |
| SEC-08 | CSP | La configuration locale autorise `unsafe-inline` et `unsafe-eval` | Moyenne | Acceptable en dev, interdit en prod |
| SEC-09 | Administration | Le sous-domaine admin n’est pas restreint par VPN ou liste d’adresses dans Nginx | Moyenne | À décider selon exposition |
| SEC-10 | Chiffrement infra | TLS externe est configuré ; chiffrement DB/MinIO au repos et TLS interne ne sont pas prouvés | Moyenne | À documenter/configurer |
| SEC-11 | CSRF | Les routes s’appuient principalement sur SameSite et l’architecture ; aucun mécanisme CSRF explicite n’est visible pour les actions browser | Faible à moyenne | À compléter |

## 4. Sécurité applicative

### 4.1 Authentification et comptes

**Points positifs constatés :**

- Payload gère le stockage du mot de passe ; le code ne journalise pas les secrets.
- Verrouillage après cinq échecs pendant quinze minutes dans `apps/cms/src/collections/Users.ts`.
- Expiration de session configurée à deux heures.
- Obligation de changer le mot de passe initial avec `mustChangePassword`.
- Les comptes inactifs sont refusés avant connexion.
- Seul l’administrateur peut créer un compte et modifier le rôle.
- Les rôles sont contrôlés côté serveur dans `apps/cms/src/access`.

**Risque principal — SEC-01 : MFA absent.** Une compromission d’un mot de passe administrateur suffit à atteindre le CMS. Le verrouillage ralentit le brute force mais ne remplace pas un second facteur.

**Recommandation :** imposer WebAuthn/passkeys pour les administrateurs, avec TOTP de secours soumis à une procédure de récupération vérifiée. Refuser toute opération éditoriale à haut impact tant que le second facteur n’est pas validé. Journaliser l’enrôlement, la révocation et les échecs MFA sans enregistrer le secret TOTP.

### 4.2 Sessions, cookies et CSRF

La configuration Payload utilise `SameSite=Lax`, `Secure` en production et un domaine de cookie optionnel. La route de prévisualisation ajoute explicitement un cookie `HttpOnly`, `SameSite=Lax`, avec durée limitée.

**À confirmer avant production :**

- vérifier dans le navigateur que le cookie de session Payload est effectivement `HttpOnly` ; le code ne l’impose pas explicitement dans `Users.ts` ;
- ne définir `AUTH_COOKIE_DOMAIN` que si le partage entre sous-domaines est indispensable ; sinon laisser le cookie hôte-scopé ;
- vérifier que le trafic HTTP est toujours redirigé vers HTTPS avant émission de cookie sécurisé.

**SEC-11 — protection CSRF explicite à compléter.** SameSite réduit le risque, mais une protection en profondeur est recommandée pour toute route qui modifie l’état avec une session cookie : contrôle strict de `Origin`/`Referer` et, si nécessaire, jeton CSRF synchronisé. Les appels serveur-à-serveur utilisant un secret interne doivent rester séparés de ce mécanisme.

### 4.3 XSS, injections et RCE

Les contrôles statiques n’ont pas trouvé de `dangerouslySetInnerHTML`, d’appel `eval` dans le code applicatif ni de requête SQL brute dans les routes métier examinées. Le contenu riche passe par l’éditeur Payload et le rendu partagé.

**Mesures à maintenir :**

- conserver le rendu échappé par défaut ;
- ne jamais introduire de HTML fourni par un utilisateur sans sanitation stricte et liste de balises ;
- conserver `object-src 'none'`, `base-uri 'self'` et `frame-ancestors 'self'` ;
- faire passer les tests XSS sur les champs témoignage, contact, produits et pages avant chaque livraison.

### 4.4 Validation des entrées et API

La route `apps/web/src/app/api/contact/route.ts` applique : JSON valide, limites de longueur, email minimal, consentement obligatoire, honeypot, limitation cinq requêtes/minute et taille maximale 32 Ko. L’écriture CMS passe par un secret serveur distinct en production. Les exports sont réservés aux administrateurs/publicateurs, privés et sans cache.

**Améliorations recommandées :**

- remplacer les validations ad hoc par des schémas partagés Zod ou équivalent ;
- normaliser Unicode, espaces et numéros de téléphone avant stockage ;
- supprimer ou masquer les détails d’erreur côté client, y compris dans les logs accessibles à des tiers ;
- retirer les valeurs de repli `PAYLOAD_SECRET` utilisées comme secrets internes lorsque `NODE_ENV=production` ; un secret manquant doit faire échouer le démarrage ;
- ajouter des limites par route et par identité métier, pas uniquement par IP.

## 5. Sécurité des données

### 5.1 Données collectées

Les messages de contact contiennent nom, e-mail, téléphone éventuel, entreprise, besoin et message. IP et navigateur sont conservés sous forme d’empreintes HMAC. Le consentement est horodaté. Cette minimisation est pertinente.

**SEC-02 — écart confirmé :** `retentionUntil` est calculé dans `ContactMessages.ts`, mais la recherche du dépôt n’a trouvé ni worker, ni cron, ni commande qui anonymise ou supprime effectivement les lignes échues. La documentation décrit une purge future, mais elle n’est pas opérationnelle.

**Correction technique recommandée :** créer une tâche planifiée idempotente, avec compte technique limité, qui :

1. sélectionne les messages `retentionUntil <= now()` hors litige ;
2. anonymise nom, e-mail, téléphone, entreprise, besoin et message ;
3. remplace IP/user-agent par une valeur neutre ;
4. positionne `state=redacted` ;
5. conserve seulement l’identifiant technique, la date et une trace d’audit sans données personnelles ;
6. produit un compteur et une alerte si la tâche échoue.

La durée de 24 mois doit être validée par la direction et le conseil juridique. Le RGPD est le référentiel probable pour les visiteurs européens ; HIPAA n’est pas applicable sauf traitement de données de santé, qui n’apparaît pas dans le périmètre actuel.

### 5.2 Chiffrement et clés

- HTTPS/TLS 1.2 et 1.3 est prévu dans la configuration Oracle.
- Les secrets sont injectés par variables d’environnement en production ; `.env.oracle` n’est pas versionné selon la documentation.
- Les sauvegardes sont chiffrées avec PBKDF2 et clé d’au moins 32 caractères.
- La gestion effective d’un coffre de secrets, la rotation et la révocation ne sont pas démontrées.

**SEC-05 :** `openssl enc -aes-256-cbc` accompagné d’un fichier SHA-256 ne fournit pas d’authentification cryptographique. Un attaquant qui pourrait modifier le fichier ou le checksum n’est pas détecté par ce mécanisme.

**Recommandation :** migrer vers `age` avec clé hors serveur ou AES-256-GCM/ChaCha20-Poly1305 avec tag authentifié, puis protéger les sauvegardes par versioning, rétention immuable et stockage hors machine.

### 5.3 Médias et uploads

`MediaAssets.ts` accepte JPEG, PNG, WebP, AVIF, MP4, WebM, OGG et PDF, limite la taille à 20 Mo et refuse les SVG arbitraires. Le CMS redimensionne les images pour différents usages.

**SEC-07 :** l’accès en lecture de la médiathèque est public et les fichiers sont servis par une route publique. Cela est correct pour des visuels du site, mais dangereux si un opérateur charge un document confidentiel dans cette collection.

**Action :** séparer strictement `public-media` et `private-media`, ou ajouter un champ/une collection privée avec URL signée et contrôle d’accès. Vérifier le type MIME réel par signature de fichier, pas uniquement par extension et en-tête ; analyser les PDF et vidéos si le niveau de menace le justifie ; appliquer une politique de taille et de durée vidéo.

## 6. Réseau et infrastructure

### 6.1 Segmentation

Le Compose de production place PostgreSQL et MinIO sur un réseau backend interne. Le web n’accède qu’au réseau frontend ; le CMS est sur frontend et backend ; Nginx est le seul service qui publie les ports 80/443. C’est une bonne séparation.

À confirmer côté cloud : seuls 80/443 doivent être exposés publiquement. PostgreSQL, MinIO, la console MinIO, le CMS direct, Docker et SSH doivent être filtrés par security group/pare-feu et, idéalement, par VPN ou liste d’adresses d’administration.

### 6.2 Reverse proxy, TLS et headers

Les configurations Nginx ajoutent `nosniff`, `SAMEORIGIN`, politique de référent stricte, Permissions-Policy restrictive, COOP, HSTS en production et CSP. La configuration Oracle limite TLS à 1.2/1.3 et redirige HTTP vers HTTPS.

**Vérifications de mise en production :**

- le certificat doit couvrir le domaine public et le domaine admin via SAN ou certificats dédiés ;
- vérifier expiration, renouvellement automatique et permissions de la clé privée ;
- tester SSL Labs ou test TLS équivalent après déploiement ;
- activer HSTS seulement lorsque tous les sous-domaines sont HTTPS ;
- ajouter CSP nonce/hash pour supprimer progressivement `unsafe-inline`.

**SEC-08 :** la configuration locale autorise `unsafe-inline`, `unsafe-eval`, WebSocket et des sources de développement. C’est acceptable pour le hot reload local, mais cette configuration ne doit jamais être utilisée en production. La configuration Oracle est plus restrictive et doit être testée dans le pipeline.

### 6.3 WAF, DDoS et administration

Nginx fournit un rate limit pour login, contact et API admin. Aucun WAF applicatif, fournisseur anti-DDoS, allow-list admin ou protection IDS/IPS n’est identifiable dans le dépôt.

**Recommandation :** placer le domaine public derrière le service anti-DDoS/WAF du cloud ou un CDN approuvé ; ajouter des règles pour bots, tailles, méthodes HTTP et chemins sensibles ; protéger l’admin par VPN, Zero Trust ou allow-list quand l’exploitation le permet. Le rate limiting Nginx seul ne suffit pas contre un DDoS distribué.

## 7. Base de données

### 7.1 Accès et permissions

PostgreSQL n’est pas publié par le Compose de production et s’exécute dans le réseau interne. Le CMS utilise un compte applicatif dédié. Les scripts de sauvegarde utilisent des identifiants fournis par environnement.

**À renforcer :**

- séparer le compte runtime CMS du compte de migration et du compte de sauvegarde ;
- accorder uniquement les privilèges nécessaires à chaque compte ;
- désactiver ou filtrer toute connexion distante PostgreSQL non indispensable ;
- documenter le chiffrement du volume PostgreSQL et les permissions du volume Docker ;
- activer TLS PostgreSQL si les frontières réseau ou le fournisseur l’exigent.

### 7.2 Injections et exposition

L’application utilise l’adaptateur Payload/PostgreSQL et des filtres structurés. Aucun SQL métier brut n’a été relevé dans les routes examinées. Les paramètres d’export sont contrôlés par listes de valeurs et expressions de date.

Le endpoint GraphQL est activé dans `payload.config.ts`. Il faut vérifier en production si GraphQL est réellement nécessaire ; sinon le désactiver. S’il est conservé, limiter l’introspection publique, la profondeur, le coût des requêtes et les permissions par collection.

### 7.3 Sauvegardes et restauration

Les scripts Oracle/Render :

- produisent des dumps PostgreSQL custom ;
- copient les médias MinIO ;
- chiffrent avant copie distante ;
- appliquent une rétention ;
- utilisent `umask 077` et nettoient leur répertoire de travail.

Il manque la preuve de trois contrôles opérationnels : succès planifié et alerté, restauration périodique complète, et test de cohérence entre base et médias. Programmer au moins un exercice mensuel sur une base isolée et conserver le résultat signé dans le journal d’exploitation.

## 8. Déploiement et CI/CD

### Forces

Le workflow vérifie typecheck, lint, build, Compose, tests CMS/RBAC/OpenAPI, routes, contrats HTTP, tests visuels/accessibilité, Lighthouse, audit des dépendances et scans Trivy des fichiers et images.

### Risques et actions

**SEC-06 — tags mutables :** les images applicatives de production utilisent notamment `:latest`, tandis que les Dockerfiles PostgreSQL, Nginx et MinIO sont digest-pinnés. Un build reproductible doit utiliser des tags versionnés et des digests validés pour tous les services.

Les actions GitHub sont référencées par tags (`@v4`, `@0.30.0`). Pour une chaîne à haut niveau de confiance, les épingler par SHA de commit et les mettre à jour par Dependabot/Renovate avec revue.

Autres recommandations :

- générer un SBOM à chaque image ;
- signer les images et vérifier la signature au déploiement ;
- publier uniquement depuis `main` protégée avec revue obligatoire ;
- interdire les secrets dans les logs et analyser les artefacts ;
- faire échouer le démarrage production si une variable secrète obligatoire manque ou conserve une valeur `change-me` ;
- utiliser des images runtime minimales et non-root, ce qui est déjà prévu pour web/CMS production ;
- scanner aussi l’image MinIO et l’image PostgreSQL finales, pas seulement web/CMS/Nginx.

## 9. Surveillance et réponse aux incidents

Le CMS possède un journal d’audit éditorial et les logs Nginx sont conservés dans un volume. Cela permet une enquête locale, mais pas encore une surveillance centralisée démontrée.

À mettre en place :

- expédition chiffrée des logs Nginx, CMS, PostgreSQL, MinIO et hôte vers le service de logs du cloud ou un SIEM ;
- alertes sur brute force, verrouillages, créations de comptes, changement de rôle, publication massive, export CSV, erreurs 5xx, anomalies d’upload et échecs de sauvegarde ;
- horodatage UTC cohérent et synchronisation NTP ;
- conservation séparée des logs d’audit et des données personnelles ;
- procédure écrite : qualification, confinement, rotation des secrets, restauration, notification et retour d’expérience ;
- test trimestriel de reprise après sinistre avec RTO/RPO validés par la direction.

**RTO/RPO à décider :** par exemple RTO de 4 heures et RPO de 24 heures pour un premier niveau, à confirmer selon l’activité commerciale.

## 10. Contrôles dynamiques réalisés

Les contrôles locaux effectués le 7 septembre 2026 ont donné les résultats suivants :

| Contrôle | Résultat |
|---|---|
| `GET /fr/` via Nginx public | HTTP 200 |
| `GET /healthz` | HTTP 200 |
| `GET /api/users/me` sans session | HTTP 200 avec `user: null`, aucune donnée de compte |
| En-têtes `nosniff`, `SAMEORIGIN`, Referrer-Policy, Permissions-Policy, COOP | Présents en local |
| CSP de développement | Présente, mais permissive pour hot reload |
| `GET /api/media-assets?limit=1` sans session | Lisible publiquement, cohérent avec la médiathèque publique ; séparation privé/public à garantir |
| Uploads | MIME autorisés et limite 20 Mo déclarés dans `MediaAssets.ts` |
| Prévisualisation | Authentification CMS + jeton HMAC court + vérification de destination |
| Export des contacts | Session admin/publicateur requise, CSV privé et sans cache |

Les tests de qualité déjà présents dans le projet ont également été exécutés précédemment : typecheck CMS/web/UI, lint CMS/web/UI et validation de diff sans erreur bloquante. La CI prévoit en plus scans Trivy, `pnpm audit`, tests de routes, accessibilité et Lighthouse.

## 11. Plan d’amélioration priorisé

### P0 — avant toute exposition publique durable

1. Activer MFA/WebAuthn pour tous les administrateurs et publicateurs.
2. Remplacer et faire tourner tous les secrets de production ; supprimer les fallbacks vers `PAYLOAD_SECRET` pour les secrets internes.
3. Vérifier les security groups/cloud firewall : seuls 80/443 publics ; admin sous VPN/allow-list si possible.
4. Mettre en production uniquement la CSP restrictive et confirmer le certificat pour les deux domaines.
5. Implémenter la purge/anonymisation réellement planifiée des messages échus.
6. Confirmer qu’aucun document privé n’est chargé dans la collection servie publiquement.

### P1 — sous 7 jours

1. Remplacer AES-CBC par un chiffrement authentifié et tester une restauration complète.
2. Centraliser les logs et créer les alertes d’authentification, publication, export, upload et sauvegarde.
3. Mettre un rate limiter partagé Redis/Upstash ou équivalent ; garder Nginx en première barrière.
4. Épingler images, dépendances et actions CI par versions/digests/SHA.
5. Séparer comptes runtime, migration et backup PostgreSQL/MinIO ; réduire la policy MinIO.
6. Décider si GraphQL est requis ; sinon le désactiver, sinon appliquer profondeur/coût/introspection contrôlés.

### P2 — sous 30 jours

1. Ajouter contrôles Origin/CSRF explicites sur les actions cookie.
2. Mettre en place WAF/CDN/anti-DDoS et une protection spécifique du sous-domaine admin.
3. Documenter RGPD, registre des traitements, durées, droits d’accès et procédure de demande d’effacement.
4. Ajouter SBOM, signature d’image, vérification de signature et scans de toutes les images.
5. Automatiser un exercice de restauration mensuel et un exercice d’incident trimestriel.
6. Ajouter tests de sécurité automatisés : XSS, contrôle d’accès horizontal/vertical, uploads polyglottes, limites de taille, SSRF et régression CSP.

## 12. Exemples techniques de mise en œuvre

### Démarrage production sans secrets faibles

```ts
const requiredProductionSecrets = [
  'PAYLOAD_SECRET',
  'PREVIEW_SECRET',
  'REVALIDATION_SECRET',
  'CONTACT_INTERNAL_SECRET',
  'CMS_INTERNAL_READ_SECRET',
]

if (process.env.NODE_ENV === 'production') {
  for (const name of requiredProductionSecrets) {
    const value = process.env[name]
    if (!value || value.startsWith('change-me')) {
      throw new Error(`${name} must be provided as a real production secret`)
    }
  }
}
```

Le contrôle doit être appliqué au démarrage du web et du CMS, avec des secrets distincts et une rotation documentée.

### Purge contrôlée

La tâche doit s’exécuter avec un compte limité, en transaction, par petits lots et avec un verrou empêchant deux exécutions concurrentes. Elle ne doit pas recopier les données effacées dans les logs.

```sql
UPDATE contact_messages
SET full_name = '[anonymisé]',
    email = 'redacted@invalid.local',
    phone = NULL,
    company = NULL,
    need = '[anonymisé]',
    message = '[anonymisé]',
    ip_hash = NULL,
    user_agent_hash = NULL,
    state = 'redacted'
WHERE retention_until <= NOW()
  AND state <> 'redacted';
```

La requête réelle doit aussi gérer les litiges, le nombre de lots, l’audit et les droits PostgreSQL.

### Rate limiting distribué

Utiliser Redis avec une clé HMAC de l’identité réseau, une fenêtre glissante et une limite séparée pour login/contact/API. Ne jamais faire confiance à `X-Forwarded-For` si Nginx n’écrase pas ce header en entrée.

### CSP de production

Conserver `script-src 'self'` en production. Remplacer les styles inline par nonce/hash dès que Payload/Next le permettent. Les domaines YouTube et OpenStreetMap doivent rester limités à `frame-src` et ne pas devenir des sources globales de script.

## 13. Verdict

La plateforme est exploitable comme base de préproduction et présente plusieurs mesures de sécurité supérieures à un site vitrine standard. Elle ne doit toutefois pas être considérée comme complètement durcie tant que MFA, purge des données, gestion opérationnelle des incidents, restauration vérifiée et protection de production ne sont pas réellement activés.

**Décision recommandée :** autoriser une recette interne contrôlée ; bloquer la mise en production Internet définitive sur les six actions P0 ; refaire un audit de vérification après leur implémentation.

## 14. Mise en œuvre des recommandations — 7 septembre 2026

Les mesures suivantes ont été appliquées dans le dépôt après l’audit :

- démarrage production bloqué si les secrets critiques sont absents ou utilisent une valeur d’exemple ;
- version de release obligatoire pour les images de production et images Node épinglées par digest ;
- journal CMS append-only étendu avec requête, méthode, chemin, résultat, code HTTP, empreintes réseau et métadonnées filtrées ;
- journalisation des connexions, déconnexions, échecs d’autorisation, exports, prévisualisations, publications, modifications, suppressions et opérations de purge ;
- corrélation de chaque requête par `X-Request-ID` Nginx, avec écrasement du `X-Forwarded-For` fourni par le client ;
- anonymisation des messages de contact arrivés à échéance, par lots, sans recopier les données personnelles dans l’audit ;
- contrôle d’intégrité HMAC ajouté aux sauvegardes chiffrées et validation Nginx automatisée dans la CI ;
- documentation de la traçabilité et des procédures de consultation dans [docs/tracabilite-administration.md](tracabilite-administration.md).

Ces contrôles sont intégrés au code, mais leur efficacité en production dépend encore du déploiement effectif des variables secrètes, de la planification de la tâche de purge, de la conservation hors site des sauvegardes et de la centralisation des logs.

### Points qui restent à activer sur l’infrastructure

1. MFA obligatoire pour les administrateurs, idéalement WebAuthn/passkeys ou TOTP avec codes de récupération gérés séparément.
2. Rate limiting distribué et protection WAF/CDN/anti-DDoS devant le domaine public et surtout le sous-domaine admin.
3. Centralisation des logs vers un SIEM ou un stockage immuable avec alertes sur échecs de connexion, exports, changements de rôle, publications et suppressions.
4. Rotation documentée des secrets, certificats et clés de sauvegarde ; séparation stricte des comptes runtime, migration et sauvegarde.
5. Test périodique de restauration et procédure d’incident validée par l’équipe opérationnelle.

Le dépôt ne simule pas ces services externes : ils doivent être configurés avec les identifiants et politiques de l’environnement Oracle/cloud réellement utilisé.

## 15. Éléments hors audit sécurité

Le logo officiel est maintenant rendu directement dans l’en-tête de l’accueil avec le fichier SVG officiel, sans cadre bleu. Aucun fichier officiel de portrait du Directeur Général n’était présent dans les ressources disponibles au moment de l’audit ; il faut fournir ce portrait pour effectuer un remplacement fiable, sans inventer ni récupérer l’image d’une personne non validée.
