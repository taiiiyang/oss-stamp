import type { ContractRouterClient } from '@orpc/contract'
import type { contract } from '@oss-stamp/contract'
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'

export type { GlobalContribution, RepoContribution } from '@oss-stamp/contract'

// —— Error classes (kept for instanceof checks in components) ——

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = 'GitHubApiError'
  }
}

export class RateLimitError extends GitHubApiError {
  constructor(public resetAt: number) {
    super('Rate limited. Try again later.', 403)
    this.name = 'RateLimitError'
  }
}

// —— oRPC client ——

const link = new RPCLink({
  url: import.meta.env.VITE_API_BASE ?? 'https://oss-stamp.vercel.app/api/rpc',
})

const client: ContractRouterClient<typeof contract> = createORPCClient(link)

// —— Public API (preserving original signatures) ——

export async function fetchRepoContribution(
  owner: string,
  repo: string,
  username: string,
) {
  try {
    return await client.contributor.repo({ owner, repo, username })
  }
  catch (e: any) {
    if (e?.status === 429)
      throw new RateLimitError(Date.now() + 60_000)
    throw new GitHubApiError(e?.message ?? 'API error', e?.status ?? 500)
  }
}

export async function fetchGlobalContribution(username: string) {
  try {
    return await client.contributor.global({ username })
  }
  catch (e: any) {
    if (e?.status === 429)
      throw new RateLimitError(Date.now() + 60_000)
    throw new GitHubApiError(e?.message ?? 'API error', e?.status ?? 500)
  }
}
