'use client'

import { useMemo, useState } from 'react'

const STATES = [
  ['all', 'Tous les états'],
  ['new', 'Nouveaux'],
  ['in_progress', 'En cours'],
  ['replied', 'Répondus'],
  ['closed', 'Fermés'],
  ['redacted', 'Anonymisés'],
] as const

/** Barre d'export protégée par l'endpoint Payload et pratique sur mobile. */
export function ContactMessagesExport() {
  const [state, setState] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const href = useMemo(() => {
    const params = new URLSearchParams()
    if (state !== 'all') params.set('state', state)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    const query = params.toString()
    return `/api/contact-messages/export${query ? `?${query}` : ''}`
  }, [from, state, to])

  return (
    <section className="ai-inbox-tools" aria-labelledby="ai-inbox-tools-title">
      <div>
        <p className="ai-inbox-tools__eyebrow">Messages reçus</p>
        <h2 id="ai-inbox-tools-title">Suivi et export</h2>
        <p>Filtrez les demandes puis téléchargez un CSV compatible Excel.</p>
      </div>
      <div className="ai-inbox-tools__filters">
        <label>
          État
          <select value={state} onChange={(event) => setState(event.target.value)}>
            {STATES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Du
          <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        </label>
        <label>
          Au
          <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </label>
        <a className="ai-inbox-tools__export" href={href} download>
          Exporter en CSV
        </a>
      </div>
    </section>
  )
}
