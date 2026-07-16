// Pure helpers for shifting a case-study patient's clinical timeline so its
// most-recent entry lands a fixed number of days before the student's open
// time, while preserving the relative spacing between all entries.
//
// Every helper is defensively guarded: on invalid/missing input it returns the
// input unchanged (or null) rather than throwing.

// Parse an ISO string to epoch ms, or null when absent/invalid.
export const toMs = (iso?: string): number | null => {
  if (!iso) return null
  const t = Date.parse(iso)
  return Number.isNaN(t) ? null : t
}

// Shift an ISO string by `ms` and return a new ISO string. Invalid input is
// returned unchanged.
export const shiftIso = (iso: string, ms: number): string => {
  const t = Date.parse(iso)
  return Number.isNaN(t) ? iso : new Date(t + ms).toISOString()
}

// Parse a nursing-note's locale date + time (e.g. '7/14/2026' + '08:00 AM') to
// epoch ms, or null when the date is absent/unparseable.
export const parseNoteDateTime = (date?: string, time?: string): number | null => {
  if (!date) return null
  const t = Date.parse(`${date} ${time || ''}`.trim())
  return Number.isNaN(t) ? null : t
}

// Shift a nursing-note's locale date + time by `ms`, re-formatting to the SAME
// display format the app uses when creating notes:
//   date -> toLocaleDateString()
//   time -> toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
// Invalid input is returned unchanged.
export const shiftNoteDateTime = (
  date: string,
  time: string,
  ms: number,
): { date: string; time: string } => {
  const t = parseNoteDateTime(date, time)
  if (t === null) return { date, time }
  const d = new Date(t + ms)
  return {
    date: d.toLocaleDateString(),
    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }
}

// Max clinical timestamp (epoch ms) across a template, including nursing notes.
// Returns null when the template has no parseable clinical timestamps.
export const computeAnchorMs = (p: any): number | null => {
  const values: number[] = []
  const push = (v: number | null) => {
    if (v !== null) values.push(v)
  }

  p?.vitals?.forEach((v: any) => push(toMs(v?.timestamp)))
  p?.labs?.forEach((l: any) => push(toMs(l?.date)))
  p?.encounters?.forEach((e: any) => push(toMs(e?.date)))
  p?.ioEntries?.forEach((i: any) => push(toMs(i?.timestamp)))
  p?.orders?.forEach((o: any) => push(toMs(o?.date)))
  p?.assessments?.forEach((a: any) => push(toMs(a?.timestamp)))
  p?.bradenScores?.forEach((b: any) => push(toMs(b?.timestamp)))
  p?.marEntries?.forEach((m: any) =>
    m?.administrations?.forEach((ad: any) => push(toMs(ad?.givenAt))),
  )
  p?.nursingNotes?.forEach((n: any) => push(parseNoteDateTime(n?.date, n?.time)))

  return values.length ? Math.max(...values) : null
}
