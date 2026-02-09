import { atomWithQuery } from 'jotai-tanstack-query'
import { fetchGlobalContribution } from '@/lib/github-rest'
import { prAuthorAtom } from './pr-page'

export const globalContributorAtom = atomWithQuery((get) => {
  const author = get(prAuthorAtom)

  return {
    queryKey: ['contributor-global', author],
    queryFn: () => fetchGlobalContribution(author!),
    enabled: !!author,
    staleTime: 60 * 60 * 1000,
  }
})
