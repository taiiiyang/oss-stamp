import type { GlobalContribution, RepoContribution } from './github-rest'
import { getTier } from './scoring'

export interface RepoScoreResult {
  total: number
  tier: 'S' | 'A' | 'B' | 'C' | 'D'
  repoFamiliarity: number
  communityStanding: number
  ossInfluence: number
  prTrackRecord: number
}

export const REPO_SCORE_MAX = {
  repoFamiliarity: 35,
  communityStanding: 25,
  ossInfluence: 20,
  prTrackRecord: 20,
} as const

function accountAgeMonths(created: string): number {
  return (Date.now() - new Date(created).getTime()) / 2.628e9
}

function activeDurationMonths(firstContributionAt: string | null): number {
  if (!firstContributionAt)
    return 0
  return (Date.now() - new Date(firstContributionAt).getTime()) / 2.628e9
}

function scoreRepoFamiliarity(repo: RepoContribution): number {
  let s = 0

  // Merged PRs: 0=0, 1=3, 2-5=6, 6-15=9, 15+=12
  const merged = repo.mergedPRs
  s += merged === 0 ? 0 : merged === 1 ? 3 : merged <= 5 ? 6 : merged <= 15 ? 9 : 12

  // Reviews: 0=0, 1-3=3, 4-10=5, 10+=8
  const r = repo.reviewsGiven
  s += r === 0 ? 0 : r <= 3 ? 3 : r <= 10 ? 5 : 8

  // Active duration (replaces commitsInRepo): <1mo=0, 1-6mo=3, 6mo-2yr=5, 2-5yr=8, 5yr+=10
  const months = activeDurationMonths(repo.firstContributionAt)
  s += months < 1 ? 0 : months < 6 ? 3 : months < 24 ? 5 : months < 60 ? 8 : 10

  // Is contributor: has merged PRs or reviews
  if (repo.mergedPRs > 0 || repo.reviewsGiven > 0)
    s += 5

  return Math.min(s, 35)
}

function scoreCommunityStanding(repo: RepoContribution, global: GlobalContribution): number {
  let s = 0

  // Account age: <3mo=0, 3mo-1y=2, 1-3y=3, 3-7y=4, 7+=5
  const months = accountAgeMonths(global.createdAt)
  s += months < 3 ? 0 : months < 12 ? 2 : months < 36 ? 3 : months < 84 ? 4 : 5

  // Followers: 0-10=1, 10-50=3, 50-200=5, 200-1k=7, 1k+=10
  const f = global.followers
  s += f < 10 ? 1 : f < 50 ? 3 : f < 200 ? 5 : f < 1000 ? 7 : 10

  // Org member: yes=10, no=0
  if (repo.isOrgMember)
    s += 10

  return Math.min(s, 25)
}

function scoreOSSInfluence(global: GlobalContribution): number {
  let s = 0
  const stars = global.topRepoStars

  // Max stars: 0=0, 1-50=3, 50-500=6, 500-5k=12, 5k+=15
  const max = stars.length > 0 ? Math.max(...stars) : 0
  s += max === 0 ? 0 : max <= 50 ? 3 : max <= 500 ? 6 : max <= 5000 ? 12 : 15

  // Total stars: 0-50=0, 50-500=2, 500+=5
  const total = stars.reduce((a, b) => a + b, 0)
  s += total < 50 ? 0 : total < 500 ? 2 : 5

  return Math.min(s, 20)
}

function scorePRTrackRecord(repo: RepoContribution): number {
  if (repo.totalPRs === 0)
    return 5 // neutral for first-time contributors

  const rate = (repo.mergedPRs / repo.totalPRs) * 100
  // 0 merged → neutral (could be all open or rejected)
  if (repo.mergedPRs === 0)
    return 5
  return rate < 50 ? 5 : rate < 75 ? 10 : rate < 90 ? 15 : 20
}

export function calculateRepoScore(
  repo: RepoContribution,
  global: GlobalContribution,
  repoOwner: string,
  prAuthor: string,
): RepoScoreResult {
  // Owner is always fully trusted
  if (repoOwner.toLowerCase() === prAuthor.toLowerCase()) {
    return {
      total: 100,
      tier: 'S',
      repoFamiliarity: 35,
      communityStanding: 25,
      ossInfluence: 20,
      prTrackRecord: 20,
    }
  }

  const repoFamiliarity = scoreRepoFamiliarity(repo)
  const communityStanding = scoreCommunityStanding(repo, global)
  const ossInfluence = scoreOSSInfluence(global)
  const prTrackRecord = scorePRTrackRecord(repo)
  const total = repoFamiliarity + communityStanding + ossInfluence + prTrackRecord

  return {
    total,
    tier: getTier(total),
    repoFamiliarity,
    communityStanding,
    ossInfluence,
    prTrackRecord,
  }
}
