'use client'

import { useState, type FormEvent } from 'react'

import { Button, Checkbox, Notice, TextAreaField, TextField } from '@africa-ingenierie/ui'

import type { UiStrings } from '../lib/ui-strings'

/** Formulaire public dédié aux témoignages, sans aucun champ du contact commercial. */
export function TestimonialForm({ strings, locale }: { strings: UiStrings; locale: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setState('sending')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: 'testimonial',
          locale,
          fullName: String(data.get('fullName') ?? ''),
          role: String(data.get('role') ?? ''),
          company: String(data.get('company') ?? ''),
          quote: String(data.get('quote') ?? ''),
          consent: data.get('consent') === 'on',
          website: String(data.get('website') ?? ''),
        }),
      })

      if (!response.ok) throw new Error(String(response.status))
      form.reset()
      setState('sent')
    } catch {
      setState('error')
    }
  }

  if (state === 'sent') return <Notice tone="ok" title={strings.testimonialSuccess} />

  return (
    <form className="stack g16 testimonial-form" onSubmit={onSubmit}>
      {state === 'error' ? <Notice tone="err" title={strings.testimonialError} /> : null}

      <TextField label={strings.testimonialName} name="fullName" required autoComplete="name" />
      <div className="grid c2 g16">
        <TextField label={strings.testimonialRole} name="role" autoComplete="organization-title" />
        <TextField label={strings.testimonialCompany} name="company" autoComplete="organization" />
      </div>
      <TextAreaField label={strings.testimonialQuote} name="quote" rows={7} required />

      <input
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}
      />

      <Checkbox name="consent" required>
        {strings.testimonialConsent}
      </Checkbox>

      <Button type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? strings.testimonialSending : strings.testimonialSubmit}
      </Button>
    </form>
  )
}
