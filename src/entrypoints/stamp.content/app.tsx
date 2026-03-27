import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { currentRepoAtom } from '@/atoms/pr-page'
import { ScoreCard } from '@/components/stamp/score-card'

interface Props {
  owner: string
  repo: string
  prNumber: number
}

export default function App({ owner, repo, prNumber }: Props) {
  const setRepo = useSetAtom(currentRepoAtom)

  useEffect(() => {
    setRepo({ owner, repo })
  }, [owner, repo, setRepo])

  return <ScoreCard owner={owner} repo={repo} prNumber={prNumber} />
}
