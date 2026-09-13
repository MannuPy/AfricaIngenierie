'use client'

/**
 * Fallback de build/runtime indépendant du shell Payload.
 *
 * Le fallback généré par Next 16 peut tenter de lire un contexte React alors
 * qu'il est pré-rendu hors requête. Ce document minimal reste affichable même
 * si l'erreur survient avant le montage du dashboard.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#f6f8fc',
          color: '#071a3d',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <main style={{ maxWidth: 560, padding: 32, textAlign: 'center' }}>
          <h1 style={{ marginBottom: 12 }}>Une erreur est survenue</h1>
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            Le tableau de bord rencontre un problème temporaire. Rechargez la page ou réessayez dans
            quelques instants.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 24,
              border: 0,
              borderRadius: 8,
              padding: '12px 18px',
              background: '#0b3d91',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Réessayer
          </button>
        </main>
      </body>
    </html>
  )
}
