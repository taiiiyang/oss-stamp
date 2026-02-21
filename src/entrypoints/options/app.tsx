import { i18n } from '#i18n'
import { useQuery } from '@tanstack/react-query'
import { useAtom, useSetAtom } from 'jotai'
import { useCallback, useState } from 'react'
import { configFieldsAtomMap, writeConfigAtom } from '@/atoms/config'
import { validateToken } from '@/lib/github-rest'

type SaveStatus = 'idle' | 'validating' | 'invalid'

export function App() {
  const [potToken, setPotToken] = useAtom(configFieldsAtomMap.potToken)
  const writeConfig = useSetAtom(writeConfigAtom)
  const [input, setInput] = useState('')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  const { data: isTokenValid, isLoading: isValidating } = useQuery({
    queryKey: ['validate-token', potToken],
    queryFn: () => validateToken(potToken),
    enabled: !!potToken,
  })

  function getTokenStatus() {
    if (saveStatus !== 'idle')
      return saveStatus
    if (!potToken)
      return 'none'
    if (isValidating)
      return 'validating'
    return isTokenValid ? 'valid' : 'invalid'
  }

  const tokenStatus = getTokenStatus()

  const handleSave = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed)
      return
    setSaveStatus('validating')
    const ok = await validateToken(trimmed)
    if (ok) {
      writeConfig({ potToken: trimmed })
      setSaveStatus('idle')
      setInput('')
    }
    else {
      setSaveStatus('invalid')
    }
  }, [input, writeConfig])

  const handleClear = useCallback(() => {
    setPotToken('')
    setSaveStatus('idle')
    setInput('')
  }, [setPotToken])

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
                disabled={!input.trim() || tokenStatus === 'validating'}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {i18n.t('tokenSave')}
              </button>
            </div>

            {!!potToken && (
              <button
                type="button"
                onClick={handleClear}
                className="mt-2 text-sm text-destructive hover:underline"
              >
                {i18n.t('tokenClear')}
              </button>
            )}

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
              {potToken ? i18n.t('rateLimitAuth') : i18n.t('rateLimitUnauth')}
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
