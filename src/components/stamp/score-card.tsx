import { i18n } from '#i18n'
import { useAtomValue, useSetAtom } from 'jotai'
import { configFieldsAtomMap } from '@/atoms/config'
import { activeTabAtom } from '@/atoms/contributor-score'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OverallMetrics } from './overall-metrics'
import { RepoMetrics } from './repo-metrics'
import { ScoreHeader } from './score-header'
import { TokenBanner } from './token-banner'

export function ScoreCard() {
  const potToken = useAtomValue(configFieldsAtomMap.potToken)
  const setActiveTab = useSetAtom(activeTabAtom)

  return (
    <div className="bg-card text-card-foreground rounded-lg border border-border p-4 mb-4">
      <ScoreHeader />
      {potToken
        ? (
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
          )
        : <TokenBanner />}
    </div>
  )
}
