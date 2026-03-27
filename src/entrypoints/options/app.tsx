import { i18n } from '#i18n'
import { useQuery } from '@tanstack/react-query'
import { useAtom, useSetAtom } from 'jotai'
import { Eye, EyeOff } from 'lucide-react'
import { useCallback, useState } from 'react'
import { configFieldsAtomMap, writeConfigAtom } from '@/atoms/config'
import { Button } from '@/components/ui/button'
import { validateToken } from '@/lib/github-rest'

type SaveStatus = 'idle' | 'validating' | 'invalid'
type TokenStatus = SaveStatus | 'none' | 'valid'

export function App() {
  const [potToken, setPotToken] = useAtom(configFieldsAtomMap.potToken)
  const writeConfig = useSetAtom(writeConfigAtom)
  const [draftToken, setDraftToken] = useState<string | null>(null)
  const [isTokenVisible, setIsTokenVisible] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const input = draftToken ?? potToken

  const { data: isTokenValid, isLoading: isValidating } = useQuery({
    queryKey: ['validate-token', potToken],
    queryFn: () => validateToken(potToken),
    enabled: !!potToken,
  })

  function getPersistedTokenStatus(): TokenStatus {
    if (!potToken)
      return 'none'
    if (isValidating)
      return 'validating'
    return isTokenValid ? 'valid' : 'invalid'
  }

  function getTokenStatus() {
    if (saveStatus !== 'idle')
      return saveStatus
    return getPersistedTokenStatus()
  }

  const persistedTokenStatus = getPersistedTokenStatus()
  const tokenStatus = getTokenStatus()

  const handleSave = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed)
      return
    setSaveStatus('validating')
    const ok = await validateToken(trimmed)
    if (ok) {
      writeConfig({ potToken: trimmed })
      setDraftToken(trimmed)
      setSaveStatus('idle')
    }
    else {
      setSaveStatus('invalid')
    }
  }, [input, writeConfig])

  const handleClear = useCallback(() => {
    setPotToken('')
    setSaveStatus('idle')
    setDraftToken(null)
    setIsTokenVisible(false)
  }, [setPotToken])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-2xl px-6 py-6">
          <h1 className="text-xl font-semibold text-foreground">
            {`${i18n.t('extName')} ${i18n.t('optionsTitle')}`}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{i18n.t('popupInfo')}</p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">
            {i18n.t('optionsAuthSection')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{i18n.t('optionsAuthDesc')}</p>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground">
              {i18n.t('tokenLabel')}
            </label>

            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type={isTokenVisible ? 'text' : 'password'}
                  value={input}
                  onChange={(e) => {
                    setDraftToken(e.target.value)
                    if (saveStatus !== 'idle')
                      setSaveStatus('idle')
                  }}
                  placeholder={i18n.t('tokenPlaceholder')}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={isTokenVisible ? i18n.t('hideToken') : i18n.t('showToken')}
                  aria-pressed={isTokenVisible}
                  onClick={() => setIsTokenVisible(visible => !visible)}
                >
                  {isTokenVisible ? <EyeOff /> : <Eye />}
                </Button>
              </div>

              <div className="flex gap-2 sm:shrink-0">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSave}
                  disabled={!input.trim() || tokenStatus === 'validating'}
                >
                  {i18n.t('tokenSave')}
                </Button>
                {!!potToken && (
                  <Button type="button" variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10" onClick={handleClear}>
                    {i18n.t('tokenClear')}
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-3 text-sm">
              {tokenStatus === 'validating' && (
                <span className="text-muted-foreground">{i18n.t('loading')}</span>
              )}
              {tokenStatus === 'valid' && (
                <span className="text-success">{i18n.t('tokenValid')}</span>
              )}
              {tokenStatus === 'invalid' && (
                <span className="text-destructive">{i18n.t('tokenInvalid')}</span>
              )}
              {tokenStatus === 'none' && (
                <span className="text-muted-foreground">{i18n.t('tokenNone')}</span>
              )}
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              {(persistedTokenStatus === 'valid' || persistedTokenStatus === 'validating')
                ? i18n.t('rateLimitAuth')
                : i18n.t('rateLimitUnauth')}
            </p>

            <div className="mt-4 rounded-lg bg-muted p-4">
              <p className="text-sm font-medium text-foreground">{i18n.t('tokenHowTo')}</p>
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
