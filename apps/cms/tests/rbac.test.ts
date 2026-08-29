import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'

import {
  ensureUser,
  getTestPayload,
  productData,
  productDataEn,
  resetTestContent,
  type TestUser,
} from './helpers'

/**
 * Preuves des règles de rôle  -  exigées par le prompt 04.
 *
 * Ces tests passent par l'API locale de Payload avec `overrideAccess: false`,
 * c'est-à-dire exactement le chemin qu'emprunte une requête REST ou GraphQL.
 * Ils prouvent donc le comportement du SERVEUR, pas celui de l'interface.
 */
describe('Contrôle d’accès par rôle', () => {
  let payload: Payload
  let admin: TestUser
  let publisher: TestUser
  let editor: TestUser

  beforeAll(async () => {
    payload = await getTestPayload()
    await resetTestContent(payload)
    admin = await ensureUser(payload, 'administrator')
    publisher = await ensureUser(payload, 'publisher')
    editor = await ensureUser(payload, 'editor')
  })

  afterAll(async () => {
    // Les fiches REF-* sont des fixtures de sécurité. Elles ne doivent jamais
    // rester publiées dans le catalogue local après la suite de tests.
    await resetTestContent(payload)
  })

  describe('Éditeur', () => {
    it('peut créer un brouillon', async () => {
      const doc = await payload.create({
        collection: 'products',
        data: productData('REF-EDITOR-DRAFT', 'editeur-brouillon'),
        user: editor,
        overrideAccess: false,
      })

      expect(doc.editorialStatus).toBe('draft')
      expect(doc.slug).toBe('editeur-brouillon')
    })

    it('peut soumettre à validation', async () => {
      const created = await payload.create({
        collection: 'products',
        data: productData('REF-EDITOR-REVIEW', 'editeur-a-valider'),
        user: editor,
        overrideAccess: false,
      })

      const updated = await payload.update({
        collection: 'products',
        id: created.id,
        data: { editorialStatus: 'review' },
        user: editor,
        overrideAccess: false,
      })

      expect(updated.editorialStatus).toBe('review')
    })

    it('NE PEUT PAS publier un contenu', async () => {
      const created = await payload.create({
        collection: 'products',
        data: productData('REF-EDITOR-PUBLISH', 'editeur-publication-refusee'),
        user: editor,
        overrideAccess: false,
      })

      await expect(
        payload.update({
          collection: 'products',
          id: created.id,
          data: { editorialStatus: 'published' },
          user: editor,
          overrideAccess: false,
        }),
      ).rejects.toThrow()

      // Le refus doit être effectif en base, pas seulement dans la réponse.
      const reread = await payload.findByID({
        collection: 'products',
        id: created.id,
        overrideAccess: true,
      })
      expect(reread.editorialStatus).toBe('draft')
    })

    it('NE PEUT PAS publier directement à la création', async () => {
      await expect(
        payload.create({
          collection: 'products',
          data: { ...productData('REF-EDITOR-CREATE-PUB', 'editeur-creation-publiee'), editorialStatus: 'published' },
          user: editor,
          overrideAccess: false,
        }),
      ).rejects.toThrow()
    })

    it('NE PEUT PAS archiver un contenu', async () => {
      const created = await payload.create({
        collection: 'products',
        data: productData('REF-EDITOR-ARCHIVE', 'editeur-archivage-refuse'),
        user: editor,
        overrideAccess: false,
      })

      await expect(
        payload.update({
          collection: 'products',
          id: created.id,
          data: { editorialStatus: 'archived', archiveReason: 'Produit retiré du catalogue fournisseur' },
          user: editor,
          overrideAccess: false,
        }),
      ).rejects.toThrow()
    })

    it('NE PEUT PAS supprimer un contenu', async () => {
      const created = await payload.create({
        collection: 'products',
        data: productData('REF-EDITOR-DELETE', 'editeur-suppression-refusee'),
        user: editor,
        overrideAccess: false,
      })

      await expect(
        payload.delete({
          collection: 'products',
          id: created.id,
          user: editor,
          overrideAccess: false,
        }),
      ).rejects.toThrow()
    })

    it('NE PEUT PAS modifier les réglages globaux', async () => {
      await expect(
        payload.updateGlobal({
          slug: 'site-settings',
          data: { siteName: 'Tentative Éditeur' },
          user: editor,
          overrideAccess: false,
        }),
      ).rejects.toThrow()
    })

    it('NE PEUT PAS créer un compte utilisateur', async () => {
      await expect(
        payload.create({
          collection: 'users',
          data: {
            email: 'promotion@test.local',
            password: 'Test-Password-123456!',
            firstName: 'X',
            lastName: 'Y',
            role: 'administrator',
          },
          user: editor,
          overrideAccess: false,
        }),
      ).rejects.toThrow()
    })
  })

  describe('Publicateur', () => {
    it('peut publier un contenu métier', async () => {
      const created = await payload.create({
        collection: 'products',
        data: productData('REF-PUB-PUBLISH', 'publicateur-publication'),
        user: publisher,
        overrideAccess: false,
        locale: 'fr',
      })

      // La publication exige les deux langues (RG-011), vérifiée par ailleurs
      // dans workflow.test.ts : on complète l'anglais avant de publier.
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
      })

      expect(published.editorialStatus).toBe('published')
      expect(published.publishedAt).toBeTruthy()
    })

    it('NE PEUT PAS modifier les réglages globaux', async () => {
      const before = await payload.findGlobal({ slug: 'site-settings', overrideAccess: true })

      let refused = false
      let status: number | undefined
      try {
        await payload.updateGlobal({
          slug: 'site-settings',
          data: { siteName: 'Tentative Publicateur' },
          user: publisher,
          overrideAccess: false,
        })
      } catch (error) {
        refused = true
        status = (error as { status?: number }).status
      }

      // On vérifie le REFUS et son EFFET, pas le libellé.
      //
      // Ce test comparait auparavant le message à « not allowed ». Depuis que
      // l'interface d'administration est en français par défaut, Payload
      // renvoie « vous n'êtes pas autorisé… » et le test cassait  -  alors que
      // le contrôle d'accès, lui, fonctionnait parfaitement. Une assertion sur
      // un texte traduisible teste la langue, pas la règle.
      expect(refused).toBe(true)
      expect(status).toBe(403)

      const after = await payload.findGlobal({ slug: 'site-settings', overrideAccess: true })
      expect((after as { siteName?: string }).siteName).toBe(
        (before as { siteName?: string }).siteName,
      )
    })

    it('NE PEUT PAS modifier la navigation', async () => {
      await expect(
        payload.updateGlobal({
          slug: 'navigation',
          data: { contactLabel: 'Tentative' },
          user: publisher,
          overrideAccess: false,
        }),
      ).rejects.toThrow()
    })

    it('NE PEUT PAS gérer les comptes', async () => {
      await expect(
        payload.update({
          collection: 'users',
          id: editor.id,
          data: { role: 'administrator' },
          user: publisher,
          overrideAccess: false,
        }),
      ).rejects.toThrow()
    })

    it('NE PEUT PAS supprimer un contenu (archivage requis)', async () => {
      const created = await payload.create({
        collection: 'products',
        data: productData('REF-PUB-DELETE', 'publicateur-suppression-refusee'),
        user: publisher,
        overrideAccess: false,
      })

      await expect(
        payload.delete({
          collection: 'products',
          id: created.id,
          user: publisher,
          overrideAccess: false,
        }),
      ).rejects.toThrow()
    })
  })

  describe('Administrateur', () => {
    it('peut modifier les réglages globaux', async () => {
      const updated = await payload.updateGlobal({
        slug: 'site-settings',
        data: {
          siteName: 'Africa Ingénierie',
          baseline: 'Ingénierie industrielle au service du développement africain.',
          cookieTitle: 'Votre choix sur les cookies',
          cookieText: 'Nous utilisons les cookies strictement nécessaires au fonctionnement du site.',
          defaultSeoTitle: 'Africa Ingénierie  -  ingénierie industrielle',
          defaultSeoDescription:
            'Maintenance, installation, formation et équipements industriels en Afrique de l’Ouest.',
        },
        user: admin,
        overrideAccess: false,
      })

      expect(updated.siteName).toBe('Africa Ingénierie')
    })

    it('peut gérer les rôles', async () => {
      const updated = await payload.update({
        collection: 'users',
        id: editor.id,
        data: { role: 'editor' },
        user: admin,
        overrideAccess: false,
      })

      expect(updated.role).toBe('editor')
    })

    it('peut supprimer un contenu', async () => {
      const created = await payload.create({
        collection: 'products',
        data: productData('REF-ADMIN-DELETE', 'admin-suppression'),
        user: admin,
        overrideAccess: false,
      })

      const deleted = await payload.delete({
        collection: 'products',
        id: created.id,
        user: admin,
        overrideAccess: false,
      })

      expect(deleted.id).toBe(created.id)
    })
  })

  describe('Compte non initialisé ou suspendu', () => {
    it('un compte devant changer son mot de passe ne peut rien écrire', async () => {
      const pending = await ensureUser(payload, 'publisher', 'pending', {
        mustChangePassword: true,
      })

      await expect(
        payload.create({
          collection: 'products',
          data: productData('REF-PENDING', 'compte-non-initialise'),
          user: { ...pending, mustChangePassword: true },
          overrideAccess: false,
        }),
      ).rejects.toThrow()
    })

    it('un compte suspendu perd tous ses droits', async () => {
      const suspended = await ensureUser(payload, 'publisher', 'suspended', { isActive: false })

      await expect(
        payload.create({
          collection: 'products',
          data: productData('REF-SUSPENDED', 'compte-suspendu'),
          user: { ...suspended, isActive: false },
          overrideAccess: false,
        }),
      ).rejects.toThrow()
    })
  })

  describe('Visiteur anonyme', () => {
    it('ne voit que les contenus publiés', async () => {
      const draft = await payload.create({
        collection: 'products',
        data: productData('REF-ANON-DRAFT', 'anonyme-brouillon'),
        user: publisher,
        overrideAccess: false,
      })

      const results = await payload.find({
        collection: 'products',
        overrideAccess: false,
        limit: 100,
      })

      const ids = results.docs.map((doc) => doc.id)
      expect(ids).not.toContain(draft.id)
      expect(results.docs.every((doc) => doc.editorialStatus === 'published')).toBe(true)
    })

    it('ne peut pas créer de contenu', async () => {
      await expect(
        payload.create({
          collection: 'products',
          data: productData('REF-ANON-CREATE', 'anonyme-creation'),
          overrideAccess: false,
        }),
      ).rejects.toThrow()
    })

    it('ne peut pas lire les messages de contact', async () => {
      await expect(
        payload.find({ collection: 'contact-messages', overrideAccess: false }),
      ).rejects.toThrow()
    })

    it('ne peut pas créer directement un message de contact', async () => {
      await expect(
        payload.create({
          collection: 'contact-messages',
          overrideAccess: false,
          data: {
            fullName: 'Visiteur anonyme',
            email: 'visitor@example.com',
            need: 'Demande',
            message: 'Message de test',
            consentAt: new Date().toISOString(),
          },
        }),
      ).rejects.toThrow()
    })

    it('ne peut pas lire le journal d’audit', async () => {
      await expect(
        payload.find({ collection: 'audit-logs', overrideAccess: false }),
      ).rejects.toThrow()
    })
  })
})
