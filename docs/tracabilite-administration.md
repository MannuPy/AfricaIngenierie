# Traçabilité complète de l’administration

## Objectif

Chaque action importante réalisée dans le CMS doit pouvoir être reliée à un administrateur, à une requête et à un résultat. Le journal sert à répondre simplement à quatre questions : **qui a fait quoi, quand, depuis quelle requête et avec quel résultat ?**

## Actions suivies

Le journal couvre notamment :

- connexion et déconnexion ;
- échec de connexion et accès refusé ;
- création, modification, publication, dépublication, archivage et suppression ;
- export des messages reçus ;
- prévisualisation d’un contenu ;
- modification des paramètres et globals ;
- purge/anonymisation des messages arrivés à échéance ;
- événements de sécurité et opérations techniques.

Les lectures HTTP sont corrélées dans les logs Nginx par `request_id`. Les actions métier qui changent l’état du CMS sont conservées dans la collection d’audit append-only.

## Informations conservées

Une entrée contient, selon l’opération :

- date et heure ;
- acteur, lorsque l’action est authentifiée ;
- type et identifiant du contenu ;
- action et résultat ;
- identifiant de requête, méthode HTTP et chemin ;
- code HTTP ;
- empreinte non réversible de l’adresse IP et du navigateur ;
- métadonnées techniques filtrées.

Les données personnelles des formulaires de contact ne sont pas copiées dans le journal. À l’expiration de la durée de conservation, la tâche `pnpm --filter @africa-ingenierie/cms retention:cleanup` anonymise les messages par lots et inscrit seulement un bilan agrégé.

## Utilisation dans l’admin

Ouvrir **Configuration → Historique**. La liste est en lecture seule : même un administrateur ne peut pas modifier ou supprimer une trace. Utiliser les filtres sur l’action, le type de contenu, l’acteur, le chemin ou l’identifiant de requête. Pour analyser une opération, relever `requestId`, puis rechercher la même valeur dans les logs Nginx et dans le collecteur de logs de production.

## Règles d’exploitation recommandées

1. Restreindre la consultation du journal aux administrateurs habilités.
2. Exporter régulièrement les logs vers un stockage séparé, chiffré et immuable.
3. Créer des alertes sur les échecs de connexion répétés, changements de rôle, exports, suppressions et publications inhabituelles.
4. Synchroniser les horloges des serveurs avec une source NTP fiable.
5. Tester chaque trimestre la recherche d’un événement et la restauration d’une sauvegarde de logs.
6. Faire tourner `AUDIT_HASH_SECRET` selon une procédure documentée ; une rotation rend les nouvelles empreintes différentes et doit être enregistrée comme événement de sécurité.

## Limites à traiter en production

Le code du projet ne peut pas activer à lui seul un MFA, un WAF, un SIEM ou une politique Oracle Cloud. Ces protections doivent être configurées dans l’environnement d’hébergement et vérifiées lors de la recette de production.
