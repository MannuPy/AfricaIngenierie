import type { ReactNode } from 'react'

import { Icon, type IconName } from '@africa-ingenierie/ui'
import type { Locale } from '@africa-ingenierie/validation/routes'

type StoryTab = {
  id: 'identity' | 'vision' | 'commitments'
  label: string
  content: ReactNode
}

const ICONS: Record<StoryTab['id'], IconName> = {
  identity: 'users',
  vision: 'target',
  commitments: 'shield',
}

export function StoryTabs({
  locale,
  identity,
  vision,
  commitments,
}: {
  locale: Locale
  identity: string
  vision: string
  commitments?: Array<{ title: string; text: string; icon?: string | null }> | null
}) {
  const idPrefix = `story-${locale}`
  const tabs: StoryTab[] = [
    {
      id: 'identity',
      label: locale === 'en' ? 'Who we are' : 'Qui nous sommes',
      content: identity,
    },
    {
      id: 'vision',
      label: locale === 'en' ? 'Our vision' : 'Notre vision',
      content: vision,
    },
    {
      id: 'commitments',
      label: locale === 'en' ? 'Our commitments' : 'Nos engagements',
      content: commitments?.length ? (
        <div className="story-commitments">
          {commitments.slice(0, 3).map((item, index) => (
            <div className="story-commitment" key={`${item.title}-${index}`}>
              <span className="ic-badge" aria-hidden="true">
                <Icon name={ICONS.commitments} size={18} />
              </span>
              <span>
                <strong>{item.title}</strong>
                <small>{item.text}</small>
              </span>
            </div>
          ))}
        </div>
      ) : locale === 'en' ? (
        'We combine technical expertise, field awareness and clear commitments at every stage.'
      ) : (
        'Nous associons expertise technique, connaissance du terrain et engagements clairs à chaque étape.'
      ),
    },
  ]

  return (
    <div className="story-tabs">
      <fieldset>
        <legend className="sr-only">{locale === 'en' ? 'Our story' : 'Notre histoire'}</legend>
        {tabs.map((tab, index) => {
          const inputId = `${idPrefix}-${tab.id}`
          return (
            <span className="story-tab-control" key={tab.id}>
              <input type="radio" name={idPrefix} id={inputId} defaultChecked={index === 0} />
              <label htmlFor={inputId}>{tab.label}</label>
            </span>
          )
        })}
      </fieldset>
      <div className="story-panels">
        {tabs.map((tab) => (
          <section className="story-panel" data-tab={tab.id} key={tab.id}>
            <div className="story-panel-icon" aria-hidden="true">
              <Icon name={ICONS[tab.id]} size={22} />
            </div>
            <div className="stack g12">
              <h3 className="h3">{tab.label}</h3>
              {typeof tab.content === 'string' ? <p className="lead">{tab.content}</p> : tab.content}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
