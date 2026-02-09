import type { ContributionPattern, ContributorScore } from '@/lib/scoring'
import { atom } from 'jotai'
import {
  calculateScore,

  getContributionPattern,
} from '@/lib/scoring'
import { globalContributorAtom } from './contributor-global'
import { repoContributorAtom } from './contributor-repo'

export const contributorScoreAtom = atom<ContributorScore | null>((get) => {
  const { data: repoData } = get(repoContributorAtom)
  const { data: globalData } = get(globalContributorAtom)
  if (!repoData)
    return null
  return calculateScore(repoData, globalData ?? null)
})

export const contributionPatternAtom = atom<ContributionPattern | null>(
  (get) => {
    const { data: repoData } = get(repoContributorAtom)
    const { data: globalData } = get(globalContributorAtom)
    if (!repoData)
      return null
    return getContributionPattern(repoData, globalData ?? null)
  },
)
