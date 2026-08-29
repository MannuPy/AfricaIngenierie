import { beforeAll, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'

import { ensureUser, getTestPayload } from './helpers'

/**
 * Sécurité du compte  -  non-régression.
 *
 * Chaque cas ci-dessous correspond à un défaut RÉEL constaté à l'audit du
 * prompt 04, invisible en relecture de code et invisible dans la suite
 * existante. Ils sont conservés pour que la correction ne se perde pas.
 */
describe('Sécurité des comptes', () => {
  let payload: Payload

  beforeAll(async () => {
    payload = await getTestPayload()
  })

  /** Échoue vite et lisiblement si l'opération se bloque au lieu de répondre. */
  function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Blocage : ${label} n'a pas répondu en ${ms} ms`)), ms),
      ),
    ])
  }

  describe('Mise à jour d’un compte', () => {
    it('ne se bloque pas quand l’action est journalisée', async () => {
      // Le hook d'audit ouvrait une seconde transaction ; son insertion
      // référence `users.id` par clé étrangère, ligne déjà verrouillée par la
      // transaction englobante. Les deux s'attendaient indéfiniment : toute
      // modification d'un compte depuis le dashboard restait bloquée.
      const admin = await ensureUser(payload, 'administrator')
      const target = await ensureUser(payload, 'editor', 'deadlock')

      const updated = await withTimeout(
        payload.update({
          collection: 'users',
          id: target.id,
          data: { firstName: 'Modifié' },
          user: admin,
          overrideAccess: false,
        }),
        15_000,
        'mise à jour d’un compte',
      )

      expect(updated.firstName).toBe('Modifié')
    })

    it('ne se bloque pas quand l’utilisateur se modifie lui-même', async () => {
      const self = await ensureUser(payload, 'publisher', 'self')

      const updated = await withTimeout(
        payload.update({
          collection: 'users',
          id: self.id,
          data: { firstName: 'MoiMême' },
          user: self,
          overrideAccess: false,
        }),
        15_000,
        'auto-modification',
      )

      expect(updated.firstName).toBe('MoiMême')
    })
  })

  describe('Mot de passe initial', () => {
    it('changer son mot de passe lève l’obligation', async () => {
      const pending = await ensureUser(payload, 'publisher', 'pending-flag', {
        mustChangePassword: true,
      })

      await payload.update({
        collection: 'users',
        id: pending.id,
        data: { password: 'Un-Nouveau-Mot-De-Passe-123456!' },
        user: { ...pending, mustChangePassword: true },
        overrideAccess: false,
      })

      const reread = await payload.findByID({
        collection: 'users',
        id: pending.id,
        overrideAccess: true,
      })

      // Sans cette levée, le compte restait bloqué à vie : `mustChangePassword`
      // refuse toute écriture et le champ était réservé aux administrateurs.
      expect(reread.mustChangePassword).toBe(false)
    })

    it('un non-administrateur ne peut pas lever l’obligation sans changer son mot de passe', async () => {
      const pending = await ensureUser(payload, 'editor', 'flag-cheat', {
        mustChangePassword: true,
      })

      await expect(
        payload.update({
          collection: 'users',
          id: pending.id,
          data: { mustChangePassword: false },
          user: { ...pending, mustChangePassword: true },
          overrideAccess: false,
        }),
      ).rejects.toThrow()

      const reread = await payload.findByID({
        collection: 'users',
        id: pending.id,
        overrideAccess: true,
      })
      expect(reread.mustChangePassword).toBe(true)
    })

    it('un administrateur peut réimposer l’obligation', async () => {
      const admin = await ensureUser(payload, 'administrator')
      const target = await ensureUser(payload, 'editor', 'reset-flag', {
        mustChangePassword: false,
      })

      const updated = await payload.update({
        collection: 'users',
        id: target.id,
        data: { mustChangePassword: true },
        user: admin,
        overrideAccess: false,
      })

      expect(updated.mustChangePassword).toBe(true)
    })
  })

  describe('Connexion', () => {
    it('refuse un compte suspendu', async () => {
      const email = 'suspended-login@test.local'
      const existing = await payload.find({
        collection: 'users',
        where: { email: { equals: email } },
        limit: 1,
        overrideAccess: true,
      })
      if (existing.docs.length > 0) {
        await payload.delete({
          collection: 'users',
          id: existing.docs[0]!.id,
          overrideAccess: true,
        })
      }

      await payload.create({
        collection: 'users',
        overrideAccess: true,
        data: {
          email,
          password: 'Mot-De-Passe-Valide-123456!',
          firstName: 'Compte',
          lastName: 'Suspendu',
          role: 'publisher',
          isActive: false,
          mustChangePassword: false,
        },
      })

      // Le compte perdait déjà tous ses droits, mais l'authentification
      // réussissait et émettait un jeton de session.
      await expect(
        payload.login({
          collection: 'users',
          data: { email, password: 'Mot-De-Passe-Valide-123456!' },
        }),
      ).rejects.toThrow()
    })

    it('horodate la dernière connexion et la journalise', async () => {
      const email = 'login-trace@test.local'
      const existing = await payload.find({
        collection: 'users',
        where: { email: { equals: email } },
        limit: 1,
        overrideAccess: true,
      })
      if (existing.docs.length > 0) {
        await payload.delete({
          collection: 'users',
          id: existing.docs[0]!.id,
          overrideAccess: true,
        })
      }

      const account = await payload.create({
        collection: 'users',
        overrideAccess: true,
        data: {
          email,
          password: 'Mot-De-Passe-Valide-123456!',
          firstName: 'Trace',
          lastName: 'Connexion',
          role: 'editor',
          isActive: true,
          mustChangePassword: false,
        },
      })

      await payload.login({
        collection: 'users',
        data: { email, password: 'Mot-De-Passe-Valide-123456!' },
      })

      const reread = await payload.findByID({
        collection: 'users',
        id: account.id,
        overrideAccess: true,
      })
      expect(reread.lastLoginAt).toBeTruthy()

      const logs = await payload.find({
        collection: 'audit-logs',
        where: {
          and: [{ action: { equals: 'login' } }, { entityId: { equals: String(account.id) } }],
        },
        overrideAccess: true,
      })
      expect(logs.totalDocs).toBeGreaterThan(0)
    })

    it('n’écrit qu’UNE entrée de journal par connexion', async () => {
      const account = await ensureUser(payload, 'editor', 'single-log')

      const before = await payload.find({
        collection: 'audit-logs',
        where: { entityId: { equals: String(account.id) } },
        limit: 0,
        overrideAccess: true,
      })

      await payload.login({
        collection: 'users',
        data: { email: account.email, password: 'Test-Password-123456!' },
      })

      const after = await payload.find({
        collection: 'audit-logs',
        where: { entityId: { equals: String(account.id) } },
        limit: 0,
        overrideAccess: true,
      })

      // L'horodatage de `lastLoginAt` passe par une mise à jour marquée
      // `skipAudit` : sans cela, chaque connexion produirait aussi une entrée
      // « update » et noierait le journal.
      expect(after.totalDocs - before.totalDocs).toBe(1)
    })
  })

  describe('Traçabilité de la déconnexion', () => {
    it('le hook de déconnexion est branché', async () => {
      const hooks = payload.collections.users.config.hooks as Record<string, unknown[]>
      expect(hooks.afterLogout?.length ?? 0).toBeGreaterThan(0)
      expect(hooks.beforeLogin?.length ?? 0).toBeGreaterThan(0)
    })
  })

  describe('Prévisualisation avant publication', () => {
    it('construit une URL de prévisualisation vers le site public', async () => {
      const preview = (
        payload.collections.products.config.admin as {
          preview?: (doc: unknown, args: { locale?: string }) => string | null
        }
      ).preview

      expect(preview).toBeTypeOf('function')

      const url = preview!({ slug: 'un-produit' }, { locale: 'fr' })
      expect(decodeURIComponent(String(url))).toContain('/fr/produits/un-produit')
    })

    it('conserve des versions restaurables avant publication', async () => {
      const versionedCollections = ['products', 'expertises', 'events'] as const

      for (const slug of versionedCollections) {
        const versions = payload.collections[slug]!.config.versions as {
          drafts?: unknown
        }
        expect(versions.drafts, `${slug} sans brouillons`).toBeTruthy()
      }
    })
  })
})
