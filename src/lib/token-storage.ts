import { storage } from 'wxt/utils/storage'

export const githubTheme = storage.defineItem<'light' | 'dark'>('local:githubTheme', {
  fallback: 'light',
})

export const githubToken = storage.defineItem<string>('local:githubToken', {
  fallback: '',
})

export async function getToken(): Promise<string | null> {
  const token = await githubToken.getValue()
  return token || null
}

export async function setToken(token: string): Promise<void> {
  await githubToken.setValue(token)
}

export async function clearToken(): Promise<void> {
  await githubToken.removeValue()
}

export async function validateToken(token: string): Promise<boolean> {
  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `token ${token}` },
  })
  return res.ok
}
