# @africa-ingenierie/ui  -  design system

Extraction fidèle de `standalone.reference.html`, la maquette validée par le
Client. **Aucune valeur de couleur, de typographie, d'espacement ou de point de
rupture n'a été réinventée.**

## Utilisation

Dans le layout racine de l'application :

```tsx
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/plus-jakarta-sans/wght-italic.css'
import '@fontsource-variable/playfair-display'
import '@fontsource-variable/playfair-display/wght-italic.css'
import '@africa-ingenierie/ui/styles'
```

Puis, pour obtenir la navigation client de Next.js sur tous les liens du
système :

```tsx
'use client'
import NextLink from 'next/link'
import { UiLinkProvider } from '@africa-ingenierie/ui'

export function UiProviders({ children }) {
  return <UiLinkProvider value={NextLink}>{children}</UiLinkProvider>
}
```

L'application doit déclarer `transpilePackages: ['@africa-ingenierie/ui']`
dans sa configuration Next.js : le paquet est distribué en TypeScript source.

## Composants

| Composant | Rôle |
|---|---|
| `Header` | En-tête public : marque, navigation, langues, appel à l'action, menu mobile |
| `Footer` | Pied de page : marque, colonnes, coordonnées, réseaux, liens légaux |
| `Button` / `TextLink` | Actions. `primary` est le rouge : un seul par écran |
| `Card` | Carte de contenu, cliquable ou non, avec règle rouge au survol |
| `Badge` | Étiquette de catégorie ou de statut |
| `Breadcrumbs` | Fil d'Ariane, sur fond bleu ou clair |
| `FormField` + `TextField` / `TextAreaField` / `SelectField` / `Checkbox` | Champs, aide, erreur liée par `aria-describedby`, compteur |
| `Notice` | Message d'état : succès, information, avertissement, erreur |
| `EmptyState` | État vide expliquant ce qui sera publié et par quel moyen |
| `MediaPlaceholder` | Plaque blueprint tenant lieu de photo, avec description obligatoire |
| `DataTable` | Tableau d'administration, défilement horizontal contenu |
| `AdminShell` | Cadre du tableau de bord : barre latérale, en-tête collant, corps |
| `Toast` / `ToastProvider` / `useToast` | Confirmations éphémères |
| `PageHero`, `SectionHead`, `Stats`, `FilterBar`, `Icon` | Blocs de composition |

## Écarts assumés par rapport au prototype

Tracés dans [`docs/decisions.md`](../../docs/decisions.md).

| Écart | Raison |
|---|---|
| **Aucun thème sombre** | D-04  -  interdit par le prompt 02 et le critère de recette |
| **Polices auto-hébergées** | D-09  -  CSP stricte et objectif Lighthouse ≥ 90. Même dessin de caractères |
| **Sélecteur de langue en vrais liens** | Les boutons FR/EN du prototype étaient inertes |
| **Aucune section Actualités** | Hors périmètre du cahier des charges |
| **`.empty-adm` / `.empty-ic` définis** | Utilisés sans être définis dans le prototype : l'état vide de l'administration y était du texte nu |
| **`.toast-stack`** | Le prototype n'affiche qu'un toast à la fois ; la pile évite le chevauchement, sans changer le visuel |
| **Appel à l'action de l'en-tête masqué sous 480 px** | D-11  -  le prototype déborde horizontalement à 320 px. Le bouton reste dans le menu mobile |
| **`.sr-only` sans `position: absolute`** | Un élément absolu sans ancêtre positionné échappe au rognage d'un tableau défilant et élargit le document |

Les classes de gap `g4`, `g6`, `g10`, `g14`, `g18` et `g20` sont employées dans
le balisage du prototype sans exister dans sa feuille de style : elles y valent
donc `gap: 0`. Elles **ne sont pas ajoutées** ici, pour ne pas modifier
l'espacement validé.

## Icônes

`src/icon-paths.ts` est **généré** à partir du prototype (45 tracés, trait 1.75).
Ne pas l'éditer à la main : régénérer depuis `standalone.reference.html`.

## Contrôle visuel

Vérifié au prompt 02 par capture automatisée à 320, 390, 768 et 1440 px, sur la
galerie `/design-system` et sur `/design-system/admin`, en comparaison avec
`standalone.reference.html` rendu aux mêmes largeurs.

| Largeur | Galerie publique | Cadre d'administration | Prototype (référence) |
|---:|---|---|---|
| 320 px | aucun débordement | aucun débordement | **déborde** |
| 390 px | aucun débordement | aucun débordement | aucun débordement |
| 768 px | aucun débordement | aucun débordement | aucun débordement |
| 1440 px | aucun débordement | aucun débordement | aucun débordement |

Pour rejouer le contrôle : `pnpm --filter @africa-ingenierie/web build && pnpm --filter @africa-ingenierie/web start`,
puis ouvrir <http://localhost:3000/design-system>.
