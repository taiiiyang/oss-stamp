import type { ContributorScore } from '@/lib/scoring'
import { atom } from 'jotai'
import { calculateScore } from '@/lib/scoring'
import { globalContributorAtom } from './contributor-global'
import { repoContributorAtom } from './contributor-repo'

export const contributorScoreAtom = atom<ContributorScore | null>((get) => {
  const { data: repoData } = get(repoContributorAtom)
  const { data: globalData } = get(globalContributorAtom)
  if (!repoData)
    return null
  return calculateScore(repoData, globalData ?? null)
})
