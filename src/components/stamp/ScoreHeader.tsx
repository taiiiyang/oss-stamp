import { i18n } from '#i18n'
import { useAtomValue } from 'jotai'
import { contributorScoreAtom } from '@/atoms/contributor-score'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type Tier = 'S' | 'A' | 'B' | 'C' | 'D'

const tierColors: Record<Tier, string> = {
  S: 'bg-amber-500 text-white',
  A: 'bg-violet-500 text-white',
  B: 'bg-blue-500 text-white',
  C: 'bg-emerald-500 text-white',
  D: 'bg-neutral-400 text-white',
}

function HeaderSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-10 w-20" />
    </div>
  )
}

export function ScoreHeader() {
  const score = useAtomValue(contributorScoreAtom)

  if (!score)
    return <HeaderSkeleton />

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground">
          {i18n.t('contributorScore')}
        </span>
        <span
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
            tierColors[score.tier],
          )}
          aria-label={`Tier ${score.tier}`}
        >
          {score.tier}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="text-3xl font-bold tabular-nums"
          aria-label={`Score: ${score.overall} out of 100`}
        >
          {score.overall}
        </span>
        <span className="text-sm text-muted-foreground">
          {i18n.t('points')}
        </span>
      </div>
    </div>
  )
}
