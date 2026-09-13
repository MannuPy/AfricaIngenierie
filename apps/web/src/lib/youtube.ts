/** Convert supported YouTube links to a privacy-enhanced embed URL. */
export function youtubeEmbedUrl(value: string | null | undefined): string | null {
  if (!value) return null

  try {
    const url = new URL(value)
    let id = ''

    if (url.hostname === 'youtu.be') {
      id = url.pathname.slice(1).split('/')[0] ?? ''
    } else if (url.hostname === 'youtube.com' || url.hostname === 'www.youtube.com') {
      id = url.searchParams.get('v') ?? url.pathname.split('/').filter(Boolean).pop() ?? ''
    }

    if (!/^[A-Za-z0-9_-]{6,20}$/.test(id)) return null

    const params = new URLSearchParams({ rel: '0' })
    const timestamp = url.searchParams.get('t')
    if (timestamp) {
      const match = timestamp.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i)
      if (match && match[0] !== '') {
        const start = Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0)
        if (Number.isFinite(start) && start > 0) params.set('start', String(start))
      }
    }

    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?${params.toString()}`
  } catch {
    return null
  }
}
