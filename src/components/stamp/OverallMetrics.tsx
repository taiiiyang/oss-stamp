import { i18n } from '#i18n'
import { useAtom } from 'jotai'
import { globalContributorAtom } from '@/atoms/contributor-global'
import { Skeleton } from '@/components/ui/skeleton'
import { useHasToken } from '@/hooks/use-has-token'
import { RateLimitError } from '@/lib/github-rest'
import { formatAccountAge } from '@/lib/scoring'
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

export function OverallMetrics() {
  const [{ data, isPending, isError, error, refetch }]
    = useAtom(globalContributorAtom)
  const hasToken = useHasToken()

  if (isPending)
    return <MetricsSkeleton />

  if (isError) {
    const isRateLimit = error instanceof RateLimitError
    return (
      <div className="py-2 text-center text-sm text-muted-foreground">
        <p>{isRateLimit ? i18n.t('errorRateLimit') : i18n.t('errorLoad')}</p>
        {isRateLimit && !hasToken && (
          <p className="mt-1 text-xs">{i18n.t('errorRateLimitHint')}</p>
        )}
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

  return (
    <dl>
      <MetricRow
        label={i18n.t('globalPrs')}
        value={`${data.globalMergedPRs} merged`}
      />
      <MetricRow label={i18n.t('commitsYear')} value={data.publicRepos} />
      <MetricRow
        label={i18n.t('accountAge')}
        value={formatAccountAge(data.createdAt)}
      />
      <MetricRow label={i18n.t('followers')} value={data.followers} />
    </dl>
  )
}
