import { i18n } from '#i18n'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ContributorTag } from './ContributorTag'
import { OverallMetrics } from './OverallMetrics'
import { RepoMetrics } from './RepoMetrics'
import { ScoreHeader } from './ScoreHeader'

export function ScoreCard() {
  return (
    <div className="bg-background text-foreground pb-3 mb-3 border-b border-border">
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
      <ContributorTag />
    </div>
  )
}
