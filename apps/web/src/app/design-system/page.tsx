import type { Metadata } from 'next'

import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  DataTable,
  EmptyState,
  Footer,
  Header,
  Icon,
  MediaPlaceholder,
  Notice,
  PageHero,
  SectionHead,
  Stats,
  TextLink,
  Toast,
  type Column,
} from '@africa-ingenierie/ui'

import { InteractiveFilters, InteractiveForm, ToastDemo } from './demo-interactive'

/**
 * Galerie interne du design system (prompt 02).
 *
 * Elle sert de référence visuelle et de surface de contrôle responsive.
 * Elle n'est jamais indexée et disparaîtra du site public livré.
 */
export const metadata: Metadata = {
  title: 'Design system  -  Africa Ingénierie',
  robots: { index: false, follow: false, nocache: true },
}

const NAV = [
  { label: 'Accueil', href: '/design-system' },
  { label: 'Expertises', href: '/design-system#cartes' },
  { label: 'Réalisations', href: '/design-system#cartes', current: true },
  { label: 'Formations & événements', href: '/design-system#cartes' },
  { label: 'Produits', href: '/design-system#cartes' },
  { label: 'À propos', href: '/design-system#pied' },
]

type Row = {
  title: string
  type: string
  english: boolean
  state: 'Publié' | 'Brouillon' | 'À valider'
  updated: string
}

const ROWS: Row[] = [
  { title: 'Pièces de rechange  -  lignes d’égrenage', type: 'Produit', english: true, state: 'Publié', updated: '24.08.2026' },
  { title: 'Systèmes d’humidification', type: 'Produit', english: false, state: 'À valider', updated: '22.08.2026' },
  { title: 'Ouvrages métalliques sur mesure', type: 'Produit', english: true, state: 'Brouillon', updated: '19.08.2026' },
]

const STATE_TONE = {
  'Publié': 'ok',
  'Brouillon': 'neutral',
  'À valider': 'warn',
} as const

const COLUMNS: Column<Row>[] = [
  { key: 'title', header: 'Contenu', cell: (row) => <span style={{ fontWeight: 600 }}>{row.title}</span> },
  { key: 'type', header: 'Type', cell: (row) => <span className="small">{row.type}</span> },
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
  { key: 'state', header: 'État', cell: (row) => <Badge tone={STATE_TONE[row.state]}>{row.state}</Badge> },
  { key: 'updated', header: 'Modifié', cell: (row) => <span className="small num">{row.updated}</span> },
]

function Swatch({ token, name }: { token: string; name: string }) {
  return (
    <div className="stack g8">
      <div
        style={{
          height: 64,
          borderRadius: 'var(--r-btn)',
          background: `var(${token})`,
          border: '1px solid var(--line)',
        }}
      />
      <span className="tiny">
        <strong style={{ color: 'var(--ink)' }}>{name}</strong>
        <br />
        {token}
      </span>
    </div>
  )
}

