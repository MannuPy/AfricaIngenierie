'use client'

import { useState } from 'react'

import { Button, Checkbox, Notice, SelectField, TextAreaField, TextField } from '@africa-ingenierie/ui'

import type { UiStrings } from '../lib/ui-strings'

const SERVICE_DOMAINS = [
  { value: 'energy', fr: 'Énergie', en: 'Energy' },
  { value: 'home-automation-security', fr: 'Domotique & Sécurité', en: 'Home automation & Security' },
  { value: 'industrial-equipment', fr: "Fourniture d'équipements industriels", en: 'Industrial equipment supply' },
  { value: 'welding-metalwork', fr: 'Soudure & Chaudronnerie', en: 'Welding & Metalwork' },
  { value: 'industrial-maintenance', fr: 'Maintenance industrielle', en: 'Industrial maintenance' },
  { value: 'installation-commissioning', fr: 'Installation & Mise en service', en: 'Installation & Commissioning' },
  { value: 'technical-training', fr: 'Formations Techniques & Optimisation Industrielle', en: 'Technical Training & Industrial Optimisation' },
] as const

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
      const selectedNeeds = data
        .getAll('need')
        .map(String)
        .map((value) => SERVICE_DOMAINS.find((domain) => domain.value === value)?.[locale === 'en' ? 'en' : 'fr'])
        .filter(Boolean)

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          locale,
          fullName: String(data.get('fullName') ?? ''),
          email: String(data.get('email') ?? ''),
          phone: String(data.get('phone') ?? ''),
          company: String(data.get('company') ?? ''),
          need: selectedNeeds.join(', '),
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
      <TextField
        label={strings.formPhone}
        name="phone"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
      />
      <TextField label={strings.formCompany} name="company" autoComplete="organization" />
      <SelectField
        label={strings.formNeed}
        name="need"
        required
        multiple
        size={4}
        hint={strings.formNeedHint}
        aria-label={strings.formNeed}
      >
        {SERVICE_DOMAINS.map((domain) => (
          <option key={domain.value} value={domain.value}>
            {locale === 'en' ? domain.en : domain.fr}
          </option>
        ))}
      </SelectField>
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
