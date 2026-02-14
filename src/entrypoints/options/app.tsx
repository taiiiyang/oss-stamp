import { i18n } from '#i18n'
import { useCallback, useEffect, useState } from 'react'
import { clearToken, getToken, setToken, validateToken } from '@/lib/token-storage'

type TokenStatus = 'none' | 'valid' | 'invalid' | 'validating'

export function App() {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<TokenStatus>('none')
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    void getToken().then((token) => {
      if (token) {
        setHasToken(true)
        setStatus('validating')
        void validateToken(token).then(ok => setStatus(ok ? 'valid' : 'invalid'))
      }
    })
  }, [])

  const handleSave = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed)
      return
    setStatus('validating')
    const ok = await validateToken(trimmed)
    if (ok) {
      await setToken(trimmed)
      setHasToken(true)
      setStatus('valid')
      setInput('')
    }
    else {
      setStatus('invalid')
    }
  }, [input])

  const handleClear = useCallback(async () => {
    await clearToken()
    setHasToken(false)
    setStatus('none')
    setInput('')
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-2xl px-6 py-6">
          <h1 className="text-xl font-semibold text-foreground">
            {`${i18n.t('extName')} ${i18n.t('optionsTitle')}`}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {i18n.t('popupInfo')}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">
            {i18n.t('optionsAuthSection')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {i18n.t('optionsAuthDesc')}
          </p>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground">
              {i18n.t('tokenLabel')}
            </label>

            <div className="mt-2 flex gap-2">
              <input
                type="password"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={i18n.t('tokenPlaceholder')}
                className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={!input.trim() || status === 'validating'}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {i18n.t('tokenSave')}
              </button>
            </div>

            {hasToken && (
              <button
                type="button"
                onClick={() => void handleClear()}
                className="mt-2 text-sm text-destructive hover:underline"
              >
                {i18n.t('tokenClear')}
              </button>
            )}

            <div className="mt-3 text-sm">
              {status === 'validating' && (
                <span className="text-muted-foreground">{i18n.t('loading')}</span>
              )}
              {status === 'valid' && (
                <span className="text-success">{i18n.t('tokenValid')}</span>
              )}
              {status === 'invalid' && (
                <span className="text-destructive">{i18n.t('tokenInvalid')}</span>
              )}
              {status === 'none' && (
                <span className="text-muted-foreground">{i18n.t('tokenNone')}</span>
              )}
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              {hasToken ? i18n.t('rateLimitAuth') : i18n.t('rateLimitUnauth')}
            </p>

            <div className="mt-4 rounded-lg bg-muted p-4">
              <p className="text-sm font-medium text-foreground">
                {i18n.t('tokenHowTo')}
              </p>
              <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>{i18n.t('tokenStep1')}</li>
                <li>{i18n.t('tokenStep2')}</li>
                <li>{i18n.t('tokenStep3')}</li>
              </ol>
              <a
                href="https://github.com/settings/tokens/new"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-medium text-blue-500 hover:underline"
              >
                {i18n.t('tokenGuide')}
                {' '}
                →
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
