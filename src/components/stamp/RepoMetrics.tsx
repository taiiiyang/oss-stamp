import { i18n } from '#i18n'
import { useAtom } from 'jotai'
import { repoContributorAtom } from '@/atoms/contributor-repo'
import { Skeleton } from '@/components/ui/skeleton'
import { RateLimitError } from '@/lib/github-rest'
import { formatActiveSince } from '@/lib/scoring'
import { MetricRow } from './MetricRow'

function MetricsSkeleton() {
  return (
    <div className="space-y-2 py-1">
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-3/4" />
    </div>
  )
}

export function RepoMetrics() {
  const [{ data, isPending, isError, error, refetch }]
    = useAtom(repoContributorAtom)

  if (isPending)
    return <MetricsSkeleton />

  if (isError) {
    const isRateLimit = error instanceof RateLimitError
    return (
      <div className="py-2 text-center text-sm text-muted-foreground">
        <p>{isRateLimit ? i18n.t('errorRateLimit') : i18n.t('errorLoad')}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-1 text-xs font-medium text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {i18n.t('retry')}
        </button>
      </div>
    )
  }

  if (!data) {
    return (
      <p className="py-2 text-center text-sm text-muted-foreground">
        {i18n.t('noData')}
      </p>
    )
  }

  const mergeRate
    = data.totalPRs > 0
      ? Math.round((data.mergedPRs / data.totalPRs) * 100)
      : 0

  return (
    <dl>
      <MetricRow
        label={i18n.t('prsMerged')}
        value={`${data.mergedPRs} / ${data.totalPRs}`}
      />
      <MetricRow label={i18n.t('mergeRate')} value={`${mergeRate}%`} />
      <MetricRow label={i18n.t('reviewsGiven')} value={data.reviewsGiven} />
      <MetricRow
        label={i18n.t('activeSince')}
        value={formatActiveSince(data.firstContributionAt)}
      />
    </dl>
  )
}
