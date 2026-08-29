# Comptes et accès de développement local

## 1. Principe de sécurité

Les comptes réels de production ne doivent pas être créés dans un document ni avec un mot de passe fourni par défaut. Ils seront créés pendant le déploiement avec des adresses confirmées par le Client, des invitations à usage unique et un changement de mot de passe obligatoire.

Pour le développement local, six comptes de test distincts sont prévus, conformément au cahier des charges : deux par rôle.

## 2. Comptes locaux proposés

| Compte | Rôle | Adresse locale proposée | Droits |
|---|---|---|---|
| Administrateur 1 | Administrateur | `admin1@local.africa-ingenierie.test` | Complets |
| Administrateur 2 | Administrateur | `admin2@local.africa-ingenierie.test` | Complets |
| Publicateur 1 | Publicateur | `publisher1@local.africa-ingenierie.test` | Contenu + publication |
| Publicateur 2 | Publicateur | `publisher2@local.africa-ingenierie.test` | Contenu + publication |
| Éditeur 1 | Éditeur | `editor1@local.africa-ingenierie.test` | Brouillons + soumission |
| Éditeur 2 | Éditeur | `editor2@local.africa-ingenierie.test` | Brouillons + soumission |

Ces adresses `.test` sont réservées aux tests locaux et ne correspondent pas à des boîtes de production.

## 3. Création locale

Le projet devra fournir une commande de bootstrap idempotente :

```bash
docker compose exec cms pnpm bootstrap:users
```

Le script doit :

1. vérifier que la base est locale ;
2. vérifier que les six adresses sont uniques ;
3. générer un secret aléatoire par compte ;
4. créer les utilisateurs avec `must_change_password = true` ;
5. écrire les informations uniquement dans un fichier local ignoré par Git ou afficher des liens d’invitation à usage unique ;
6. refuser toute exécution si `NODE_ENV=production` ;
7. journaliser la création sans journaliser les mots de passe.

Exemple de variables locales, à conserver uniquement dans `.env.local` :

```dotenv
BOOTSTRAP_USERS_ENABLED=true
BOOTSTRAP_USERS_ENV=local
ADMIN_INVITE_BASE_URL=http://localhost:3001/admin/activate
```

## 4. Création des comptes de production

Avant déploiement, le Client fournit les six identités et adresses professionnelles. Le Prestataire crée les comptes par invitation ; chaque utilisateur choisit son mot de passe via un lien signé et limité dans le temps.

Exigences :

- mot de passe long et unique ;
- MFA recommandé pour les deux Administrateurs ;
- aucune boîte partagée pour les comptes individuels ;
- désactivation immédiate d’un départ ;
- revue des accès tous les trois mois ;
- journalisation des connexions et changements de rôle.

## 5. Matrice d’autorisation

| Action | Administrateur | Publicateur | Éditeur |
|---|---:|---:|---:|
| Lire les contenus | Oui | Oui | Oui |
| Créer un contenu | Oui | Oui | Oui |
| Modifier un contenu | Oui | Oui | Ses brouillons / périmètre |
| Publier | Oui | Oui | Non |
| Archiver | Oui | Oui, selon périmètre | Non |
| Modifier réglages globaux | Oui | Non | Non |
| Gérer utilisateurs | Oui | Non | Non |
| Lire messages contact | Oui | Oui, selon périmètre | Selon décision |
| Lire audit complet | Oui | Non | Non |
| Modifier rôles | Oui | Non | Non |

