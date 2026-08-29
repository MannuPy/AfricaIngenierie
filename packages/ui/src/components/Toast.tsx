'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { Icon } from './Icon'
import type { IconName } from '../icon-paths'

export type ToastMessage = {
  id: string
  text: string
  icon: IconName
}

export type ToastProps = {
  text: string
  icon?: IconName
  /** Rend le toast dans le flux plutôt qu'en surimpression. Utile en documentation. */
  inline?: boolean
}

/** Toast isolé  -  utile en démonstration et en test visuel. */
export function Toast({ text, icon = 'check', inline }: ToastProps) {
  return (
    <div className={inline ? 'toast toast-inline' : 'toast'} role="status">
      <Icon name={icon} size={17} />
      <span>{text}</span>
    </div>
  )
}

type ToastContextValue = {
  /** Affiche un message. Durée par défaut : 3,2 s, comme dans le prototype. */
  toast: (text: string, options?: { icon?: IconName; duration?: number }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    setMessages((current) => current.filter((message) => message.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const toast = useCallback<ToastContextValue['toast']>(
    (text, options) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      setMessages((current) => [...current, { id, text, icon: options?.icon ?? 'check' }])
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), options?.duration ?? 3200),
      )
    },
    [dismiss],
  )

  useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach(clearTimeout)
      pending.clear()
    }
  }, [])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {messages.length > 0 ? (
        <div className="toast-stack" aria-live="polite" aria-atomic="false">
          {messages.map((message) => (
            <div className="toast" key={message.id} role="status">
              <Icon name={message.icon} size={17} />
              <span>{message.text}</span>
            </div>
          ))}
        </div>
      ) : null}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast doit être utilisé à l’intérieur de <ToastProvider>')
  }
  return context
}
