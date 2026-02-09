import { atomWithQuery } from 'jotai-tanstack-query'
import { fetchRepoContribution } from '@/lib/github-rest'
import { currentRepoAtom, prAuthorAtom } from './pr-page'

export const repoContributorAtom = atomWithQuery((get) => {
  const repo = get(currentRepoAtom)
  const author = get(prAuthorAtom)

  return {
    queryKey: ['contributor-repo', repo?.owner, repo?.repo, author],
    queryFn: () => fetchRepoContribution(repo!.owner, repo!.repo, author!),
    enabled: !!repo && !!author,
    staleTime: 60 * 60 * 1000,
  }
})
