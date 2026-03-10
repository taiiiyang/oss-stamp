import type { GlobalContribution } from './github-rest'
import { getTier, logScale } from './scoring'

export interface ProfileScoreResult {
  total: number
  tier: 'S' | 'A' | 'B' | 'C' | 'D'
  communityPresence: number
  ossImpact: number
  activity: number
  ecosystem: number
}

export const PROFILE_SCORE_MAX = {
  communityPresence: 25,
  ossImpact: 25,
  activity: 30,
  ecosystem: 20,
} as const

function accountAgeYears(created: string): number {
  return (Date.now() - new Date(created).getTime()) / 3.154e10
}

function scoreCommunityPresence(data: GlobalContribution): number {
  let s = 0

  // Account age (0-5)
  const years = accountAgeYears(data.createdAt)
  s += years < 1 ? 1 : years < 3 ? 2 : years < 6 ? 3 : years < 10 ? 4 : 5

  // Followers (0-12): log scale, ref=200
  s += logScale(data.followers, 200, 12)

  // Follower/following ratio (0-4)
  const ratio
    = data.following > 0
      ? data.followers / data.following
      : data.followers > 0
        ? 10
        : 0
  s += ratio < 0.5 ? 0 : ratio < 1 ? 1 : ratio < 3 ? 2 : ratio < 10 ? 3 : 4

  // Has bio (0-4)
  if (data.hasBio)
    s += 4

  return Math.min(s, 25)
}

function scoreOSSImpact(data: GlobalContribution): number {
  let s = 0
  const stars = data.topRepoStars

  // Top repo stars (0-10): log scale, ref=500
  const topStars = stars.length > 0 ? Math.max(...stars) : 0
  s += logScale(topStars, 500, 10)

  // Total stars (0-10): log scale, ref=500
  const totalStars = stars.reduce((a, b) => a + b, 0)
  s += logScale(totalStars, 500, 10)

  // Total forks (0-5): log scale, ref=100
  s += logScale(data.totalForks, 100, 5)

  return Math.min(s, 25)
}

function scoreActivity(data: GlobalContribution): number {
  let s = 0

  // Yearly contributions (0-18): log scale, ref=800
  s += logScale(data.totalContributions, 800, 18)

  // Public repos (0-12): log scale, ref=50
  s += logScale(data.publicRepos, 50, 12)

  return Math.min(s, 30)
}

function scoreEcosystem(data: GlobalContribution): number {
  let s = 0

  // Org memberships (0-12)
  const o = data.orgCount
  s += o === 0 ? 0 : o === 1 ? 3 : o <= 3 ? 6 : o <= 7 ? 9 : 12

  // Language diversity (0-8)
  const l = data.languageCount
  s += l <= 1 ? 0 : l === 2 ? 2 : l <= 4 ? 4 : l <= 7 ? 6 : 8

  return Math.min(s, 20)
}

export function calculateProfileScore(data: GlobalContribution): ProfileScoreResult {
  const communityPresence = scoreCommunityPresence(data)
  const ossImpact = scoreOSSImpact(data)
  const activity = scoreActivity(data)
  const ecosystem = scoreEcosystem(data)
  const total = communityPresence + ossImpact + activity + ecosystem

  return {
    total,
    tier: getTier(total),
    communityPresence,
    ossImpact,
    activity,
    ecosystem,
  }
}
