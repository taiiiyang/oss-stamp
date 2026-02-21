import type { Config } from '@/types/config'
import { atom } from 'jotai'
import { selectAtom } from 'jotai/utils'
import { DEFAULT_CONFIG } from '@/types/config'
import { storageAdapter } from '@/utils/storage-adapter'

export const CONFIG_STORAGE_KEY = 'config'

// —— Core atoms ——

export const configAtom = atom<Config>(DEFAULT_CONFIG)

configAtom.onMount = (set) => {
  // Hydrate from storage on first mount
  void storageAdapter.get(CONFIG_STORAGE_KEY, DEFAULT_CONFIG).then(set)

  // Watch for cross-context changes (options page → content script)
  const unwatch = storageAdapter.watch<Config>(CONFIG_STORAGE_KEY, set)

  // Reload when tab reactivates (covers edge cases where watch misses updates)
  const onVisibility = () => {
    if (document.visibilityState === 'visible')
      void storageAdapter.get(CONFIG_STORAGE_KEY, DEFAULT_CONFIG).then(set)
  }
  document.addEventListener('visibilitychange', onVisibility)

  return () => {
    unwatch()
    document.removeEventListener('visibilitychange', onVisibility)
  }
}

// —— Write atom ——

export const writeConfigAtom = atom(null, (get, set, patch: Partial<Config>) => {
  const current = get(configAtom)
  const next = { ...current, ...patch }
  set(configAtom, next)
  void storageAdapter.set(CONFIG_STORAGE_KEY, next)
})

// —— Per-field atoms ——

const potTokenReadAtom = selectAtom(configAtom, c => c.potToken)

export const configFieldsAtomMap = {
  potToken: atom(
    get => get(potTokenReadAtom),
    (_get, set, value: string) => set(writeConfigAtom, { potToken: value }),
  ),
}
