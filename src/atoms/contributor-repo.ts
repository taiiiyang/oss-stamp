import { atomWithQuery } from 'jotai-tanstack-query'
import { fetchRepoContribution } from '@/lib/github-rest'
import { configAtom } from './config'
import { currentRepoAtom, prAuthorAtom } from './pr-page'

export const repoContributorAtom = atomWithQuery((get) => {
  const repo = get(currentRepoAtom)
  const author = get(prAuthorAtom)
  const { potToken } = get(configAtom)

  return {
    queryKey: ['contributor-repo', repo?.owner, repo?.repo, author, potToken],
    queryFn: () => fetchRepoContribution(repo!.owner, repo!.repo, author!, potToken),
    enabled: !!repo && !!author,
    staleTime: 60 * 60 * 1000,
  }
})
