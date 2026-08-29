import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'

import {
  ensureUser,
  errorMessage,
  getTestPayload,
  productData,
  productDataEn,
  resetTestContent,
  type TestUser,
} from './helpers'

/**
 * Règles de publication  -  RG-011, RG-006, RG-007, RG-023 et exigences SEO.
 *
 * Ces tests portent sur ce qui protège la qualité du site public : une page
 * incomplète, une traduction manquante, un lien mort ou un archivage
 * accidentel ne doivent jamais atteindre le visiteur.
 */
describe('Workflow éditorial', () => {
  let payload: Payload
  let publisher: TestUser
  let admin: TestUser

  beforeAll(async () => {
    payload = await getTestPayload()
    await resetTestContent(payload)
    publisher = await ensureUser(payload, 'publisher')
    admin = await ensureUser(payload, 'administrator')
  })

  afterAll(async () => {
    // Les produits REF-* servent uniquement aux règles de gestion et ne
    // doivent pas polluer le catalogue visible après les tests.
    await resetTestContent(payload)
  })

  describe('Complétude bilingue (RG-011)', () => {
    it('refuse la publication quand la traduction anglaise manque', async () => {
      const created = await payload.create({
        collection: 'products',
        data: productData('REF-WF-EN-MISSING', 'traduction-manquante'),
        user: publisher,
        overrideAccess: false,
        locale: 'fr',
      })

      let message = ''
      try {
        await payload.update({
          collection: 'products',
          id: created.id,
          data: { editorialStatus: 'published' },
          user: publisher,
          overrideAccess: false,
          locale: 'fr',
        })
      } catch (error) {
        message = errorMessage(error)
      }

      expect(message).toContain('EN')

      const reread = await payload.findByID({
        collection: 'products',
        id: created.id,
        overrideAccess: true,
      })
      expect(reread.editorialStatus).toBe('draft')
    })

    it('autorise la publication quand les deux langues sont complètes', async () => {
      const created = await payload.create({
        collection: 'products',
        data: productData('REF-WF-BILINGUAL', 'traduction-complete'),
        user: publisher,
        overrideAccess: false,
        locale: 'fr',
      })

      await payload.update({
        collection: 'products',
        id: created.id,
        data: productDataEn(),
        user: publisher,
        overrideAccess: false,
        locale: 'en',
      })

      const published = await payload.update({
        collection: 'products',
        id: created.id,
        data: { editorialStatus: 'published' },
        user: publisher,
        overrideAccess: false,
        locale: 'fr',
      })

      expect(published.editorialStatus).toBe('published')
    })
  })

  describe('Archivage (RG-007)', () => {
    it('refuse un archivage sans motif', async () => {
      const created = await payload.create({
        collection: 'products',
        data: productData('REF-WF-ARCHIVE-NO-REASON', 'archivage-sans-motif'),
        user: publisher,
        overrideAccess: false,
      })

      await expect(
        payload.update({
          collection: 'products',
          id: created.id,
          data: { editorialStatus: 'archived' },
          user: publisher,
          overrideAccess: false,
        }),
      ).rejects.toThrow()
    })

    it('accepte un archivage motivé et le journalise', async () => {
      const created = await payload.create({
        collection: 'products',
        data: productData('REF-WF-ARCHIVE-OK', 'archivage-motive'),
        user: publisher,
        overrideAccess: false,
      })

      const archived = await payload.update({
        collection: 'products',
        id: created.id,
        data: {
          editorialStatus: 'archived',
          archiveReason: 'Référence retirée du catalogue par le fournisseur.',
        },
        user: publisher,
        overrideAccess: false,
      })

      expect(archived.editorialStatus).toBe('archived')

      const logs = await payload.find({
        collection: 'audit-logs',
        where: { and: [{ entityType: { equals: 'products' } }, { action: { equals: 'archive' } }] },
        sort: '-createdAt',
        limit: 1,
        overrideAccess: true,
      })

      expect(logs.docs.length).toBe(1)
      expect(logs.docs[0]?.note).toContain('fournisseur')
    })
  })

  describe('Destination du bouton produit (RG-023)', () => {
    /**
     * La règle exigeait qu'un bouton produit ne puisse viser qu'une route
     * interne ou une URL https. Elle était appliquée par une validation sur un
     * champ libre `ctaHref`.
     *
     * Le champ a été RETIRÉ du modèle : le bouton mène toujours à la page
     * Contact. Une adresse arbitraire ne peut donc plus être saisie, ni par le
     * tableau de bord, ni par l'API, ni par une requête forgée  -  ce qui est
     * une garantie plus forte qu'une validation, laquelle peut être contournée
     * par un défaut de configuration.
     *
     * Le test vérifie désormais l'invariant de SCHÉMA, pas le message de
     * refus : le champ ne doit exister nulle part.
     */
    it('aucun champ de destination libre n’existe sur les produits', () => {
      const products = payload.config.collections.find((c) => c.slug === 'products')
      expect(products).toBeDefined()

      const names = new Set<string>()
      const walk = (fields: unknown[]): void => {
        for (const field of fields as Array<Record<string, unknown>>) {
          if (typeof field.name === 'string') names.add(field.name)
          for (const key of ['fields', 'tabs']) {
            const nested = field[key]
            if (Array.isArray(nested)) walk(nested)
          }
        }
      }
      walk(products!.fields as unknown[])

      expect(names.has('ctaHref')).toBe(false)
      expect(names.has('gallery')).toBe(false)
      // Le libellé reste administrable ; seule la destination est figée.
      expect(names.has('ctaLabel')).toBe(true)
    })
  })

  describe('Slugs (RG-013)', () => {
    it('refuse un slug accentué ou espacé', async () => {
      await expect(
        payload.create({
          collection: 'products',
          data: { ...productData('REF-WF-SLUG-BAD', 'Slug Invalide'), slug: 'Slug Invalide' },
          user: publisher,
          overrideAccess: false,
        }),
      ).rejects.toThrow()
    })

    it('crée une redirection 301 quand un slug change', async () => {
      const created = await payload.create({
        collection: 'products',
        data: productData('REF-WF-SLUG-MOVE', 'ancien-slug-produit'),
        user: publisher,
        overrideAccess: false,
      })

      await payload.update({
        collection: 'products',
        id: created.id,
        data: { slug: 'nouveau-slug-produit' },
        user: publisher,
        overrideAccess: false,
      })

      const redirects = await payload.find({
        collection: 'redirects',
        where: { from: { equals: '/fr/produits/ancien-slug-produit' } },
        overrideAccess: true,
      })

      expect(redirects.docs.length).toBe(1)
      expect(redirects.docs[0]?.to).toBe('/fr/produits/nouveau-slug-produit')
      expect(redirects.docs[0]?.statusCode).toBe('301')
    })
  })

  describe('Journal d’audit (RG-006)', () => {
    it('journalise création et publication', async () => {
      const created = await payload.create({
        collection: 'products',
        data: productData('REF-WF-AUDIT', 'audit-produit'),
        user: publisher,
        overrideAccess: false,
        locale: 'fr',
      })

      const logs = await payload.find({
        collection: 'audit-logs',
        where: { entityId: { equals: String(created.id) } },
        overrideAccess: true,
      })

      expect(logs.docs.some((log) => log.action === 'create')).toBe(true)
      expect(logs.docs[0]?.actor).toBeTruthy()
    })

    it('ne recopie jamais un mot de passe dans le journal', async () => {
      await ensureUser(payload, 'editor', 'audit-check')

      const logs = await payload.find({
        collection: 'audit-logs',
        where: { entityType: { equals: 'users' } },
        limit: 20,
        overrideAccess: true,
      })

      const serialized = JSON.stringify(logs.docs)
      expect(serialized).not.toContain('Test-Password')
      expect(serialized).not.toContain('"salt"')
      expect(serialized).not.toContain('"hash"')
    })

    it('est en ajout seul, même pour un administrateur', async () => {
      const logs = await payload.find({ collection: 'audit-logs', limit: 1, overrideAccess: true })
      const entry = logs.docs[0]
      expect(entry).toBeTruthy()

      await expect(
        payload.update({
          collection: 'audit-logs',
          id: entry!.id,
          data: { note: 'falsification' },
          user: admin,
          overrideAccess: false,
        }),
      ).rejects.toThrow()

      await expect(
        payload.delete({
          collection: 'audit-logs',
          id: entry!.id,
          user: admin,
          overrideAccess: false,
        }),
      ).rejects.toThrow()
    })

    it('résiste même à une écriture privilégiée', async () => {
      const logs = await payload.find({ collection: 'audit-logs', limit: 1, overrideAccess: true })
      const entry = logs.docs[0]

      // `overrideAccess: true` contourne les règles d'accès mais PAS les hooks :
      // c'est ce qui rend le journal réellement opposable.
      await expect(
        payload.delete({ collection: 'audit-logs', id: entry!.id, overrideAccess: true }),
      ).rejects.toThrow()
    })
  })

  describe('Versionnage', () => {
    it('conserve une version restaurable à chaque modification', async () => {
      const created = await payload.create({
        collection: 'products',
        data: productData('REF-WF-VERSIONS', 'versions-produit'),
        user: publisher,
        overrideAccess: false,
      })

      await payload.update({
        collection: 'products',
        id: created.id,
        data: { summary: 'Résumé corrigé après relecture.' },
        user: publisher,
        overrideAccess: false,
      })

      const versions = await payload.findVersions({
        collection: 'products',
        where: { parent: { equals: created.id } },
        overrideAccess: true,
      })

      expect(versions.docs.length).toBeGreaterThanOrEqual(2)
    })
  })
})
