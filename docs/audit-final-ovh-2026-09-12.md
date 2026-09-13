# Audit final de préparation OVH — Africa Ingénierie

Date de contrôle : 12 septembre 2026  
Périmètre : dépôt local `C:\Projet\Projets- ING`, pile Docker locale, préparation du VPS OVH.  
Cible publique autorisée : `https://ingenierieafrica.com/` uniquement.

## 1. Conclusion exécutive

Le socle applicatif est techniquement déployable sur un VPS Docker OVH : les
images de production se construisent, la configuration Compose OVH est valide,
le typage et le lint sont propres, les 87 tests CMS passent et les contrôles
HTTP de 30 routes passent.

Le déploiement public n’est toutefois pas encore une mise en production
achevée. Il reste à effectuer sur le VPS : la configuration du pare-feu, la
création du fichier de secrets réel, le clonage GitHub, le premier démarrage,
l’émission du certificat TLS, le test SMTP réel, la configuration des
sauvegardes et le test de restauration.

Le port 22 répond actuellement ; les ports 80 et 443 étaient fermés lors du
dernier relevé parce qu’aucun Nginx de production n’était encore démarré. Ce
n’est pas une panne applicative : ces ports deviendront nécessaires après le
démarrage de la stack OVH.

## 2. Périmètre et services préservés

La pile OVH utilise :

- `ingenierieafrica.com` pour le site public ;
- `www.ingenierieafrica.com` comme alias redirigé vers le domaine canonique ;
- `admin.ingenierieafrica.com` pour le dashboard Payload ;
- le VPS `213.32.70.178` pour Nginx, Next.js, Payload, PostgreSQL et MinIO.

Les éléments suivants sont explicitement hors périmètre et ne doivent pas être
modifiés pendant la mise en ligne :

- `africaingenierie.com` ;
- l’API existante `api.ingenierieafrica.com` ;
- les enregistrements MX, SPF, DKIM, DMARC et les hôtes mail ;
- l’hébergement partagé `ingenia.cluster100.hosting.ovh.net` ;
- les boîtes et services Microsoft/OVH existants.

Le fichier de zone DNS exporté et les captures OVH servent de référence. Une
action DNS n’est correcte que si elle vise explicitement le domaine
`ingenierieafrica.com` et la cible `213.32.70.178`.

## 3. Architecture auditée

```text
navigateur
    │ 80/443
    ▼
Nginx OVH
    ├── ingenierieafrica.com → web:3000
    ├── www.ingenierieafrica.com → redirection canonique
    └── admin.ingenierieafrica.com → cms:3001

web:3000 ── réseau frontend ── cms:3001
cms:3001 ── réseau backend ─── postgres:5432
cms:3001 ── réseau backend ─── minio:9000
```

PostgreSQL, MinIO, CMS et web ne publient pas de ports Internet. Seul Nginx
publie 80 et 443. Le site public ne lit jamais PostgreSQL directement : il
passe par l’API interne du CMS.

## 4. Résultats de développement logiciel

| Contrôle | Résultat | Interprétation |
|---|---:|---|
| TypeScript web | PASS | Aucun défaut de typage détecté |
| TypeScript CMS | PASS | Aucun défaut de typage détecté |
| ESLint web/CMS/UI/validation | PASS | 0 erreur, 0 avertissement après correction |
| Build image CMS production | PASS | Next.js 16.3.3 construit l’image autonome |
| Build web et Nginx | PASS lors du contrôle précédent | Images construites avec l’URL canonique OVH |
| Compose production OVH | PASS | Fichier autonome sans override local |
| Tests CMS | 87/87 PASS | RBAC, authentification, workflow, schéma, seed et contrats |
| Contrôles HTTP | PASS | API, SEO, traduction, sécurité et redirections |
| Routes publiques | 30/30 PASS | Réponses 200/404/308 conformes aux attentes |

Les temps des routes locales peuvent être élevés au premier appel en mode
développement, car Next.js compile alors la route. Ce phénomène ne doit pas
être confondu avec la performance de l’image de production.

## 5. Sécurité contrôlée

Les protections présentes dans le code et la configuration comprennent :

- secrets de production absents du dépôt et modèle OVH ignoré par Git ;
- validation de présence et longueur des secrets au démarrage production ;
- réseau Docker backend interne ;
- aucun port public pour PostgreSQL, MinIO ou les applications ;
- reverse proxy Nginx avec en-têtes de sécurité ;
- TLS prévu par Certbot avec certificat pour le domaine public, `www` et
  l’administration ;
- authentification Payload et contrôle des rôles ;
- obligation de changement de mot de passe initial ;
- journal d’audit sans copie de mot de passe ;
- limitation et validation du formulaire de contact ;
- filtrage des contenus publiés et vérification bilingue avant publication ;
- médias privés par défaut, avec passage public contrôlé ;
- sauvegardes PostgreSQL et MinIO chiffrées, avec checksum et HMAC.

La conformité technique ne constitue pas une certification juridique. Les
mentions légales, la politique de confidentialité, les durées de conservation,
les consentements et les coordonnées du responsable doivent encore être relus
par le responsable de l’entreprise et, si nécessaire, par un conseil juridique.

## 6. Corrections effectuées pendant cet audit

1. Le modèle `.env.ovh.test.example` est désormais orienté production OVH :
   base `africa_ingenierie`, bucket `africa-media`, domaine canonique et nom
   d’expéditeur cohérents.
