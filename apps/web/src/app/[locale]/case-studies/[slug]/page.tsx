/**
 * Adresse anglaise de la rubrique « realisations/[slug] »  -  décision D-02.
 *
 * Les segments d'URL sont traduits, mais l'arborescence de fichiers ne peut
 * pas l'être : Next.js associe un dossier à un segment. Plutôt que de réécrire
 * l'adresse dans le proxy  -  mécanisme qui s'est révélé fragile, la réécriture
 * étant convertie en redirection 308 et produisant une boucle infinie  -  chaque
 * segment anglais est un dossier qui RÉEXPORTE la page française.
 *
 * Une seule implémentation, deux adresses : la page ne peut pas diverger d'une
 * langue à l'autre puisqu'il n'en existe qu'une.
 *
 * `revalidate` est redéclaré et non réexporté : Next.js exige que cette valeur
 * soit un littéral dans le fichier de route.
 */
export { default, generateMetadata } from '../../realisations/[slug]/page'

export const revalidate = 300
