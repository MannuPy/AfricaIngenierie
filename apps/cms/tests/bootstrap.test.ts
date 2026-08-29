import { describe, expect, it } from 'vitest'

import { environmentRefusalReason } from '../src/scripts/bootstrap-users'

/**
 * Le bootstrap des six comptes locaux doit refuser toute exécution en dehors
 * d'un environnement local. Un script capable de créer des comptes avec
 * `mustChangePassword` sur une base de production serait une porte d'entrée.
 */
describe('Bootstrap des comptes locaux', () => {
  it('refuse en production', () => {
    const reason = environmentRefusalReason({
      NODE_ENV: 'production',
      BOOTSTRAP_USERS_ENABLED: 'true',
      BOOTSTRAP_USERS_ENV: 'local',
      DATABASE_URL: 'postgres://user:pass@postgres:5432/africa',
    })

    expect(reason).toContain('production')
  })

  it('refuse si le drapeau d’activation est absent', () => {
    const reason = environmentRefusalReason({
      NODE_ENV: 'development',
      BOOTSTRAP_USERS_ENABLED: '',
      BOOTSTRAP_USERS_ENV: 'local',
      DATABASE_URL: 'postgres://user:pass@postgres:5432/africa',
    })

    expect(reason).toContain('BOOTSTRAP_USERS_ENABLED')
  })

  it('refuse une base de données distante', () => {
    const reason = environmentRefusalReason({
      NODE_ENV: 'development',
      BOOTSTRAP_USERS_ENABLED: 'true',
      BOOTSTRAP_USERS_ENV: 'local',
      DATABASE_URL: 'postgres://user:pass@db.production.example.com:5432/africa',
    })

    expect(reason).toContain('locale')
  })
})
