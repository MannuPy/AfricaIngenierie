/**
 * Design system Africa Ingénierie.
 *
 * Extrait de `standalone.reference.html`, la maquette validée. Les valeurs de
 * couleur, de typographie, d'espacement et les points de rupture sont repris
 * tels quels : ce paquet ne réinvente rien.
 *
 * Deux écarts assumés, tracés dans docs/decisions.md :
 *   • D-04  -  aucun thème sombre ;
 *   • D-09  -  polices auto-hébergées (@fontsource-variable) au lieu du CDN
 *     Google Fonts. Le dessin des caractères est identique.
 *
 * La feuille de style s'importe séparément :
 *   import '@africa-ingenierie/ui/styles'
 */

export const DESIGN_SYSTEM_SOURCE = 'standalone.reference.html'

export { cx } from './cx'
export { ICON_PATHS, ICON_NAMES, type IconName } from './icon-paths'
export { UiLinkProvider, useUiLink, type UiLinkProps } from './link-context'

export { Icon, type IconProps } from './components/Icon'
export { Link, type LinkProps } from './components/Link'
export {
  Button,
  TextLink,
  type ButtonProps,
  type ButtonLinkProps,
  type ButtonVariant,
  type ButtonSize,
  type TextLinkProps,
} from './components/Button'
export { Badge, type BadgeProps, type BadgeTone } from './components/Badge'
export { Card, type CardProps, type CardPadding } from './components/Card'
export {
  MediaPlaceholder,
  type MediaPlaceholderProps,
  type MediaRatio,
} from './components/MediaPlaceholder'
export { Breadcrumbs, type BreadcrumbsProps, type Crumb } from './components/Breadcrumbs'
export {
  FormField,
  TextField,
  TextAreaField,
  SelectField,
  Checkbox,
  type FormFieldProps,
  type TextFieldProps,
  type TextAreaFieldProps,
  type SelectFieldProps,
  type CheckboxProps,
} from './components/FormField'
export { Notice, type NoticeProps, type NoticeTone } from './components/Notice'
export { EmptyState, type EmptyStateProps } from './components/EmptyState'
export { PageHero, type PageHeroProps } from './components/PageHero'
export { SectionHead, type SectionHeadProps } from './components/SectionHead'
export { DataTable, type DataTableProps, type Column } from './components/DataTable'
export {
  Toast,
  ToastProvider,
  useToast,
  type ToastProps,
  type ToastMessage,
} from './components/Toast'
export {
  Header,
  type HeaderProps,
  type HeaderLabels,
  type NavItem,
  type LocaleOption,
} from './components/Header'
export {
  Footer,
  type FooterProps,
  type FooterLabels,
  type FooterColumn,
  type SocialLink,
} from './components/Footer'
export {
  AdminShell,
  type AdminShellProps,
  type AdminNavGroup,
  type AdminNavItem,
  type AdminUser,
} from './components/AdminShell'
export { Stats, type StatsProps, type StatItem } from './components/Stat'
export { FilterBar, type FilterBarProps, type FilterOption } from './components/FilterBar'
export { MapFrame, type MapFrameProps } from './components/MapFrame'
