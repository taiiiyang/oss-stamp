export function getTier(score: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  if (score >= 90)
    return 'S'
  if (score >= 70)
    return 'A'
  if (score >= 50)
    return 'B'
  if (score >= 30)
    return 'C'
  return 'D'
}

/**
 * Logarithmic scaling: maps a value to 0–max using log curve.
 * `ref` is the reference value that maps to ~70% of max.
 */
export function logScale(value: number, ref: number, max: number): number {
  if (value <= 0)
    return 0
  const normalized = Math.log1p(value) / Math.log1p(ref)
  return Math.min(Math.round(normalized * max * 0.7), max)
}

export function formatActiveSince(dateStr: string | null): string {
  if (!dateStr)
    return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days < 30)
    return `${days} d`
  const months = Math.floor(days / 30)
  if (months < 12)
    return `${months} mo`
  const years = Math.floor(months / 12)
  return `${years} yr`
}

export function formatAccountAge(createdAt: string): string {
  const years = Math.floor(
    (Date.now() - new Date(createdAt).getTime())
    / (1000 * 60 * 60 * 24 * 365),
  )
  return `${years} yrs`
}
