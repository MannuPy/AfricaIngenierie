# Audit du site de référence et comparaison avec le projet local

Date de l’audit : **7 septembre 2026**  
Référence consultée : [africaingenierie.com](https://africaingenierie.com/)  
Projet audité : application locale `apps/web` + CMS `apps/cms`.

## 1. Résumé exécutif

Le projet local possède déjà une base fonctionnelle plus complète que la page
d’accueil actuellement visible sur le site de référence : administration Payload,
publication bilingue, prévisualisation, médiathèque, formulaires, événements,
témoignages modérés, produits et réglages de pied de page.

L’écart principal était visuel et éditorial : le site local utilisait encore un
pictogramme générique à plusieurs endroits, le pack de démonstration contenait
des images abstraites et certains textes/indicateurs ne correspondaient pas aux
contenus visibles sur la référence. Les logos et images fournis par le Client
sont maintenant intégrés au dépôt et le seed les traite comme des ressources
validées, sans les remplacer par des visuels de démonstration.

## 2. Structure observée sur le site de référence

La page d’accueil de référence suit cette séquence :

1. En-tête : logo, navigation principale, langue et contact.
2. Hero : accroche industrielle, paragraphe de positionnement et deux appels à
   l’action.
3. Mots-clés de services : maintenance, installation, formation, fourniture,
   soudure, énergie et diagnostic.
4. Expertises : six domaines présentés sous forme de cartes.
5. Chiffres clés : projets, expérience, pays couverts et gain de productivité.
6. Leadership : message du Directeur Général.
7. Portfolio : projets récents et réalisations avant/après.
8. Témoignages clients.
9. Actualités et formations à venir.
10. Médiathèque vidéo.
11. Appel à collaboration.
12. Pied de page : menu, domaines, coordonnées et réseaux sociaux.

Le parti pris graphique est éditorial et institutionnel : grands titres à
empattements, texte courant sans empattements, beaucoup d’espace blanc,
encadrements fins, bleu profond pour les zones d’action et accent chaud pour
les éléments de mise en avant. La mini-charte fournie confirme l’usage du
symbole AF et des couleurs bleu cyan, bleu moyen et gris anthracite.

## 3. Comparaison avec le projet local

| Zone | Référence | Projet local | État |
|---|---|---|---|
| En-tête | Logo officiel et menu institutionnel | Menu administrable, langues FR/EN, CTA Contact, menu mobile | Fonctionnel ; logo officiel raccordé |
| Hero | Accroche et présentation industrielles | Texte demandé par la hiérarchie, 3 visuels administrables | Aligné ; carousel piloté par le CMS |
| Expertises | 6 domaines avec descriptions | Collection `expertises`, cartes et pages détaillées | Aligné |
| Chiffres clés | 4 indicateurs | Global Homepage, valeur/ suffixe/ visibilité administrables | Aligné |
| Réalisations | Portfolio et avant/après | Collection `realisations` avec médias avant/après | Fonctionnel |
| Témoignages | Avis publiés | Collecte publique, modération admin, maximum 5 en vitrine, navigation carousel | Fonctionnel selon les règles métier du projet |
| Produits | Fiches produits | PDF téléchargeable, vidéo locale ou YouTube, galerie 360°, prix facultatif | Présent dans le schéma et le rendu produit |
| Événements | Dates, lieux et contenus | Collection bilingue et tri par événement à venir | Fonctionnel |
| Actualités | Bloc éditorial séparé | Pas de collection `news` dédiée dans le schéma local actuel | Écart à traiter si nécessaire |
| Vidéos | Médiathèque vidéo | Vidéo YouTube/fichier sur les contenus concernés | Partiellement équivalent |
| Pied de page | Coordonnées + WhatsApp/Facebook/Instagram | Coordonnées, carte, WhatsApp et réseaux administrables | Fonctionnel si les URL sont renseignées |
| Administration | Gestion éditoriale | Payload, rôles, statuts, journal d’audit, prévisualisation | Plus complet que la référence visible |

## 4. Textes de référence contrôlés et appliqués

Les textes structurants suivants ont été appliqués dans le seed CMS puis
répercutés dans la base locale, en français et en anglais :

- « Des solutions d’ingénierie fiables, innovantes et accessibles pour une
  industrie africaine plus performante. »
- « Africa Ingénierie accompagne les entreprises dans l’optimisation et la
  performance de leurs unités de production… »
- « Nos domaines d’expertise » et les six domaines : énergie, fourniture
  d’équipements, soudure & chaudronnerie, maintenance, installation & mise en
  service, formations techniques & optimisation industrielle.
- « Notre impact en chiffres » avec les indicateurs `2+ projets lancés`, `20+ ans
  d'expérience`, `6+ pays couverts` et `100% de gain de productivité`.
- « La satisfaction de nos clients est au cœur de notre démarche. » ainsi que
  le texte d'introduction de la section témoignages.
- « Actualités & Formations à venir » et « Vidéos remarquables ».
- Le pied de page institutionnel avec l’adresse à Ouèdo, le numéro béninois,
  l’adresse électronique et les liens de contact.

Les textes affichés par le projet local restent administrables dans le CMS.
La réparation appliquée est ciblée : elle remplace uniquement les anciennes
valeurs connues du contenu de démonstration et complète les champs réellement
vides. Une modification éditoriale ultérieure de la hiérarchie ne doit pas être
annulée par un redéploiement.

## 5. Ressources validées intégrées

Les ressources ont été copiées dans le dépôt sans modification destructive :

- logo horizontal et symbole AF en SVG dans `apps/web/public/brand` et
  `apps/cms/public/brand` ;
- photos du sapin, affiche de la soirée des bacheliers et logo SONIMEX dans le
  pack de seed CMS ;
- photos du salon et des tables métalliques dans
  `apps/cms/src/seed/assets/approved`.

Les images approuvées conservent leur ratio 800×400 lorsqu’il est fourni.
Le pipeline ne les recadre plus en 16:9, conserve le PNG lorsque nécessaire,
et utilise une qualité d’encodage supérieure pour ces ressources. Les visuels
réels sont marqués comme approuvés et ne sont pas remplacés par le seed lors
d’une exécution ultérieure.

## 6. Points encore à surveiller

1. Les URL Facebook et LinkedIn doivent être saisies dans **Réglages généraux**
   avant que leurs icônes apparaissent : une icône sans URL serait un lien mort.
2. La page de référence possède un bloc actualités/média plus développé que le
   schéma local. Si la hiérarchie souhaite une copie stricte de ces deux blocs,
   il faudra ajouter des collections éditoriales dédiées plutôt que détourner
   les collections événements ou projets.
3. Les données déjà présentes dans la base locale sont protégées par le seed.
   Pour remplacer volontairement un contenu réel, l’administrateur doit le
   faire dans Payload ou lancer explicitement un seed forcé après sauvegarde.
4. Une recette visuelle finale doit être exécutée en français et en anglais,
   sur desktop et mobile, avec le contenu réellement saisi par l’équipe.

## 7. Conclusion

Le projet local dispose des fondations nécessaires pour reproduire la structure
et l’identité du site de référence tout en conservant une administration plus
riche. Le présent audit sert de référence de comparaison ; les contenus métier
restent pilotés par l’administration afin de ne pas figer les textes validés
dans le code.
