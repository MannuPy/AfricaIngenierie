import type { ReactNode } from 'react'

function Mark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="m4 10 12-6 12 6-12 6L4 10Z" />
      <path d="m4 16 12 6 12-6" />
      <path d="m4 22 12 6 12-6" />
    </svg>
  )
}

export function AdminLogo(): ReactNode {
  return (
    <div className="ai-admin-logo" aria-label="Africa Ingénierie">
      <span className="ai-admin-logo__mark"><Mark /></span>
      <span className="ai-admin-logo__copy">
        <strong>Africa Ingénierie</strong>
        <small>Administration</small>
      </span>
    </div>
  )
}

export function AdminLogoIcon(): ReactNode {
  return (
    <span className="ai-admin-logo__mark ai-admin-logo__mark--icon" aria-label="Africa Ingénierie">
      <Mark />
    </span>
  )
}
