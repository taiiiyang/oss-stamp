import { i18n } from '#i18n'
import { cn } from '@/lib/utils'

type TokenBannerVariant = 'missing' | 'invalid'

const bannerTone = {
  missing: {
    container: 'border-blue-200 bg-blue-50',
    title: 'text-blue-950',
    body: 'text-blue-700',
    action: 'border-blue-300 text-blue-700 hover:bg-blue-100',
    titleKey: 'tokenBannerMissingTitle',
    bodyKey: 'tokenBannerMissingText',
  },
  invalid: {
    container: 'border-amber-200 bg-amber-50',
    title: 'text-amber-950',
    body: 'text-amber-700',
    action: 'border-amber-300 text-amber-700 hover:bg-amber-100',
    titleKey: 'tokenBannerInvalidTitle',
    bodyKey: 'tokenBannerInvalidText',
  },
} as const

interface TokenBannerProps {
  variant: TokenBannerVariant
}

export function TokenBanner({ variant }: TokenBannerProps) {
  const tone = bannerTone[variant]

  return (
    <div className={cn('mt-3 flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between', tone.container)}>
      <div className="space-y-1">
        <p className={cn('text-sm font-semibold', tone.title)}>
          {i18n.t(tone.titleKey)}
        </p>
        <p className={cn('text-sm leading-5', tone.body)}>
          {i18n.t(tone.bodyKey)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          void browser.runtime.sendMessage({ type: 'open-options' }).catch(() => {
            // Orphaned content script — extension was reloaded without page refresh
          })
        }}
        className={cn('shrink-0 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors', tone.action)}
      >
        {i18n.t('tokenBannerAction')}
      </button>
    </div>
  )
}
