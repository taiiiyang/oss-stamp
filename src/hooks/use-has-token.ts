import { useEffect, useState } from 'react'
import { githubToken } from '@/lib/token-storage'

export function useHasToken(): boolean {
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    void githubToken.getValue().then(v => setHasToken(!!v))
    return githubToken.watch(v => setHasToken(!!v))
  }, [])

  return hasToken
}