2. `docker-compose.prod.yml` ne pointe plus par défaut vers `.env.oracle` :
   son défaut est `.env.ovh.test`.
3. La CI et `verify-stack.ps1` valident la configuration OVH.
4. La règle ESLint inutile liée à un ancien dossier `pages` est désactivée :
   le projet utilise l’App Router.
5. Le support `CMS_INTERNAL_HOSTPORT`, spécifique à l’ancien hébergeur, a été
   retiré. Le projet utilise désormais `CMS_INTERNAL_URL` sur le réseau Docker.
6. Les fichiers d’infrastructure Render et les modèles/guides Oracle devenus
   inutiles pour la cible OVH ont été retirés. Les noms historiques conservés
   dans certains scripts actifs sont documentés et ne changent pas le
   fournisseur d’hébergement.
7. Le générateur média encode désormais les images selon leur format livré :
   un fichier `.jpg` ne contient plus un PNG par erreur.
8. Les tests du seed distinguent correctement les médias PNG, JPEG, PDF et les
   visuels fournis/validés par le client.
9. Le routage `www` redirige vers `https://ingenierieafrica.com`.
10. Le fichier temporaire `Configuration OVH.txt`, vide et sans référence, a
    été supprimé.

Les prototypes `standalone*.html`, les médias approuvés, le cahier des charges
et les documents d’audit n’ont pas été supprimés : ils servent encore de
référence visuelle, contractuelle ou de recette.

## 7. Adresse de contact à utiliser

Le domaine correct dans la configuration est `ingenierieafrica.com`. L’adresse
à utiliser est donc `contact@ingenierieafrica.com`.

L’adresse `contact@africaingenirie.com` contient une inversion/erreur de nom de
domaine et ne doit pas être mise dans le fichier de production sauf si cette
boîte existe réellement dans une zone DNS séparée.

Recommandation : le formulaire public envoie vers `CONTACT_TO`, donc vers
`contact@ingenierieafrica.com`. Les réponses sont ensuite gérées dans la boîte
mail de l’entreprise ou dans l’administration mail existante. Le VPS ne doit
pas devenir un serveur mail : il doit utiliser le relais SMTP OVH/Microsoft
existant avec une adresse d’expédition dédiée, par exemple
`no-reply@ingenierieafrica.com`.

## 8. Blocages avant mise en production

### 8.1 Dépôt Git

Le dépôt est actuellement dans un rebase interactif en cours et `HEAD` est
détaché. Il ne faut pas pousser cet état directement. La personne qui contrôle
le dépôt doit d’abord terminer ou annuler ce rebase après vérification, créer
une branche de préparation, sélectionner les changements voulus, puis attendre
la CI avant fusion dans `main`.

Ne jamais utiliser pour résoudre ce point sans sauvegarde vérifiée :
`git reset --hard`, `git checkout -- .`, `git clean -fd` ou un push forcé.

### 8.2 Secrets

Le fichier `.env.ovh.test.example` contient volontairement des placeholders.
Avant le démarrage OVH, il faut créer `.env.ovh.test` sur le VPS, lui donner
les permissions `600`, remplacer tous les `change-me`, encoder le mot de passe
PostgreSQL dans `DATABASE_URL` et renseigner le vrai SMTP.

### 8.3 Administration du VPS

À effectuer en SSH avec le compte Linux `ubuntu`, puis avec un compte nominatif
administrateur : mises à jour, clé SSH, UFW, fail2ban, mises à jour de sécurité,
swap de secours, Docker, clone GitHub en clé de déploiement et permissions du
répertoire `/opt/ingenierieafrica`.

### 8.4 DNS et TLS

Avant Certbot, les A records du domaine public, de `www` et de `admin` doivent
viser `213.32.70.178`, le port 80 doit être accessible et le port 443 doit être
autorisé. Ne pas toucher aux MX/TXT ni au domaine `africaingenierie.com`.

### 8.5 Recette réelle

Après démarrage : tester le site public, `www`, l’administration, la création
d’un compte administrateur, le changement de mot de passe initial, le formulaire
de contact, la réception SMTP, les médias, les deux langues, les redirections,
les logs, le renouvellement TLS, une sauvegarde et une restauration complète.

## 9. Critère de go-live

La mise en production est acceptable lorsque les cases suivantes sont toutes
validées :

- [ ] branche GitHub propre et CI verte ;
- [ ] aucun secret réel dans GitHub ;
- [ ] DNS public vérifié sans modification des services hors périmètre ;
- [ ] UFW n’autorise que SSH, HTTP et HTTPS ;
- [ ] Compose OVH valide avec le fichier de secrets réel ;
- [ ] migration PostgreSQL terminée ;
- [ ] Nginx, web et CMS healthy ;
- [ ] certificat TLS valide ;
- [ ] `www` redirige vers le domaine canonique ;
- [ ] administration accessible uniquement sur `admin` ;
- [ ] formulaire de contact reçu par l’entreprise ;
- [ ] sauvegarde chiffrée exécutée ;
- [ ] restauration testée ;
- [ ] contenu de démonstration remplacé ou validé ;
- [ ] mentions légales et politique de confidentialité validées.

## 10. Documents de référence

- [Guide détaillé de déploiement OVH](deploiement-ovh-ingenierieafrica-final.md)
- [Rapport d’audit local](rapport-audit-local-2026-09-01.md)
- [Plan de recette sécurité](plan-recette-securite.md)
- [Architecture et flux](architecture-et-uml.md)
