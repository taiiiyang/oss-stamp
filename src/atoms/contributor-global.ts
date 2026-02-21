import { atomWithQuery } from 'jotai-tanstack-query'
import { fetchGlobalContribution } from '@/lib/github-rest'
import { configAtom } from './config'
import { prAuthorAtom } from './pr-page'

export const globalContributorAtom = atomWithQuery((get) => {
  const author = get(prAuthorAtom)
  const { potToken } = get(configAtom)

  return {
    queryKey: ['contributor-global', author, potToken],
    queryFn: () => fetchGlobalContribution(author!, potToken),
    enabled: !!author,
    staleTime: 60 * 60 * 1000,
  }
})
