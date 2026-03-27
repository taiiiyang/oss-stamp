import { i18n } from '#i18n'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { configFieldsAtomMap } from '@/atoms/config'
import { activeTabAtom } from '@/atoms/contributor-score'
import { prAuthorAtom } from '@/atoms/pr-page'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchPRAuthor, GitHubApiError, RateLimitError, validateToken } from '@/lib/github-rest'
import { OverallMetrics } from './overall-metrics'
import { RepoMetrics } from './repo-metrics'
import { ScoreHeader } from './score-header'
import { TokenBanner } from './token-banner'

type TokenGateState = 'missing' | 'validating' | 'invalid' | 'ready' | 'error'

interface ScoreCardProps {
  owner: string
  repo: string
  prNumber: number
}

function CardLoadingState() {
  return (
    <div className="mt-3 space-y-3">
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-5 w-full" />
      </div>
      <Skeleton className="h-9 w-40" />
      <div className="space-y-2 py-1">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
      </div>
    </div>
  )
}

function CardErrorState({ error, onRetry }: { error: unknown, onRetry: () => void }) {
  const isRateLimit = error instanceof RateLimitError

  return (
    <div className="mt-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
      <p>{isRateLimit ? i18n.t('errorRateLimit') : i18n.t('errorLoad')}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 text-xs font-medium text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {i18n.t('retry')}
      </button>
    </div>
  )
}

export function ScoreCard({ owner, repo, prNumber }: ScoreCardProps) {
  const potToken = useAtomValue(configFieldsAtomMap.potToken)
  const setActiveTab = useSetAtom(activeTabAtom)
  const setAuthor = useSetAtom(prAuthorAtom)

  const tokenValidationQuery = useQuery({
    queryKey: ['validate-token', potToken],
    queryFn: () => validateToken(potToken),
    enabled: !!potToken,
  })

  let tokenState: TokenGateState = 'ready'
  if (!potToken) {
    tokenState = 'missing'
  }
  else if (tokenValidationQuery.isPending) {
    tokenState = 'validating'
  }
  else if (tokenValidationQuery.isError) {
    tokenState = 'error'
  }
  else if (!tokenValidationQuery.data) {
    tokenState = 'invalid'
  }

  const authorQuery = useQuery({
    queryKey: ['pr-author', owner, repo, prNumber, potToken],
    queryFn: () => fetchPRAuthor(owner, repo, prNumber, potToken),
    enabled: tokenState === 'ready',
  })

  useEffect(() => {
    if (tokenState !== 'ready' || !authorQuery.data) {
      setAuthor(null)
      return
    }
    setAuthor(authorQuery.data)
  }, [authorQuery.data, setAuthor, tokenState])

  if (tokenState === 'missing') {
    return (
      <div className="mb-4 rounded-lg border border-border bg-card p-4 text-card-foreground">
        <TokenBanner variant="missing" />
      </div>
    )
  }

  if (tokenState === 'invalid') {
    return (
      <div className="mb-4 rounded-lg border border-border bg-card p-4 text-card-foreground">
        <TokenBanner variant="invalid" />
      </div>
    )
  }

  if (tokenState === 'error') {
    return (
      <div className="mb-4 rounded-lg border border-border bg-card p-4 text-card-foreground">
        <CardErrorState error={tokenValidationQuery.error} onRetry={() => void tokenValidationQuery.refetch()} />
      </div>
    )
  }

  if (authorQuery.isError && authorQuery.error instanceof GitHubApiError && authorQuery.error.status === 401) {
    return (
      <div className="mb-4 rounded-lg border border-border bg-card p-4 text-card-foreground">
        <TokenBanner variant="invalid" />
      </div>
    )
  }

  if (tokenState === 'validating' || authorQuery.isPending) {
    return (
      <div className="mb-4 rounded-lg border border-border bg-card p-4 text-card-foreground">
        <CardLoadingState />
      </div>
    )
  }

  if (authorQuery.isError) {
    return (
      <div className="mb-4 rounded-lg border border-border bg-card p-4 text-card-foreground">
        <CardErrorState error={authorQuery.error} onRetry={() => void authorQuery.refetch()} />
      </div>
    )
  }

  return (
    <div className="mb-4 rounded-lg border border-border bg-card p-4 text-card-foreground">
      <ScoreHeader />
      <Tabs defaultValue="repo" onValueChange={v => setActiveTab(v as 'repo' | 'overall')}>
        <TabsList className="mt-3">
          <TabsTrigger value="repo">{i18n.t('tabThisRepo')}</TabsTrigger>
          <TabsTrigger value="overall">{i18n.t('tabOverall')}</TabsTrigger>
        </TabsList>
        <TabsContent value="repo">
          <RepoMetrics />
        </TabsContent>
        <TabsContent value="overall">
          <OverallMetrics />
        </TabsContent>
      </Tabs>
    </div>
  )
}
