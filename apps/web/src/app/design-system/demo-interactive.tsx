'use client'

import { useState } from 'react'

import {
  Button,
  Checkbox,
  FilterBar,
  Icon,
  SelectField,
  TextAreaField,
  TextField,
  useToast,
} from '@africa-ingenierie/ui'

export function InteractiveForm() {
  const [message, setMessage] = useState('')

  return (
    <form className="stack g24" onSubmit={(event) => event.preventDefault()}>
      <div className="grid c2">
        <TextField label="Nom et prénom" required placeholder="Votre nom" defaultValue="" />
        <TextField
          label="Adresse e-mail"
          required
          type="email"
          defaultValue="nom@"
          error="Cette adresse email n'est pas valide. Exemple : nom@entreprise.com"
        />
      </div>

      <SelectField label="Votre besoin" required hint="Oriente la demande vers le bon ingénieur.">
        <option value="">Sélectionnez…</option>
        <option>Maintenance industrielle</option>
        <option>Installation et mise en service</option>
        <option>Fourniture d&apos;équipements</option>
      </SelectField>

      <TextAreaField
        label="Décrivez votre besoin"
        required
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Installation concernée, contraintes, délais…"
        counter={{ current: message.length, max: 3000 }}
      />

      <Checkbox name="rgpd">
        J&apos;accepte que mes données soient utilisées pour traiter ma demande, conformément à la
        politique de confidentialité.
      </Checkbox>

      <div className="row actions">
        <Button variant="primary" iconRight={<Icon name="arrow" size={17} />} type="submit">
          Envoyer la demande
        </Button>
        <Button variant="outline">Annuler</Button>
      </div>
    </form>
  )
}

export function InteractiveFilters() {
  const [value, setValue] = useState('all')

  return (
    <FilterBar
      label="Filtrer par catégorie"
      value={value}
      onChange={setValue}
      options={[
        { value: 'all', label: 'Toutes les catégories' },
        { value: 'pieces', label: 'Pièces de rechange' },
        { value: 'procede', label: 'Équipements de procédé' },
        { value: 'metal', label: 'Construction métallique' },
        { value: 'energie', label: 'Énergie' },
      ]}
    />
  )
}

export function ToastDemo() {
  const { toast } = useToast()

  return (
    <div className="row">
      <Button variant="brand" size="sm" onClick={() => toast('Réglages enregistrés')}>
        Afficher un toast
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => toast('Confirmation requise avant suppression', { icon: 'alert' })}
      >
        Toast d&apos;avertissement
      </Button>
    </div>
  )
}
