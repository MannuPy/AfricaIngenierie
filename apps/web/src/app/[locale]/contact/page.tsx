import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Card, Icon, PageHero } from '@africa-ingenierie/ui'
import { listPath, type Locale } from '@africa-ingenierie/validation/routes'

import { ContactForm } from '../../../components/contact-form'
import { alternatePaths } from '../../../lib/paths'
import { assertLocale, loadSectionPage, sectionCrumbs } from '../../../lib/page-shell'
import { pageMetadata } from '../../../lib/seo'
import { ui } from '../../../lib/ui-strings'

export const revalidate = 300

/**
 * Contact.
 *
 * Coordonnées, horaires et délai de réponse annoncé viennent tous des Réglages
 * généraux : aucune adresse, aucun numéro n'est écrit dans ce fichier  -  c'est
 * exactement le genre de valeur qui, dupliquée, finit obsolète à un endroit
 * sans que personne s'en aperçoive.
 */

const PAGE_KEY = 'contact'
const SECTION = 'contact' as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const locale = assertLocale((await params).locale)
  const { header, settings } = await loadSectionPage(PAGE_KEY, locale)
  const path = listPath(SECTION, locale)

  return pageMetadata({
    seo: header?.seo,
    fallbackTitle: header?.title,
    fallbackDescription: header?.intro,
    settings,
    path,
    alternates: alternatePaths(path),
    locale,
  })
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const locale: Locale = assertLocale((await params).locale)
  const { header, settings } = await loadSectionPage(PAGE_KEY, locale)

  if (!header) notFound()

  const strings = ui(locale)

  const addressLines = [
    settings?.addressLine1,
    settings?.addressLine2,
    [settings?.city, settings?.country].filter(Boolean).join(', ') || null,
  ].filter((line): line is string => Boolean(line && line.trim()))

  return (
    <>
      <PageHero
        eyebrow={header.eyebrow}
        title={header.title}
        intro={header.intro ?? undefined}
        crumbs={sectionCrumbs(locale, { key: SECTION, label: header.title })}
      />

      <section className="sec">
        <div className="wrap split">
          <ContactForm strings={strings} locale={locale} />

          <div className="stack g24">
            <Card padding="md">
              <div className="stack g16">
                <h2 className="h3">{strings.contactDetails}</h2>

                {addressLines.length > 0 ? (
                  <address className="body" style={{ fontStyle: 'normal' }}>
                    {addressLines.map((line) => (
                      <span key={line} style={{ display: 'block' }}>
                        {line}
                      </span>
                    ))}
                  </address>
                ) : null}

                {settings?.phone && settings?.phoneRaw ? (
                  <p className="meta">
                    <Icon name="phone" size={15} />
                    <a className="tlink" href={`tel:${settings.phoneRaw}`}>
                      {settings.phone}
                    </a>
                  </p>
                ) : null}

                {settings?.email ? (
                  <p className="meta">
                    <Icon name="mail" size={15} />
                    <a className="tlink" href={`mailto:${settings.email}`}>
                      {settings.email}
                    </a>
                  </p>
                ) : null}

                {settings?.whatsapp ? (
                  <p className="meta">
                    <Icon name="wa" size={15} />
                    <a
                      className="tlink"
                      href={`https://wa.me/${settings.whatsapp}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      WhatsApp
                    </a>
                  </p>
                ) : null}
              </div>
            </Card>

            {settings?.openingHours?.length ? (
              <Card padding="md">
                <div className="stack g16">
                  <h2 className="h3">{strings.openingHours}</h2>
                  <dl className="kv">
                    {settings.openingHours.map((slot, index) => (
                      <div key={slot.id ?? `${index}`} style={{ display: 'contents' }}>
                        <dt>{slot.days}</dt>
                        <dd>{slot.hours}</dd>
                      </div>
                    ))}
                  </dl>
                  {settings.replyDelay ? <p className="meta">{settings.replyDelay}</p> : null}
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      </section>
    </>
  )
}
