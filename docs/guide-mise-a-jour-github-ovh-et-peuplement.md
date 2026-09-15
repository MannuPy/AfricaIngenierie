# Guide opérationnel — mise à jour GitHub, OVH et peuplement du site

Ce guide concerne le projet Africa Ingénierie hébergé sur le VPS OVH. Il sépare clairement les comptes, les environnements et les commandes. Le domaine public de cette stack est ingenierieafrica.com. Le domaine africaingenierie.com est hors périmètre et ne doit pas être modifié.

## 1. Comptes et environnements

| Élément | Rôle | Compte à utiliser |
|---|---|---|
| PowerShell Windows | commandes locales, Git, tests réseau | votre session Windows |
| GitHub | dépôt du code | compte GitHub MannuPy |
| OVH Manager | VPS, DNS, KVM, sauvegardes | compte OVH Africa Ingénierie |
| VPS Ubuntu | administration Linux et Docker | utilisateur ubuntu |
| Payload CMS | contenus, médias et utilisateurs éditoriaux | compte créé sur /admin |
| PostgreSQL / SeaweedFS | services internes Docker | aucun accès public |

Le mot de passe OVH Manager ne fonctionne pas avec SSH. Le mot de passe Ubuntu ne sert pas à ouvrir OVH Manager. Le mot de passe CMS est différent des deux précédents.

URL de production :

- site public : https://ingenierieafrica.com/
- administration : https://admin.ingenierieafrica.com/admin

URL locale :

- site public : http://localhost:8080/fr
- administration : http://admin.localhost:8080/admin

Ne mettez jamais une URL localhost dans .env.ovh.test.

## 2. Récupérer SSH si le port 22 est bloqué

Votre adresse publique observée le 15 septembre 2026 est 102.67.100.241. Elle peut changer.

Dans PowerShell Windows, exécutez séparément :

~~~
$adminIp = (Invoke-RestMethod -Uri 'https://api4.ipify.org').Trim()
$adminIp
~~~

La commande ne doit pas être collée avec une seconde commande sur la même ligne. Si vous voyez $adminIp après ).Trim() sans point-virgule, PowerShell affiche une erreur de syntaxe.

Si SSH retourne Connection timed out :

1. Ouvrez OVH Manager avec le compte Africa Ingénierie.
2. Allez dans Serveurs privés virtuels.
3. Ouvrez vps-09c6339d.vps.ovh.net.
4. Lancez la console KVM.
5. Connectez-vous avec l’utilisateur ubuntu et son mot de passe Ubuntu.
6. Ajoutez l’adresse IP affichée par PowerShell :

~~~
sudo ufw allow from VOTRE_IP to any port 22 proto tcp comment 'SSH administration'
sudo ufw status numbered
~~~

Depuis PowerShell :

~~~
Test-NetConnection 213.32.70.178 -Port 22
ssh ubuntu@213.32.70.178
~~~

Ne supprimez pas une ancienne règle SSH avant d’avoir testé une seconde connexion. Les ports 80 et 443 doivent rester ouverts pour le site. Les ports 3000, 3001, 5432, 8333, 9000 et 9001 doivent rester internes.

Si le port 22 reste inaccessible depuis KVM :

~~~
sudo systemctl restart ssh
sudo systemctl enable ssh
sudo ss -lntp | grep ':22'
sudo ufw status verbose
~~~

## 3. Contrôles locaux avant publication

Dans PowerShell :

~~~
cd 'C:\Projet\Projets- ING'
git status
git branch --show-current
git diff --check
~~~

Le projet utilise actuellement la branche codex/ovh-preparation pour la recette OVH. Ne déployez pas main avant validation complète.

Installez et contrôlez les dépendances sans remplacer le lockfile :

~~~
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
~~~

Si pnpm refuse sa signature ou sa version, ne modifiez pas le lockfile pour contourner le problème. Utilisez l’environnement de développement prévu par le projet ou corrigez le gestionnaire de paquets, puis relancez les contrôles.

Contrôlez que les secrets restent ignorés :

~~~
git check-ignore -v .env.local
git check-ignore -v .env.ovh.test
git ls-files | Select-String '(^|/)(\.env|.*\.pem|.*\.key|.*\.sql|.*\.dump)'
~~~

Aucun fichier .env réel, mot de passe, clé privée ou dump ne doit être ajouté à Git. Si un secret a déjà été publié, le supprimer du dossier ne suffit pas : il faut le révoquer et le remplacer.

## 4. Publier la mise à jour sur GitHub

Inspectez d’abord les fichiers à publier :

~~~
git diff -- packages/ui/src/styles/components.css packages/ui/src/styles/responsive.css
git diff --check
~~~

Ajoutez uniquement les fichiers attendus. N’utilisez pas git add . sans avoir contrôlé git status, car le projet contient des documents et images de travail non suivis.

