import type { MetadataRoute } from 'next'

/** Robots public : l'administration est servie par un hôte séparé. */
export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8080').replace(/\/$/, '')
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${base}/sitemap.xml`,
  }
}
