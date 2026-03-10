import type { ProfileScoreResult } from '@/lib/profile-score'
import type { RepoScoreResult } from '@/lib/repo-score'
import { atom } from 'jotai'
import { calculateProfileScore } from '@/lib/profile-score'
import { calculateRepoScore } from '@/lib/repo-score'
import { globalContributorAtom } from './contributor-global'
import { repoContributorAtom } from './contributor-repo'
import { currentRepoAtom, prAuthorAtom } from './pr-page'

export const activeTabAtom = atom<'repo' | 'overall'>('repo')

export const repoScoreAtom = atom<RepoScoreResult | null>((get) => {
  const { data: repoData } = get(repoContributorAtom)
  const { data: globalData } = get(globalContributorAtom)
  const repo = get(currentRepoAtom)
  const author = get(prAuthorAtom)
  if (!repoData || !globalData || !repo || !author)
    return null
  return calculateRepoScore(repoData, globalData, repo.owner, author)
})

export const profileScoreAtom = atom<ProfileScoreResult | null>((get) => {
  const { data: globalData } = get(globalContributorAtom)
  if (!globalData)
    return null
  return calculateProfileScore(globalData)
})
