import { storage } from 'wxt/utils/storage'

export const githubToken = storage.defineItem<string>('local:githubPat', {
  fallback: '',
})

export const githubTheme = storage.defineItem<'light' | 'dark'>('local:githubTheme', {
  fallback: 'light',
})
