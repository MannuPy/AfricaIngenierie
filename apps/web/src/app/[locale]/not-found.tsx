import { EmptyState } from '@africa-ingenierie/ui'
import { DEFAULT_LOCALE, homePath } from '@africa-ingenierie/validation/routes'

import { ui } from '../../lib/ui-strings'

/**
 * Page 404 d'une rubrique.
 *
 * Rendue sans appel au CMS : une page d'erreur qui dépend du service en panne
 * n'a aucune valeur. Les libellés sont donc ceux de la table de structure.
 */
export default function NotFound() {
  const strings = ui(DEFAULT_LOCALE)

  return (
    <section className="sec">
      <div className="wrap">
        <EmptyState
          title={strings.notFoundTitle}
          text={strings.notFoundText}
          icon="search"
          action={{ label: strings.home, href: homePath(DEFAULT_LOCALE) }}
        />
      </div>
    </section>
  )
}
