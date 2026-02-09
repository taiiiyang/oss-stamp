import { atom } from 'jotai'

export const prAuthorAtom = atom<string | null>(null)
export const currentRepoAtom = atom<{ owner: string, repo: string } | null>(
  null,
)
