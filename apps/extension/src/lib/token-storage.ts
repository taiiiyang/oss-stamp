import { storage } from 'wxt/utils/storage'

export const githubTheme = storage.defineItem<'light' | 'dark'>('local:githubTheme', {
  fallback: 'light',
})
