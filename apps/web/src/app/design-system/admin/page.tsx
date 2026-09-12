import type { Metadata } from 'next'

import {
  AdminShell,
  Badge,
  Button,
  DataTable,
  Icon,
  Notice,
  type AdminNavGroup,
  type Column,
} from '@africa-ingenierie/ui'

export const metadata: Metadata = {
  title: "Design system  -  cadre d'administration",
  robots: { index: false, follow: false, nocache: true },
}

const GROUPS: AdminNavGroup[] = [
  {
    title: 'Pilotage',
    items: [
      { key: 'dashboard', label: 'Tableau de bord', href: '/design-system/admin', icon: 'grid' },
      { key: 'controle', label: 'Contrôle avant publication', href: '/design-system/admin', icon: 'shield' },
    ],
  },
  {
    title: 'Contenus publics',
    items: [
      { key: 'expertises', label: 'Expertises', href: '/design-system/admin', icon: 'layers', count: 6 },
      { key: 'projets', label: 'Projets', href: '/design-system/admin', icon: 'target', count: 2 },
      { key: 'realisations', label: 'Réalisations', href: '/design-system/admin', icon: 'layers', count: 4 },
      { key: 'formations', label: 'Formations', href: '/design-system/admin', icon: 'grad', count: 3 },
      { key: 'evenements', label: 'Événements', href: '/design-system/admin', icon: 'cal', count: 3 },
      { key: 'produits', label: 'Produits', href: '/design-system/admin', icon: 'box', count: 4, current: true },
      { key: 'contact', label: 'Contact', href: '/design-system/admin', icon: 'mail' },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { key: 'reglages', label: 'Réglages généraux', href: '/design-system/admin', icon: 'gear' },
      { key: 'utilisateurs', label: 'Utilisateurs & rôles', href: '/design-system/admin', icon: 'lock', count: 6 },
      { key: 'historique', label: 'Historique', href: '/design-system/admin', icon: 'hist' },
    ],
  },
]

type Row = {
  title: string
  category: string
  english: boolean
  state: 'Publié' | 'Brouillon' | 'À valider'
  updated: string
}

const ROWS: Row[] = [
  { title: 'Pièces de rechange  -  lignes d’égrenage', category: 'Pièces de rechange · Sur commande', english: true, state: 'Publié', updated: '24.08.2026' },
  { title: "Systèmes d'humidification", category: 'Équipements de procédé · Étude sur mesure', english: false, state: 'À valider', updated: '22.08.2026' },
  { title: 'Ouvrages métalliques sur mesure', category: 'Construction métallique · Sur devis', english: true, state: 'Brouillon', updated: '19.08.2026' },
  { title: 'Tableaux électriques industriels', category: 'Énergie · Sur devis', english: true, state: 'Publié', updated: '15.08.2026' },
]

const TONE = { 'Publié': 'ok', 'Brouillon': 'neutral', 'À valider': 'warn' } as const

const COLUMNS: Column<Row>[] = [
  { key: 'title', header: 'Contenu', cell: (row) => <span style={{ fontWeight: 600 }}>{row.title}</span> },
  { key: 'cat', header: 'Catégorie / disponibilité', cell: (row) => <span className="small">{row.category}</span> },
  {
    key: 'lang',
    header: 'FR / EN',
    cell: (row) => (
      <span className="row" style={{ gap: 5 }}>
        <Badge tone="ok">FR</Badge>
        {row.english ? <Badge tone="ok">EN</Badge> : <Badge tone="warn">EN !</Badge>}
      </span>
    ),
  },
  { key: 'state', header: 'État', cell: (row) => <Badge tone={TONE[row.state]}>{row.state}</Badge> },
  { key: 'updated', header: 'Modifié', cell: (row) => <span className="small num">{row.updated}</span> },
  {
    key: 'actions',
    header: 'Actions',
    srOnlyHeader: true,
    align: 'right',
    cell: (row) => (
      <span className="row nowrap" style={{ gap: 6, justifyContent: 'flex-end' }}>
        <span className="icon-btn" style={{ width: 34, height: 34 }} aria-label={`Modifier ${row.title}`}>
          <Icon name="edit" size={15} />
        </span>
        <span className="icon-btn" style={{ width: 34, height: 34 }} aria-label={`Prévisualiser ${row.title}`}>
          <Icon name="eye" size={15} />
        </span>
      </span>
    ),
  },
]

export default function AdminDemoPage() {
  return (
    <AdminShell
      title="Produits"
      subtitle="Équipements, pièces de rechange et solutions"
      groups={GROUPS}
      user={{ initials: 'AD', name: 'Arnaud DEGLA', role: 'Administrateur' }}
      actions={
        <Button variant="primary" size="sm" iconLeft={<Icon name="edit" size={15} />}>
          Nouveau contenu
        </Button>
      }
      footerItems={[
        { key: 'site', label: 'Voir le site', href: '/design-system', icon: 'eye' },
        { key: 'logout', label: 'Déconnexion', href: '/design-system', icon: 'logout' },
      ]}
    >
      <Notice tone="info" title="Ce module contrôle les éléments visibles suivants">
        Référence, catégorie et slug · Titre FR / EN · Accroche courte · Disponibilité et délai ·
        Description détaillée · Caractéristiques techniques · Visuel et texte alternatif · SEO et
        publication. La publication est bloquée si un champ obligatoire, le texte alternatif ou la
        traduction active sont incomplets.
      </Notice>

      <div className="grid c4">
        <div className="kpi">
          <span className="lb">Contenus publiés</span>
          <span className="vl">42</span>
          <span className="ft">+3 cette semaine</span>
        </div>
        <div className="kpi">
          <span className="lb">En attente de validation</span>
          <span className="vl">5</span>
          <span className="ft">dont 2 produits</span>
        </div>
        <div className="kpi">
          <span className="lb">Traductions manquantes</span>
          <span className="vl">7</span>
          <span className="ft">bloquent la publication bilingue</span>
        </div>
        <div className="kpi">
          <span className="lb">Messages non lus</span>
          <span className="vl">3</span>
          <span className="ft">sur 27 reçus</span>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-card-h">
          <h2 className="h3">Catalogue produits</h2>
          <div className="langtab" role="group" aria-label="Langue d'édition">
            <button type="button" aria-pressed="true">FR</button>
            <button type="button" aria-pressed="false">EN</button>
          </div>
        </div>
        <DataTable columns={COLUMNS} rows={ROWS} rowKey={(row) => row.title} />
      </div>

      <div className="adm-card">
        <div className="adm-card-h">
          <h2 className="h3">Contrôle avant publication</h2>
        </div>
        <div className="chk-row">
          <span className="chk-ic pass"><Icon name="check" size={15} /></span>
          <div className="stack g8">
            <strong>Métadonnées SEO complètes</strong>
            <span className="small">Titre et description uniques dans les deux langues.</span>
          </div>
        </div>
        <div className="chk-row">
          <span className="chk-ic warn"><Icon name="alert" size={15} /></span>
          <div className="stack g8">
            <strong>Traduction anglaise incomplète</strong>
            <span className="small">Un produit sur quatre n&apos;a pas de résumé anglais.</span>
          </div>
        </div>
        <div className="chk-row">
          <span className="chk-ic fail"><Icon name="x" size={15} /></span>
          <div className="stack g8">
            <strong>Texte alternatif manquant</strong>
            <span className="small">Deux visuels produits n&apos;ont pas de description.</span>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
