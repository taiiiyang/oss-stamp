import { useQuery } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { configAtom } from '@/atoms/config'
import { currentRepoAtom, prAuthorAtom } from '@/atoms/pr-page'
import { ScoreCard } from '@/components/stamp/score-card'
import { fetchPRAuthor } from '@/lib/github-rest'

interface Props {
  owner: string
  repo: string
  prNumber: number
}

export default function App({ owner, repo, prNumber }: Props) {
  const setAuthor = useSetAtom(prAuthorAtom)
  const setRepo = useSetAtom(currentRepoAtom)
  const { potToken } = useAtomValue(configAtom)

  useEffect(() => {
    setRepo({ owner, repo })
  }, [owner, repo, setRepo])

  const { data: author } = useQuery({
    queryKey: ['pr-author', owner, repo, prNumber, potToken],
    queryFn: () => fetchPRAuthor(owner, repo, prNumber, potToken),
  })

  useEffect(() => {
    if (author)
      setAuthor(author)
  }, [author, setAuthor])

  return <ScoreCard />
}
