import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { en } from '@payloadcms/translations/languages/en'
import { fr } from '@payloadcms/translations/languages/fr'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import {
  AuditLogs,
  ContactMessages,
  Events,
  Expertises,
  FormationSessions,
  Formations,
  LegalDocuments,
  MediaAssets,
  Pages,
  Partners,
  Products,
  Projects,
  Realisations,
  Redirects,
  TeamMembers,
  Testimonials,
  Users,
} from './collections'
import { AboutPage, CeoMessage, Homepage, Navigation, SiteSettings } from './globals'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Le stockage objet n'est branché que si SeaweedFS/S3 est configuré.
 *
 * Cela permet d'exécuter les migrations et la suite de tests sans le service
 * objet, tout en gardant une configuration unique.
 */
const s3Configured = Boolean(
  process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY,
)

const storagePlugins = s3Configured
  ? [
      s3Storage({
        collections: { 'media-assets': true },
        bucket: process.env.S3_BUCKET || 'africa-media',
        config: {
          endpoint: `${process.env.S3_USE_SSL === 'true' ? 'https' : 'http'}://${
            process.env.S3_ENDPOINT
          }:${process.env.S3_PORT || 8333}`,
          region: process.env.S3_REGION || 'us-east-1',
          // SeaweedFS fonctionne avec l'adressage S3 par chemin.
          forcePathStyle: true,
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY as string,
            secretAccessKey: process.env.S3_SECRET_KEY as string,
          },
        },
      }),
    ]
  : []

/**
 * Configuration Payload  -  modèle de données complet (prompt 03) et sécurité
 * du tableau de bord (prompt 04).
 *
 * Localisation : stratégie NATIVE Payload (décision D-01 validée par le
 * Client). `docs/mpd-postgresql.sql` reste une référence de conception ; le
 * schéma réel est produit par les migrations versionnées de ce dossier.
 */
export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',

  admin: {
    user: Users.slug,
    // L'administration reste en mode clair et reprend les tokens de la
    // référence standalone sans introduire un second système de thème.
    theme: 'light',
    meta: {
      titleSuffix: ' -  Africa Ingénierie',
      // Le dashboard n'est jamais indexé.
      robots: 'noindex, nofollow',
    },
    components: {
      // Bandeau imposant le changement du mot de passe initial.
      beforeDashboard: [
        '@/components/MustChangePasswordBanner#MustChangePasswordBanner',
        '@/components/AdminDashboardSummary#AdminDashboardSummary',
      ],
      beforeNav: ['@/components/AdminBrand#AdminBrand'],
      graphics: {
        Logo: '@/components/AdminLogo#AdminLogo',
        Icon: '@/components/AdminLogo#AdminLogoIcon',
      },
    },
  },

  collections: [
    Users,
    MediaAssets,
    Pages,
    Expertises,
    Projects,
    Realisations,
    Formations,
    FormationSessions,
    Events,
    Products,
    TeamMembers,
    Partners,
    Testimonials,
    LegalDocuments,
    ContactMessages,
    Redirects,
    AuditLogs,
  ],

  globals: [SiteSettings, Navigation, Homepage, CeoMessage, AboutPage],

  /**
   * Langue de l'INTERFACE d'administration  -  à ne pas confondre avec le
   * bilinguisme des contenus (`localization` ci-dessous).
   *
   * Payload choisit la langue du dashboard dans cet ordre : cookie
   * `payload-lng`, puis en-tête `Accept-Language` du navigateur, puis
   * `fallbackLanguage`. Sans réglage, le repli est l'anglais : l'équipe du
   * Client, francophone, ouvrait un tableau de bord dont les libellés
   * (« Public content », « Proof & media », « Media library ») étaient en
   * anglais alors que le sélecteur de contenu affichait « Locale: French ».
   * Deux langues à l'écran pour deux choses différentes : illisible.
   *
   * Le repli est donc le français. L'anglais reste disponible pour un
   * intervenant anglophone, qui le sélectionne dans son compte  -  le choix est
   * mémorisé par le cookie.
   */
  i18n: {
    fallbackLanguage: 'fr',
    supportedLanguages: { fr, en },
  },

  // Bilinguisme natif des CONTENUS  -  décision D-01.
  localization: {
    locales: [
      { code: 'fr', label: { fr: 'Français', en: 'French' } },
      { code: 'en', label: { fr: 'Anglais', en: 'English' } },
    ],
    defaultLocale: 'fr',
    // Repli sur le français pour ne jamais rendre une page vide (RG-012).
    // La publication bilingue reste conditionnée à la complétude réelle des
    // deux langues, contrôlée par `requireCompleteTranslations`.
    fallback: true,
  },

  editor: lexicalEditor(),

  // Aucune valeur par défaut : un démarrage sans secret doit échouer
  // bruyamment plutôt que produire des sessions non sûres.
  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    /**
     * Le schema ne provient QUE des migrations versionnees (regle projet).
     *
     * Sans `push: false`, Payload en mode developpement pousse automatiquement
     * le schema dans PostgreSQL au demarrage du serveur. La base contient
     * alors deja les tables et les types, et `pnpm migrate` echoue ensuite sur
     * `type "_locales" already exists`.
     *
     * Consequence assumee : la base doit etre migree AVANT de demarrer le
     * service `cms` ou de lancer les tests (`pnpm migrate`).
     */
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),

  email: nodemailerAdapter({
    defaultFromAddress: process.env.SMTP_FROM_ADDRESS || 'no-reply@local.africa-ingenierie.test',
    defaultFromName: process.env.SMTP_FROM_NAME || 'Africa Ingenierie (local)',
    transportOptions: {
      host: process.env.SMTP_HOST || 'mailpit',
      port: Number(process.env.SMTP_PORT || 1025),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
      ignoreTLS: process.env.NODE_ENV !== 'production',
    },
  }),

  plugins: storagePlugins,

  sharp,

  // L’API contractuelle des événements est exposée par apps/web. GraphQL
  // n’est pas requis par le cahier des charges et resterait une surface
  // publique supplémentaire sans contrôle de profondeur/complexité.
  graphQL: { disable: true },

  // La limitation de débit sur la connexion est appliquée par Nginx
  // (infra/nginx/conf.d/20-admin.conf) et complétée par le verrouillage
  // progressif de la collection Users.
})
