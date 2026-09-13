import type { EventDoc } from './types'

type DatedEvent = {
  doc: EventDoc
  index: number
  startsAt: number
  endsAt: number
}

function timestamp(value: string | null | undefined): number {
  if (!value) return Number.NaN
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

/**
 * Places the nearest event first.
 *
 * Events that have not started yet (or are still in progress) are sorted by
 * their start date in ascending order. Past events follow, with the most
 * recently finished/started event first so the archive remains useful.
 * Invalid dates are kept at the end instead of making the whole list
 * unpredictable.
 */
export function sortEventsByUpcoming(events: EventDoc[], now = Date.now()): EventDoc[] {
  const dated = events.map<DatedEvent>((doc, index) => {
    const startsAt = timestamp(doc.startsAt)
    const parsedEnd = timestamp(doc.endsAt)
    return {
      doc,
      index,
      startsAt,
      endsAt: Number.isFinite(parsedEnd) ? parsedEnd : startsAt,
    }
  })

  const upcoming = dated.filter(({ endsAt }) => Number.isFinite(endsAt) && endsAt >= now)
  const past = dated.filter(({ endsAt }) => !Number.isFinite(endsAt) || endsAt < now)

  upcoming.sort((left, right) => compareAscending(left, right))
  past.sort((left, right) => compareDescending(left, right))

  return [...upcoming, ...past].map(({ doc }) => doc)
}

function compareAscending(left: DatedEvent, right: DatedEvent): number {
  return compareValidDates(left, right, left.startsAt - right.startsAt)
}

function compareDescending(left: DatedEvent, right: DatedEvent): number {
  return compareValidDates(left, right, right.startsAt - left.startsAt)
}

function compareValidDates(left: DatedEvent, right: DatedEvent, difference: number): number {
  const leftValid = Number.isFinite(left.startsAt)
  const rightValid = Number.isFinite(right.startsAt)
  if (!leftValid && !rightValid) return left.index - right.index
  if (!leftValid) return 1
  if (!rightValid) return -1
  return difference || left.index - right.index
}
