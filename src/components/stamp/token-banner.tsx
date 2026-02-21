import { i18n } from '#i18n'

export function TokenBanner() {
  return (
    <div className="mt-3 flex items-center justify-between gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs dark:border-blue-900 dark:bg-blue-950">
      <span className="text-blue-700 dark:text-blue-300">
        {i18n.t('tokenBannerText')}
      </span>
      <button
        type="button"
        onClick={() => {
          void browser.runtime.sendMessage({ type: 'open-options' }).catch(() => {
            // Orphaned content script — extension was reloaded without page refresh
          })
        }}
        className="shrink-0 font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        {i18n.t('tokenBannerAction')}
      </button>
    </div>
  )
}