export default function DesignSystemPage() {
  return (
    <>
      <Header
        siteName="Africa Ingénierie"
        tagline="Ingénierie industrielle"
        homeHref="/design-system"
        nav={NAV}
        cta={{ label: 'Contact', href: '/design-system#formulaires' }}
        locales={[
          { code: 'fr', label: 'FR', href: '/design-system', current: true },
          { code: 'en', label: 'EN', href: '/design-system', current: false },
        ]}
      />

      <main id="main">
        <PageHero
          eyebrow="Référence interne"
          title="Design system Africa Ingénierie"
          intro="Extraction fidèle de la maquette validée. Thème clair uniquement, aucune section Actualités, polices auto-hébergées."
          crumbs={[
            { label: 'Accueil', href: '/design-system' },
            { label: 'Design system' },
          ]}
        />

        {/* ── Couleurs ─────────────────────────────────────── */}
        <section className="sec" id="couleurs">
          <div className="wrap">
            <SectionHead
              eyebrow="Fondations"
              title="Palette de couleurs."
              intro="Le bleu porte la marque, le rouge ne sert qu'à l'action et à l'accent. Les neutres ont un biais bleu."
            />
            <div className="grid c4">
              <Swatch token="--brand" name="Marque" />
              <Swatch token="--brand-deep" name="Marque profonde" />
              <Swatch token="--brand-600" name="Marque claire" />
              <Swatch token="--brand-100" name="Marque 100" />
              <Swatch token="--accent" name="Accent" />
              <Swatch token="--accent-700" name="Accent foncé" />
              <Swatch token="--ink" name="Encre" />
              <Swatch token="--ink-500" name="Encre 500" />
              <Swatch token="--ok" name="Succès" />
              <Swatch token="--warn" name="Avertissement" />
              <Swatch token="--err" name="Erreur" />
              <Swatch token="--info" name="Information" />
            </div>
          </div>
        </section>

        {/* ── Typographie ──────────────────────────────────── */}
        <section className="sec tint" id="typographie">
          <div className="wrap">
            <SectionHead
              eyebrow="Fondations"
              title="Hiérarchie typographique."
              intro="Playfair Display pour les titres, Plus Jakarta Sans pour l'interface."
            />
            <div className="stack g24">
              <p className="d1">Display  -  Des solutions <span className="serif-it" style={{ color: 'var(--brand)' }}>fiables</span></p>
              <h1 className="h1">Titre de niveau 1</h1>
              <h2 className="h2">Titre de niveau 2</h2>
              <h3 className="h3">Titre de niveau 3</h3>
              <h4 className="h4">Titre de niveau 4</h4>
              <p className="lead measure">
                Chapeau  -  Maintenance, installation, formation et équipements industriels, conçus
                pour les contraintes réelles d&apos;exploitation en Afrique de l&apos;Ouest.
              </p>
              <p className="body measure">
                Texte courant  -  Nos équipes interviennent sur l&apos;ensemble du cycle de vie de vos
                équipements industriels, en tenant compte de la disponibilité réelle des pièces.
              </p>
              <p className="small">Texte secondaire  -  précision, légende, métadonnée.</p>
              <p className="tiny">Texte fin  -  mention légale, horodatage.</p>
            </div>
          </div>
        </section>

        {/* ── Boutons ──────────────────────────────────────── */}
        <section className="sec" id="boutons">
          <div className="wrap stack g32">
            <SectionHead
              eyebrow="Composants"
              title="Boutons et liens."
              intro="Le bouton rouge est l'action principale : un seul visible par écran."
            />
            <div className="row">
              <Button variant="primary" iconRight={<Icon name="arrow" size={17} />}>
                Demander un diagnostic
              </Button>
              <Button variant="brand">Nous contacter</Button>
              <Button variant="outline">Découvrir nos expertises</Button>
              <Button variant="brand" disabled>
                Indisponible
              </Button>
            </div>
            <div className="row">
              <Button variant="primary" size="sm">Petit primaire</Button>
              <Button variant="brand" size="sm">Petit marque</Button>
              <Button variant="outline" size="sm">Petit contour</Button>
              <TextLink href="#boutons" arrow={<Icon name="arrow" size={17} />}>
                Lien texte fléché
              </TextLink>
            </div>
            <div className="sec-sm" style={{ background: 'var(--brand)', borderRadius: 'var(--r-card)', padding: 26 }}>
              <div className="row">
                <Button variant="ghost-light" iconLeft={<Icon name="wa" size={17} />}>
                  Écrire sur WhatsApp
                </Button>
                <TextLink href="#boutons" onBrand arrow={<Icon name="arrow" size={16} />}>
                  Lien sur fond bleu
                </TextLink>
              </div>
            </div>
          </div>
        </section>

        {/* ── Étiquettes ───────────────────────────────────── */}
        <section className="sec tint" id="etiquettes">
          <div className="wrap stack g24">
            <SectionHead eyebrow="Composants" title="Étiquettes et fils d'Ariane." />
            <div className="row">
              <Badge>Maintenance</Badge>
              <Badge tone="red">Nouveau</Badge>
              <Badge tone="ok" dot>Publié</Badge>
              <Badge tone="warn" dot>À valider</Badge>
              <Badge tone="err" dot>Erreur</Badge>
              <Badge tone="neutral">Brouillon</Badge>
              <Badge tone="outline">2025</Badge>
            </div>
            <Breadcrumbs
              onLight
              items={[
                { label: 'Accueil', href: '/design-system' },
                { label: 'Réalisations', href: '/design-system' },
                { label: 'Sapin monumental en acier  -  Ekpè' },
              ]}
            />
            <InteractiveFilters />
          </div>
        </section>

        {/* ── Cartes ───────────────────────────────────────── */}
        <section className="sec" id="cartes">
          <div className="wrap">
            <SectionHead
              eyebrow="Composants"
              title="Cartes et plaques média."
              intro="La règle rouge n'apparaît qu'au survol d'une carte cliquable."
              link={{ label: 'Toutes les réalisations', href: '/design-system' }}
            />
            <div className="grid c3">
              <Card href="/design-system" ruled padding="md" className="stack g16">
                <span
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 13,
                    background: 'var(--brand-100)',
                    color: 'var(--brand)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Icon name="wrench" size={25} />
                </span>
                <h3 className="h3">Maintenance industrielle</h3>
                <p className="body" style={{ flex: 1 }}>
                  Maintenance préventive, corrective, prédictive et conditionnelle pour améliorer la
                  disponibilité de vos équipements.
                </p>
                <span className="tlink" style={{ pointerEvents: 'none' }}>
                  Découvrir <Icon name="arrow" size={16} />
                </span>
              </Card>

              <Card href="/design-system" ruled>
                <MediaPlaceholder label="Photo de réalisation  -  Sapin monumental en acier, Ekpè" />
                <div className="card-pad stack g12" style={{ flex: 1 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <Badge>Construction métallique</Badge>
                    <Badge tone="outline">
                      <span className="num">2025</span>
                    </Badge>
                  </div>
                  <h3 className="h3">Sapin monumental en acier  -  Ekpè</h3>
                  <p className="body" style={{ flex: 1 }}>
                    Conception et fabrication d&apos;un sapin lumineux de 9,5 m en acier GKS.
                  </p>
                  <span className="tlink" style={{ pointerEvents: 'none' }}>
                    Voir la réalisation <Icon name="arrow" size={16} />
                  </span>
                </div>
              </Card>

              <Card padding="md" className="stack g16">
                <Badge tone="neutral">Carte non cliquable</Badge>
                <h3 className="h3">Contenu informatif</h3>
                <p className="body" style={{ flex: 1 }}>
                  Sans lien, la carte ne prend ni règle rouge ni élévation au survol.
                </p>
                <div className="stack g8" style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 14 }}>
                  <span className="small row" style={{ gap: 8 }}>
                    <Icon name="clock" size={15} /> 21 h  -  3 jours
                  </span>
                  <span className="small row" style={{ gap: 8 }}>
                    <Icon name="cal" size={15} /> Prochaine session à programmer
                  </span>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* ── Chiffres ─────────────────────────────────────── */}
        <section className="sec brand bp" id="chiffres">
          <div className="wrap stack g48">
            <div className="stack">
              <p className="eyebrow on-brand">En chiffres</p>
              <h2 className="h2" style={{ color: '#fff' }}>
                Une expérience mesurable.
              </h2>
            </div>
            <Stats
              items={[
                { value: 28, suffix: 'ans', label: "D'expérience industrielle" },
                { value: 6, label: "Domaines d'expertise" },
                { value: 4, label: "Pays d'intervention" },
                { value: null, suffix: '%', label: 'Gain de productivité (non renseigné → masqué)' },
              ]}
            />
          </div>
        </section>

        {/* ── Formulaires ──────────────────────────────────── */}
        <section className="sec" id="formulaires">
          <div className="wrap split" style={{ alignItems: 'start' }}>
            <div className="stack g24">
              <SectionHead
                eyebrow="Composants"
                title="Formulaires."
                intro="Chaque erreur est liée à son champ pour les lecteurs d'écran."
              />
              <InteractiveForm />
            </div>
            <div className="stack g16">
              <Notice tone="ok" title="Votre demande a bien été envoyée">
                Un accusé de réception vient de vous être adressé par email. Un ingénieur vous répond
                sous 24 h ouvrées.
              </Notice>
              <Notice tone="err" title="Votre demande n'a pas pu être envoyée">
                Vous devez accepter la politique de confidentialité pour envoyer votre demande.
              </Notice>
              <Notice tone="warn" title="Traduction anglaise incomplète">
                La publication bilingue est bloquée tant que le titre et le résumé anglais manquent.
              </Notice>
              <Notice tone="info" title="Pas de vente en ligne">
                Nos équipements font l&apos;objet d&apos;une étude préalable et d&apos;un devis
                nominatif. Aucun paiement n&apos;est réalisé sur ce site.
              </Notice>
            </div>
          </div>
        </section>

        {/* ── États vides, tableau, toast ──────────────────── */}
        <section className="sec tint" id="etats">
          <div className="wrap stack g48">
            <SectionHead
              eyebrow="Composants"
              title="États vides, tableaux et confirmations."
              intro="Une section sans donnée explique ce qui sera publié  -  elle n'affiche jamais un cadre vide."
            />

            <div className="grid c2">
              <EmptyState
                icon="box"
                title="Catalogue en cours de constitution"
                text="Les produits seront publiés depuis le tableau de bord."
                action={{ label: 'Demander un devis', href: '/design-system#formulaires' }}
              />
              <EmptyState
                icon="cal"
                title="Événements en préparation"
                text="Les prochains rendez-vous seront publiés depuis le tableau de bord."
              />
            </div>

            <DataTable
              columns={COLUMNS}
              rows={ROWS}
              rowKey={(row) => row.title}
              caption="Produits  -  extrait du tableau d'administration"
            />

            <div className="stack g16">
              <h3 className="h3">Squelette de chargement</h3>
              <div className="stack g12">
                <div className="skel" style={{ height: 18, width: '40%' }} />
                <div className="skel" style={{ height: 14, width: '80%' }} />
                <div className="skel" style={{ height: 14, width: '65%' }} />
              </div>
            </div>

            <div className="stack g16">
              <h3 className="h3">Confirmations</h3>
              <ToastDemo />
              <Toast inline text="Produit publié et visible dans le catalogue public" />
            </div>

            <div className="row">
              <Button href="/design-system/admin" variant="brand" iconRight={<Icon name="arrow" size={17} />}>
                Voir le cadre d&apos;administration
              </Button>
            </div>
          </div>
        </section>
      </main>

      <div id="pied">
        <Footer
          siteName="Africa Ingénierie"
          tagline="Ingénierie industrielle"
          baseline="Notre engagement est d'offrir des services d'ingénierie de haute précision afin de valoriser l'expertise africaine, d'innover localement et d'accompagner les industries vers un niveau d'excellence durable."
          homeHref="/design-system"
          year={2026}
          columns={[
            { title: 'Navigation', links: NAV.map(({ label, href }) => ({ label, href })) },
            {
              title: 'Domaines',
              links: [
                { label: 'Maintenance industrielle', href: '/design-system' },
                { label: 'Installation & mise en service', href: '/design-system' },
                { label: 'Formation en optimisation', href: '/design-system' },
                { label: "Fourniture d'équipements", href: '/design-system' },
                { label: 'Soudure & chaudronnerie', href: '/design-system' },
                { label: 'Énergie, domotique & sécurité', href: '/design-system' },
              ],
            },
          ]}
          contact={{
            title: 'Nous joindre',
            addressLines: [
              'La Verdure, Tranche I, Lot 01, Parcelle L',
              'Ouèdo, Abomey-Calavi, Bénin',
            ],
            phone: { label: '+229 01 42 54 54 95', href: '+2290142545495' },
            email: 'contact@africaingenieries.com',
            whatsapp: { label: 'WhatsApp', href: '/design-system#formulaires' },
          }}
          socials={[
            { network: 'li', name: 'LinkedIn', url: '/design-system' },
            { network: 'fb', name: 'Facebook', url: '/design-system' },
            { network: 'yt', name: 'YouTube' },
          ]}
          legalLinks={[
            { label: 'Mentions légales', href: '/design-system' },
            { label: 'Politique de confidentialité', href: '/design-system' },
            { label: 'Cookies', href: '/design-system' },
          ]}
        />
      </div>
    </>
  )
}
