import { i18n } from '#i18n'
import { useEffect, useState } from 'react'
import { githubToken } from '@/lib/token-storage'
import { validateToken } from '@/lib/validate-token'

type Status
  = | { type: 'idle' }
    | { type: 'validating' }
    | { type: 'saved', login: string, rateLimit: number }
    | { type: 'error' }

export function App() {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<Status>({ type: 'idle' })
  const [hasSaved, setHasSaved] = useState(false)

  useEffect(() => {
    void githubToken.getValue().then((token) => {
      if (token) {
        setHasSaved(true)
        validateToken(token)
          .then(({ login, rateLimit }) =>
            setStatus({ type: 'saved', login, rateLimit }),
          )
          .catch(() => setStatus({ type: 'idle' }))
      }
    })
  }, [])

  async function handleSave() {
    const token = input.trim()
    if (!token)
      return

    setStatus({ type: 'validating' })
    try {
      const { login, rateLimit } = await validateToken(token)
      await githubToken.setValue(token)
      setHasSaved(true)
      setInput('')
      setStatus({ type: 'saved', login, rateLimit })
    }
    catch {
      setStatus({ type: 'error' })
    }
  }

  async function handleRemove() {
    await githubToken.setValue('')
    setHasSaved(false)
    setInput('')
    setStatus({ type: 'idle' })
  }

  const isValidating = status.type === 'validating'

  return (
    <div className="w-80 p-4">
      <h2 className="text-base font-semibold text-foreground" style={{ textWrap: 'balance' }}>
        {i18n.t('popupTitle')}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {i18n.t('popupDescription')}
      </p>

      <div className="mt-3">
        <label htmlFor="token-input" className="sr-only">
          {i18n.t('popupTitle')}
        </label>
        <input
          id="token-input"
          type="password"
          name="github-token"
          autoComplete="off"
          spellCheck={false}
          placeholder={i18n.t('popupTokenPlaceholder')}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          disabled={isValidating}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        />
      </div>

      <div aria-live="polite" className="mt-2 min-h-5 text-sm">
        {status.type === 'validating' && (
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <Spinner />
            {i18n.t('popupValidating')}
          </p>
        )}
        {status.type === 'saved' && (
          <p className="text-success">
            {i18n.t('popupSuccess', [status.login, String(status.rateLimit)])}
          </p>
        )}
        {status.type === 'error' && (
          <p className="text-destructive">{i18n.t('popupError')}</p>
        )}
        {status.type === 'idle' && !hasSaved && (
          <p className="text-muted-foreground">{i18n.t('popupNoToken')}</p>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isValidating || !input.trim()}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {isValidating ? i18n.t('popupValidating') : i18n.t('popupSave')}
        </button>
        {hasSaved && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isValidating}
            className="rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            {i18n.t('popupRemove')}
          </button>
        )}
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 animate-spin motion-reduce:animate-none"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="10" opacity={0.25} />
      <path d="M12 2a10 10 0 0 1 10 10" opacity={0.75} />
    </svg>
  )
}
