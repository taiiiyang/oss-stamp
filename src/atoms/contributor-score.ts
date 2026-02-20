import type { ContributorScore } from '@/lib/scoring'
import { atom } from 'jotai'
import { calculateScore } from '@/lib/scoring'
import { globalContributorAtom } from './contributor-global'

export const contributorScoreAtom = atom<ContributorScore | null>((get) => {
  const { data: globalData } = get(globalContributorAtom)
  if (!globalData)
    return null
  return calculateScore(globalData)
})
