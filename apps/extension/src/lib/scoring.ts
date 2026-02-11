import type { GlobalContribution, RepoContribution } from '@/lib/github-rest'

export interface ContributorScore {
  overall: number
  tier: 'S' | 'A' | 'B' | 'C' | 'D'
  components: {
    contribution: number
    mergeRate: number
    review: number
    tenure: number
    recency: number
  }
}

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

function logScale(value: number, cap: number): number {
  if (value <= 0)
    return 0
  const score = (Math.log(value + 1) / Math.log(cap + 1)) * 100
  return Math.min(100, Math.round(score))
}

export function calculateScore(
  repoData: RepoContribution,
  globalData: GlobalContribution | null | undefined,
): ContributorScore {
  const contribution = logScale(repoData.mergedPRs, 50)

  const mergeRate
    = repoData.totalPRs > 0
      ? Math.round((repoData.mergedPRs / repoData.totalPRs) * 100)
      : 0

  const review = logScale(repoData.reviewsGiven, 30)

  let tenure = 0
  if (repoData.firstContributionAt) {
    const firstDate = new Date(repoData.firstContributionAt)
    const months
      = (Date.now() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    tenure = Math.min(100, Math.round((months / 24) * 100))
  }

  const recency = globalData
    ? Math.min(100, globalData.publicRepos + globalData.followers)
    : 50

  const overall = Math.round(
    contribution * 0.4
    + mergeRate * 0.15
    + review * 0.15
    + tenure * 0.15
    + recency * 0.15,
  )

  return {
    overall,
    tier: getTier(overall),
    components: {
      contribution,
      mergeRate,
      review,
      tenure,
      recency,
    },
  }
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