~~~
git add packages/ui/src/styles/components.css
git add packages/ui/src/styles/responsive.css
git add docs/guide-mise-a-jour-github-ovh-et-peuplement.md
git diff --cached --check
git diff --cached --stat
git commit -m "Improve responsive header and deployment workflow"
git push -u origin codex/ovh-preparation
~~~

Sur GitHub, vérifiez que le commit est visible dans codex/ovh-preparation. Si une CI existe, attendez sa réussite.

Le dépôt affiché précédemment était public. Pour le rendre privé : GitHub → dépôt AfricaIngenierie → Settings → General → Danger Zone → Change repository visibility → Make private. Cette action protège l’accès futur mais ne révoque pas les secrets déjà exposés. Après le passage en privé, vérifiez que le VPS peut encore lire le dépôt avec une clé de déploiement ou un autre accès sécurisé.

## 5. Mettre le VPS à jour

Connectez-vous depuis PowerShell :

~~~
ssh ubuntu@213.32.70.178
~~~

Dans Ubuntu :

~~~
cd /opt/ingenierieafrica
git status
git switch codex/ovh-preparation
git fetch origin
git pull --ff-only origin codex/ovh-preparation
git log --oneline -3
~~~

La commande git pull doit afficher le commit qui vient d’être publié. Si Git signale des modifications locales, ne lancez pas git reset --hard. Copiez d’abord git status et vérifiez que .env.ovh.test n’est pas menacé.

Contrôlez la configuration sans révéler les secrets :

~~~
stat -c '%a %n' .env.ovh.test
git check-ignore -v .env.ovh.test
grep -nE '^(PUBLIC_DOMAIN|ADMIN_DOMAIN|NEXT_PUBLIC_SITE_URL|PAYLOAD_PUBLIC_SERVER_URL|CMS_INTERNAL_URL|RELEASE_VERSION|COMPOSE_PROJECT_NAME)=' .env.ovh.test
chmod 600 .env.ovh.test
~~~

Valeurs attendues :

~~~
PUBLIC_DOMAIN=ingenierieafrica.com
ADMIN_DOMAIN=admin.ingenierieafrica.com
NEXT_PUBLIC_SITE_URL=https://ingenierieafrica.com
PAYLOAD_PUBLIC_SERVER_URL=https://admin.ingenierieafrica.com
CMS_INTERNAL_URL=http://cms:3001
~~~

Vérifiez les secrets :

~~~
NODE_ENV=production \
REQUIRED_PRODUCTION_SECRETS="PAYLOAD_SECRET CONTACT_INTERNAL_SECRET CMS_INTERNAL_READ_SECRET AUDIT_HASH_SECRET CONTACT_HASH_SECRET" \
./scripts/assert-production-secrets.sh true
~~~

Si le script est refusé :

~~~
chmod 0755 scripts/assert-production-secrets.sh scripts/oracle-tls.sh
~~~

## 6. Sauvegarde, construction et redémarrage

Avant une mise à jour importante, exécutez la sauvegarde :

~~~
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml --profile ops run --rm backup
~~~

N’utilisez jamais docker compose down -v : cela peut supprimer les volumes PostgreSQL et SeaweedFS.

Validez la configuration. Une sortie vide signifie que la syntaxe est correcte :

~~~
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml config --quiet
~~~

Reconstruisez puis démarrez :

~~~
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml build --pull
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml up -d
~~~

Contrôlez :

~~~
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml ps
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml logs --tail=200 cms-migrate cms web nginx
~~~

PostgreSQL et SeaweedFS doivent être sains. La migration doit être terminée avec succès. CMS, Web et Nginx doivent être healthy ou actifs selon leur configuration.

## 7. DNS, TLS et séparation des domaines

Depuis PowerShell :

~~~
Resolve-DnsName ingenierieafrica.com -Type A
Resolve-DnsName www.ingenierieafrica.com -Type A
Resolve-DnsName admin.ingenierieafrica.com -Type A
Resolve-DnsName africaingenierie.com -Type A
~~~

Les trois premiers noms doivent pointer vers 213.32.70.178. africaingenierie.com doit conserver son ancienne cible.

Si TLS n’est pas encore initialisé, vérifiez d’abord que les DNS sont propagés et que le port 80 répond :

~~~
ENV_FILE=/opt/ingenierieafrica/.env.ovh.test ./scripts/oracle-tls.sh init
~~~

Après une erreur Permission denied :

~~~
chmod 0755 scripts/oracle-tls.sh
ENV_FILE=/opt/ingenierieafrica/.env.ovh.test ./scripts/oracle-tls.sh init
~~~

Vérifiez :

~~~
curl -I https://ingenierieafrica.com/fr
curl -I https://admin.ingenierieafrica.com/admin
curl -I https://ingenierieafrica.com/healthz
curl -I https://admin.ingenierieafrica.com/readyz
~~~

SeaweedFS n’a pas besoin d’un sous-domaine public. Ne créez pas s3.ingenierieafrica.com et n’ouvrez pas ses ports dans UFW.

