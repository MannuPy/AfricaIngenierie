'use client'

import { useState } from 'react'

import { Button, Checkbox, Notice, TextAreaField, TextField } from '@africa-ingenierie/ui'

import type { UiStrings } from '../lib/ui-strings'

/**
 * Formulaire de contact.
 *
 * L'envoi passe par une route serveur du site, jamais directement par l'API du
 * CMS : c'est elle qui portera la limitation de débit, l'anti-robot et le
 * calcul de l'échéance de conservation au prompt 08. Poster depuis le
 * navigateur vers le CMS exposerait la collection à l'Internet ouvert.
 *
 * Le consentement est explicite et horodaté côté serveur : sans lui, conserver
 * un message nominatif n'aurait aucune base.
 */
export function ContactForm({ strings, locale }: { strings: UiStrings; locale: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    setState('sending')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          locale,
          fullName: String(data.get('fullName') ?? ''),
          email: String(data.get('email') ?? ''),
          company: String(data.get('company') ?? ''),
          need: String(data.get('need') ?? ''),
          message: String(data.get('message') ?? ''),
          consent: data.get('consent') === 'on',
        }),
      })

      if (!response.ok) throw new Error(String(response.status))
      form.reset()
      setState('sent')
    } catch {
      setState('error')
    }
  }

  if (state === 'sent') {
    return <Notice tone="ok" title={strings.formSuccess} />
  }

  return (
    <form className="stack g16" onSubmit={onSubmit} noValidate={false}>
      {state === 'error' ? <Notice tone="err" title={strings.formError} /> : null}

      <TextField label={strings.formName} name="fullName" required autoComplete="name" />
      <TextField
        label={strings.formEmail}
        name="email"
        type="email"
        required
        autoComplete="email"
      />
      <TextField label={strings.formCompany} name="company" autoComplete="organization" />
      <TextField label={strings.formNeed} name="need" required />
      <TextAreaField label={strings.formMessage} name="message" rows={6} required />

      <Checkbox name="consent" required>
        {strings.formConsent}
      </Checkbox>

      <Button type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? strings.formSending : strings.formSubmit}
      </Button>
    </form>
  )
}
