'use client'

import { useId, type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react'

import { cx } from '../cx'
import { Icon } from './Icon'

type BaseProps = {
  label: string
  /** Marque le champ obligatoire, visuellement et pour l'assistance technique. */
  required?: boolean
  /** Aide affichée sous le libellé. */
  hint?: string
  /** Message d'erreur. Sa présence passe le champ à l'état invalide. */
  error?: string
  /** Compteur de caractères, par exemple « 120 / 3000 ». */
  counter?: { current: number; max: number }
  className?: string
}

export type FormFieldProps = BaseProps & {
  /** Rendu personnalisé : reçoit les attributs à poser sur le contrôle. */
  children: (props: {
    id: string
    'aria-describedby': string | undefined
    'aria-invalid': boolean | undefined
    required: boolean | undefined
    className: string
  }) => ReactNode
}

/**
 * Enveloppe de champ : libellé, aide, erreur et compteur.
 *
 * L'erreur est liée au contrôle par `aria-describedby` et `aria-invalid`,
 * afin qu'un lecteur d'écran l'annonce au lieu de la laisser purement visuelle.
 */
export function FormField({
  label,
  required,
  hint,
  error,
  counter,
  className,
  children,
}: FormFieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cx('field', error && 'invalid', className)}>
      <label htmlFor={id}>
        {label}
        {required ? (
          <span className="req" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      {hint ? (
        <p className="hint" id={hintId}>
          {hint}
        </p>
      ) : null}

      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        required: required || undefined,
        className: '',
      })}

      {counter ? (
        <span className={cx('counter', counter.current > counter.max && 'over')}>
          {counter.current} / {counter.max}
        </span>
      ) : null}

      {error ? (
        <p className="err-msg" id={errorId}>
          <Icon name="alert" size={14} />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  )
}

export type TextFieldProps = BaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'required'>

/** Raccourci pour un champ texte simple. */
export function TextField({
  label,
  required,
  hint,
  error,
  counter,
  className,
  ...input
}: TextFieldProps) {
  return (
    <FormField
      label={label}
      required={required}
      hint={hint}
      error={error}
      counter={counter}
      className={className}
    >
      {(field) => <input {...input} {...field} className="input" />}
    </FormField>
  )
}

export type TextAreaFieldProps = BaseProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'required'>

export function TextAreaField({
  label,
  required,
  hint,
  error,
  counter,
  className,
  ...textarea
}: TextAreaFieldProps) {
  return (
    <FormField
      label={label}
      required={required}
      hint={hint}
      error={error}
      counter={counter}
      className={className}
    >
      {(field) => <textarea {...textarea} {...field} className="textarea" />}
    </FormField>
  )
}

export type SelectFieldProps = BaseProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'required'>

export function SelectField({
  label,
  required,
  hint,
  error,
  className,
  children,
  ...select
}: SelectFieldProps) {
  return (
    <FormField label={label} required={required} hint={hint} error={error} className={className}>
      {(field) => (
        <select {...select} {...field} className="select">
          {children}
        </select>
      )}
    </FormField>
  )
}

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> & {
  children: ReactNode
  className?: string
}

/** Case à cocher avec libellé riche  -  utilisée pour le consentement. */
export function Checkbox({ children, className, ...input }: CheckboxProps) {
  return (
    <label className={cx('check', className)}>
      <input type="checkbox" {...input} />
      <span>{children}</span>
    </label>
  )
}
