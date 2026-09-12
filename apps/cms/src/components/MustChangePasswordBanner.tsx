import type { ServerProps } from 'payload'

/**
 * Bandeau affiché tant que le mot de passe initial n'a pas été changé.
 *
 * L'interdiction réelle n'est pas ici : elle est dans les fonctions d'accès
 * (`src/access/index.ts`), qui refusent toute écriture tant que
 * `mustChangePassword` est vrai. Ce bandeau explique simplement le blocage,
 * pour que l'utilisateur ne se heurte pas à une erreur sans contexte.
 */
export function MustChangePasswordBanner({ user }: ServerProps) {
  const account = user as { mustChangePassword?: boolean; id?: string | number } | undefined

  if (!account?.mustChangePassword) return null

  return (
    <div
      role="alert"
      style={{
        border: '1px solid #b36a00',
        background: '#fdf3e3',
        color: '#7a4a00',
        borderRadius: 12,
        padding: '16px 18px',
        marginBottom: 24,
        lineHeight: 1.55,
      }}
    >
      <strong style={{ display: 'block', marginBottom: 4 }}>
        Changez votre mot de passe pour activer votre compte
      </strong>
      <span>
        Votre mot de passe initial est provisoire. Tant qu’il n’a pas été remplacé, la création et
        la modification de contenus sont refusées par le serveur.{' '}
        <a href={`/admin/collections/users/${account.id}`} style={{ fontWeight: 700 }}>
          Modifier mon mot de passe
        </a>
      </span>
    </div>
  )
}
