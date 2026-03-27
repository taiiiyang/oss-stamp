import { i18n } from '#i18n'
import { IconSettings } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

export function App() {
  return (
    <div className="flex w-80 flex-col overflow-hidden rounded-md bg-background">
      <div className="p-4">
        <h2 className="text-base font-semibold text-foreground">
          {i18n.t('extName')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {i18n.t('popupInfo')}
        </p>
      </div>

      <footer className="flex items-center justify-end border-t border-border bg-muted px-4 py-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 cursor-pointer px-2.5"
          onClick={() => {
            void browser.runtime.sendMessage({ type: 'open-options' }).catch(() => {
              // Popup can outlive the background connection during extension reloads.
            })
          }}
        >
          <IconSettings stroke={1.8} />
          {i18n.t('popupOpenSettings')}
        </Button>
      </footer>
    </div>
  )
}
