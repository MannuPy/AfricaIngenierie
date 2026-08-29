# Politique technique de conservation des données

> État d'implémentation au 28/08/2026 : la politique, le champ
> `retentionUntil`, le script de sauvegarde chiffrée et la rotation des fichiers
> sont fournis. La tâche d'anonymisation métier et le test de restauration sur
> le VPS restent à planifier et à vérifier avec les données de production.

Version 1.0 · Proposition à faire valider par le Client et son conseil juridique avant mise en production

## 1. Objet et périmètre

Cette politique définit les durées techniques de conservation, les accès, l’anonymisation et la suppression pour la plateforme Africa Ingénierie. Elle ne remplace pas la politique juridique publiée sur le site ni les formalités à effectuer auprès de l’autorité compétente.

Le cadre béninois de référence est le Livre 5 du Code du numérique relatif à la protection des données personnelles et de la vie privée. L’APDP rappelle notamment les principes de finalité, pertinence, conservation limitée, sécurité/confidentialité et respect des droits des personnes : [APDP  -  Protéger](https://archive.apdp.bj/proteger/) et [Loi n° 2017-20](https://archive.apdp.bj/lois/la-loi-n-2017-20-portant-code-du-numerique-en-republique-du-benin/).

## 2. Données concernées

- données envoyées via le formulaire de contact ;
- données techniques minimales de sécurité ;
- comptes du dashboard ;
- journaux d’audit ;
- consentements cookies ;
- médias et contenus éditoriaux ;
- sauvegardes chiffrées.

La plateforme ne prévoit actuellement ni paiement, ni billetterie, ni suivi de commande, ni collecte de données sensibles.

## 3. Durées proposées

| Catégorie | Données | Durée active | Après échéance | Accès |
|---|---|---:|---|---|
| Contact | Nom, e-mail, entreprise, besoin, message, consentement | 24 mois après dernier traitement | Anonymisation ou suppression | Administrateur, équipe autorisée |
| Contact litigieux | Message faisant l’objet d’un litige documenté | Jusqu’à clôture + 12 mois | Suppression/anonymisation | Administrateur uniquement |
| Comptes admin | Identité, e-mail, rôle, connexions | Pendant la durée du compte + 12 mois | Désactivation puis anonymisation des traces | Administrateur |
| Sécurité | IP hachée, échec de connexion, événements anti-abus | 12 mois | Suppression automatique | Administrateur sécurité |
| Audit éditorial | Auteur, action, version, date, diff | 36 mois | Archivage chiffré ou anonymisation | Administrateur |
| Consentement cookies | Choix, version du bandeau, horodatage | 36 mois ou retrait | Suppression/renouvellement | Administrateur |
| Brouillons | Contenus non publiés | 24 mois après dernière modification | Archivage puis suppression | Équipe éditoriale |
| Contenus publiés | Contenus institutionnels et métier | Tant qu’ils sont utiles ou publiés | Archivage versionné | Public selon statut |
| Médias | Fichiers liés à un contenu | Tant que le contenu ou l’obligation de preuve existe | Suppression après vérification des références | Administrateur/éditeur |
| Sauvegardes | Base et MinIO chiffrés | 30 jours quotidiennes, 12 mois mensuelles | Rotation automatique | Administrateur système |
| SMTP | Copies techniques de notification | Selon le fournisseur, cible maximale 30 jours | Suppression côté boîte/serveur | Administrateur autorisé |

Ces durées sont des choix techniques prudents, pas une validation juridique. Le Client doit confirmer la durée nécessaire à ses obligations commerciales, comptables, contractuelles et contentieuses.

## 4. Cycle de vie d’un message de contact

```text
Réception
  ↓
Nouveau
  ↓
En cours / assigné
  ↓
Répondu
  ↓
Fermé
  ↓
Anonymisation à échéance
```

La date `retention_until` est calculée à la réception. Toute prolongation doit être motivée, journalisée et limitée au strict nécessaire.

## 5. Procédure d’exercice des droits

1. Le demandeur écrit à l’adresse officielle de contact.
2. L’administrateur vérifie raisonnablement l’identité sans collecter de nouvelle donnée inutile.
3. La demande est enregistrée dans un ticket interne sans exposer le contenu au public.
4. Les données sont recherchées dans PostgreSQL, les journaux, les médias et les sauvegardes accessibles.
5. La réponse ou l’action est journalisée.
6. Si une suppression complète est impossible dans une sauvegarde active, la donnée est exclue des restaurations futures et supprimée à la rotation prévue.

## 6. Suppression et anonymisation

La tâche planifiée `retention-cleanup` s’exécute quotidiennement en mode simulation puis en mode actif après validation. Elle doit :

- sélectionner les messages dont `retention_until < current_date` ;
- remplacer le nom, l’e-mail, l’entreprise et le message par une valeur anonymisée ;
- conserver uniquement les informations statistiques strictement nécessaires ;
- inscrire l’opération dans un journal technique sans recopier les données supprimées ;
- ne jamais supprimer les journaux de sécurité avant leur échéance.

Les contenus éditoriaux sont archivés plutôt que supprimés directement afin de préserver les références publiques et les redirections.

## 7. Cookies et services tiers

- Les cookies strictement nécessaires peuvent fonctionner sans mesure d’audience.
- Toute mesure non nécessaire est bloquée avant consentement.
- Une carte externe ou un service tiers est chargé uniquement après consentement explicite.
- Le retrait du consentement doit être aussi simple que son acceptation.
- La version du bandeau et le choix sont conservés pour démontrer le consentement sans stocker plus de données que nécessaire.

## 8. Mesures techniques obligatoires

- chiffrement TLS en transit ;
- chiffrement des sauvegardes au repos ;
- comptes à privilèges minimaux ;
- secrets hors dépôt Git ;
- PostgreSQL et MinIO sur réseau privé ;
- accès administrateur journalisé ;
- restauration testée au moins une fois par trimestre ;
- procédure documentée de violation de données ;
- validation finale par le Client et conseil juridique avant mise en production.
