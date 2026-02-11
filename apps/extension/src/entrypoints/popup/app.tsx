import { i18n } from '#i18n'

export function App() {
  return (
    <div className="w-80 p-4">
      <h2 className="text-base font-semibold text-foreground">
        {i18n.t('extName')}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {i18n.t('popupInfo')}
      </p>
    </div>
  )
}
