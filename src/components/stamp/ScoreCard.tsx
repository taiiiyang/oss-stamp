import { i18n } from '#i18n'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OverallMetrics } from './OverallMetrics'
import { RepoMetrics } from './RepoMetrics'
import { ScoreHeader } from './ScoreHeader'

export function ScoreCard() {
  return (
    <div className="bg-card text-card-foreground rounded-lg border border-border p-4 mb-4">
      <ScoreHeader />
      <Tabs defaultValue="repo">
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
