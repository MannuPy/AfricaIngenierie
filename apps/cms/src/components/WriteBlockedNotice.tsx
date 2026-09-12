import type { ServerProps } from 'payload'

/**
 * Explique pourquoi le bouton « Créer » a disparu.
 *
 * Le contrôle d'accès de Payload retire l'action de création de l'interface
 * quand elle est refusée. C'est cohérent  -  mieux vaut ne pas proposer un bouton
 * qui échouerait  -  mais l'effet observé est déroutant : la liste s'affiche, et
 * il n'y a simplement plus aucun moyen d'ajouter quoi que ce soit, sans un mot
 * d'explication. Un administrateur en conclut, à raison, que le tableau de bord
 * est cassé.
 *
 * Ce bandeau nomme la cause et donne l'action qui débloque.
 */
export function WriteBlockedNotice({ user }: ServerProps) {
  const account = user as
    | { mustChangePassword?: boolean; isActive?: boolean; role?: string; id?: string | number }
    | undefined

  if (!account) return null

  const box = (title: string, body: React.ReactNode) => (
    <div
      role="status"
      style={{
        border: '1px solid #b36a00',
        background: '#fdf3e3',
        color: '#7a4a00',
        borderRadius: 12,
        padding: '14px 16px',
        marginBottom: 20,
        lineHeight: 1.55,
      }}
    >
      <strong style={{ display: 'block', marginBottom: 4 }}>{title}</strong>
      <span>{body}</span>
    </div>
  )

  if (account.isActive === false) {
    return box(
      'Compte suspendu',
      'Ce compte n’a plus aucun droit d’écriture. Un administrateur doit le réactiver dans « Utilisateurs & rôles ».',
    )
  }

  if (account.mustChangePassword) {
    return box(
      'Création et modification bloquées : mot de passe initial non changé',
      <>
        Votre mot de passe est encore celui fourni à l’ouverture du compte. Tant qu’il n’est pas
        remplacé, le serveur refuse toute écriture  -  c’est pourquoi le bouton « Créer » n’apparaît
        pas.{' '}
        <a href={`/admin/collections/users/${account.id}`} style={{ fontWeight: 700 }}>
          Changer mon mot de passe maintenant
        </a>
      </>,
    )
  }

  if (account.role === 'editor') {
    return box(
      'Vos publications passent par une validation',
      'En tant qu’Éditeur, vous créez et modifiez des contenus, et vous les passez à « À valider ». La publication et l’archivage sont réservés aux Publicateurs et aux Administrateurs.',
    )
  }

  return null
}
