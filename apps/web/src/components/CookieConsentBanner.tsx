'use client'

import { useEffect, useState } from 'react'

type ConsentState = 'accepted' | 'rejected' | null

const STORAGE_KEY = 'ai-cookie-consent-v1'

export function CookieConsentBanner({
  locale,
  title,
  text,
}: {
  locale: 'fr' | 'en'
  title: string
  text: string
}) {
  const [consent, setConsent] = useState<ConsentState>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const task = window.setTimeout(() => {
      const value = window.localStorage.getItem(STORAGE_KEY)
      setConsent(value === 'accepted' || value === 'rejected' ? value : null)
      setReady(true)
    }, 0)
    return () => window.clearTimeout(task)
  }, [])

  function save(value: Exclude<ConsentState, null>) {
    window.localStorage.setItem(STORAGE_KEY, value)
    setConsent(value)
  }

  const labels =
    locale === 'en'
      ? { accept: 'Accept', reject: 'Reject', manage: 'Cookie preferences' }
      : { accept: 'Accepter', reject: 'Refuser', manage: 'Préférences cookies' }

  if (!ready) return null

  if (consent) {
    return (
      <button className="cookie-preferences" type="button" onClick={() => setConsent(null)}>
        {labels.manage}
      </button>
    )
  }

  return (
    <section className="cookiebar" aria-label={title} role="dialog" aria-live="polite">
      <div className="stack g8">
        <h2 className="h4">{title}</h2>
        <p className="small">{text}</p>
      </div>
      <div className="cookiebar__actions">
        <button className="btn btn-brand btn-sm" type="button" onClick={() => save('accepted')}>
          {labels.accept}
        </button>
        <button className="btn btn-outline btn-sm" type="button" onClick={() => save('rejected')}>
          {labels.reject}
        </button>
      </div>
    </section>
  )
}
