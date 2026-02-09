import { useAtomValue } from 'jotai'
import { contributionPatternAtom } from '@/atoms/contributor-score'
import { Badge } from '@/components/ui/badge'

export function ContributorTag() {
  const pattern = useAtomValue(contributionPatternAtom)

  if (!pattern)
    return null

  return (
    <div className="mt-3">
      <Badge variant="secondary">{pattern}</Badge>
    </div>
  )
}