## 8. Peupler le CMS dans le bon ordre

Connectez-vous avec un compte Payload CMS à :

https://admin.ingenierieafrica.com/admin

Ce compte n’est ni le compte OVH, ni l’utilisateur Ubuntu, ni le compte GitHub.

Créez d’abord le compte administrateur principal avec un mot de passe unique. Créez ensuite des comptes éditeur ou relecteur séparés si plusieurs personnes travaillent sur le contenu. Ne partagez pas le compte administrateur.

### 8.1 Réglages généraux — SiteSettings

Commencez par :

- nom officiel : Africa Ingénierie ;
- slogan et baseline ;
- logo et favicon ;
- adresse et coordonnées ;
- e-mail professionnel ;
- liens sociaux validés ;
- métadonnées SEO par défaut ;
- image de partage social.

Pour chaque champ localisé, saisissez d’abord le français, basculez sur en, puis saisissez l’anglais.

### 8.2 Navigation — Navigation

Configurez l’ordre et les libellés :

- Accueil / Home ;
- Expertises / Expertise ;
- Réalisations / Case studies ;
- Formations & événements / Training & events ;
- Produits / Products ;
- À propos / About ;
- Contact / Contact.

N’affichez que les pages réellement créées et publiées.

### 8.3 Page d’accueil — Homepage

Remplissez :

- sur-titre ;
- titre principal FR et EN ;
- chapeau FR et EN ;
- visuel principal ;
- carrousel et textes alternatifs ;
- ordre des sections ;
- chiffres clés ;
- produits mis en avant ;
- réalisations mises en avant ;
- formations et événements mis en avant ;
- message du dirigeant ;
- témoignages ;
- appel à l’action.

Après publication, contrôlez le résultat en /fr et en /en.

### 8.4 Contenus métier

Créez ensuite les fiches suivantes :

- Expertises : titre, slug, accroche, description, axes de service, image, ordre ;
- Products : description, bénéfices, caractéristiques, image, PDF et contact ;
- Realisations : contexte, intervention, résultats, pays, secteur, images et autorisations ;
- Projects : informations du projet et statut ;
- Formations : objectifs, programme et public ;
- FormationSessions : dates, lieux et disponibilité ;
- Events : type, programme, horaires, ville et pays ;
- Partners : nom, logo autorisé, lien et texte alternatif ;
- TeamMembers : nom, fonction, biographie et portrait autorisé ;
- Testimonials : auteur, fonction, organisation et témoignage validé ;
- LegalDocuments : mentions légales, confidentialité, cookies et conditions si nécessaires.

Une traduction n’est pas une seconde fiche : utilisez les champs localisés FR et EN d’un même contenu.

### 8.5 Règles médias et données personnelles

Avant chaque téléversement :

- vérifier les droits d’utilisation ;
- utiliser un nom de fichier neutre ;
- ajouter un texte alternatif ;
- compresser les images ;
- ne pas publier de plan, contrat ou donnée interne ;
- anonymiser les clients non autorisés ;
- obtenir l’accord pour les portraits et témoignages.

Les données personnelles des formulaires doivent être consultées uniquement par les comptes autorisés et conservées selon la politique de l’entreprise.

## 9. Recette après peuplement

Testez dans cet ordre :

1. page d’accueil FR ;
2. page d’accueil EN ;
3. affichage du logo ;
4. menu burger à droite en 320 px et 390 px ;
5. ouverture et fermeture du menu ;
6. tous les liens de navigation ;
7. pages Expertises, Réalisations, Formations, Produits et À propos ;
8. formulaire de contact ;
9. réception à contact@ingenierieafrica.com ;
10. connexion CMS ;
11. prévisualisation puis publication ;
12. certificats HTTPS ;
13. ports internes non accessibles ;
14. absence de modification de africaingenierie.com.

Critère final : le commit attendu est sur le VPS, les conteneurs sont sains, le site répond en HTTPS, le contenu FR/EN est relu, le formulaire fonctionne et le domaine africaingenierie.com est inchangé.

## 10. Commandes condensées

### PowerShell

~~~
cd 'C:\Projet\Projets- ING'
git status
git switch codex/ovh-preparation
git diff --check
git add packages/ui/src/styles/components.css packages/ui/src/styles/responsive.css docs/guide-mise-a-jour-github-ovh-et-peuplement.md
git diff --cached --check
git commit -m "Improve responsive header and deployment workflow"
git push -u origin codex/ovh-preparation
~~~

### VPS Ubuntu

~~~
cd /opt/ingenierieafrica
git switch codex/ovh-preparation
git fetch origin
git pull --ff-only origin codex/ovh-preparation
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml config --quiet
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml build --pull
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml up -d
docker compose --env-file .env.ovh.test -f docker-compose.prod.yml ps
~~~

Après ces contrôles, utilisez le CMS pour peupler et publier le site.
