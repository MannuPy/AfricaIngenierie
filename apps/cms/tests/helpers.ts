import { getPayload, type Payload } from 'payload'

import config from '../src/payload.config'
import type { Role } from '../src/access/roles'

let cached: Payload | null = null

export async function getTestPayload(): Promise<Payload> {
  if (!cached) cached = await getPayload({ config })
  return cached
}

export type TestUser = { id: string | number; email: string; role: Role; collection: 'users' }

/**
 * Crée (ou réutilise) un compte de test pour un rôle donné.
 *
 * `mustChangePassword` est mis à false : ces comptes servent à éprouver les
 * règles de rôle, pas le parcours d'activation, qui a son propre test.
 */
export async function ensureUser(
  payload: Payload,
  role: Role,
  suffix = 'a',
  overrides: Record<string, unknown> = {},
): Promise<TestUser> {
  const email = `${role}-${suffix}@test.local`

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })

  const data = {
    email,
    password: 'Test-Password-123456!',
    firstName: 'Test',
    lastName: role,
    role,
    isActive: true,
    mustChangePassword: false,
    ...overrides,
  }

  // Sur une base réutilisée, ne changeons pas le mot de passe quand un test
  // demande de remettre un compte en état `mustChangePassword=true` : la
  // politique de production effacerait immédiatement ce drapeau au passage.
  // Le compte reste ainsi initialisable de façon idempotente sans contourner
  // la règle testée pour les utilisateurs authentifiés.
  if (existing.docs.length > 0 && overrides.mustChangePassword === true) {
    delete (data as { password?: string }).password
  }

  const doc =
    existing.docs.length > 0
      ? await payload.update({
          collection: 'users',
          id: (existing.docs[0] as { id: string | number }).id,
          data,
          overrideAccess: true,
        })
      : await payload.create({ collection: 'users', data, overrideAccess: true })

  const id = (doc as { id: string | number }).id

  // Puis les drapeaux sont RÉAFFIRMÉS par une écriture sans mot de passe.
  //
  // Le filet précédent ne couvre que la création d'un compte déjà existant ;
  // celui-ci rend la précondition vraie quel que soit l'état de départ, y
  // compris après qu'un autre test a modifié le compte. Sans quoi la suite
  // passe sur une base vierge et échoue à la deuxième exécution  -  le pire des
  // symptômes, puisqu'il fait douter du code plutôt que du test.
  await payload.update({
    collection: 'users',
    id,
    data: {
      role: data.role,
      isActive: data.isActive,
      mustChangePassword: data.mustChangePassword,
    },
    overrideAccess: true,
  })

  return { id, email, role, collection: 'users' }
}

/** Jeu de données complet permettant la publication d'un produit. */
export function productData(reference: string, slug: string) {
  return {
    reference,
    slug,
    title: 'Pièces de rechange  -  lignes d’égrenage',
    category: 'Pièces de rechange',
    summary: 'Scies, brosses, grilles et pièces d’usure pour lignes d’égrenage du coton.',
    description:
      'Nous approvisionnons les pièces d’usure des lignes d’égrenage auprès de fabricants qualifiés.',
    availability: 'Sur commande  -  délai 4 à 6 semaines',
    seo: {
      title: 'Pièces de rechange pour lignes d’égrenage',
      description: 'Pièces d’usure vérifiées avant expédition pour vos lignes d’égrenage.',
    },
    editorialStatus: 'draft' as const,
  }
}

/** Traduction anglaise complète du même produit. */
export function productDataEn() {
  return {
    title: 'Spare parts  -  ginning lines',
    category: 'Spare parts',
    summary: 'Saws, brushes, grids and wear parts for cotton ginning lines.',
    description: 'We source wear parts from qualified manufacturers, with dimensional checks.',
    availability: 'To order  -  4 to 6 weeks',
    seo: {
      title: 'Spare parts for ginning lines',
      description: 'Wear parts checked before shipping for your ginning lines.',
    },
  }
}

/** Extrait le message d'une erreur Payload, quelle que soit sa forme. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

/**
 * Remet la base dans un état connu avant chaque exécution.
 *
 * Les tests créent des contenus aux références préfixées `REF-` ; sans purge,
 * une seconde exécution échouerait sur l'unicité du slug plutôt que sur la
 * règle réellement testée  -  un faux négatif qui masquerait les vrais échecs.
 */
export async function resetTestContent(payload: Payload): Promise<void> {
  await payload.delete({
    collection: 'products',
    where: { reference: { like: 'REF-' } },
    overrideAccess: true,
  })

  // Les tests de flux de publication fabriquent des titres horodatés
  // (« … depuis le dashboard <marqueur> »). Un test qui échoue au milieu
  // laisse le sien derrière lui ; sans cette purge, l'exécution suivante
  // échouerait sur l'unicité du slug plutôt que sur la règle testée.
  await payload.delete({
    collection: 'products',
    where: { title: { like: 'depuis le dashboard' } },
    overrideAccess: true,
  })
}
