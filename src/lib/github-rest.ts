import { getToken } from './token-storage'

// —— Error classes ——

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

// —— Types ——

export interface RepoContribution {
  mergedPRs: number
  totalPRs: number
  reviewsGiven: number
  firstContributionAt: string | null
}

export interface GlobalContribution {
  globalMergedPRs: number
  followers: number
  createdAt: string
  publicRepos: number
}

// —— Internal helpers ——

async function githubFetch(url: string): Promise<Response> {
  const token = await getToken()
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
  if (token)
    headers.Authorization = `token ${token}`
  const res = await fetch(url, { headers })
  if (res.status === 403 || res.status === 429) {
    const reset = Number(res.headers.get('x-ratelimit-reset')) * 1000
    throw new RateLimitError(reset || Date.now() + 60_000)
  }
  if (!res.ok)
    throw new GitHubApiError(res.statusText, res.status)
  return res
}

async function searchCount(query: string): Promise<number> {
  const res = await githubFetch(
    `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=1`,
  )
  const data = await res.json()
  return data.total_count ?? 0
}

// —— Public API ——

export async function fetchPRAuthor(owner: string, repo: string, prNumber: number): Promise<string> {
  const res = await githubFetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${prNumber}`,
  )
  const data = await res.json()
  return data.user.login
}

export async function fetchRepoContribution(
  owner: string,
  repo: string,
  username: string,
): Promise<RepoContribution> {
  const [mergedPRs, totalPRs, reviewsGiven] = await Promise.all([
    searchCount(`repo:${owner}/${repo} author:${username} is:pr is:merged`),
    searchCount(`repo:${owner}/${repo} author:${username} is:pr`),
    searchCount(`repo:${owner}/${repo} is:pr reviewed-by:${username} -author:${username}`),
  ])

  let firstContributionAt: string | null = null
  if (totalPRs > 0) {
    const res = await githubFetch(
      `https://api.github.com/search/issues?q=${encodeURIComponent(`repo:${owner}/${repo} author:${username} is:pr`)}&sort=created&order=asc&per_page=1`,
    )
    const data = await res.json()
    firstContributionAt = data.items?.[0]?.created_at ?? null
  }

  return { mergedPRs, totalPRs, reviewsGiven, firstContributionAt }
}

export async function fetchGlobalContribution(
  username: string,
): Promise<GlobalContribution> {
  const [userRes, globalMergedPRs] = await Promise.all([
    githubFetch(`https://api.github.com/users/${encodeURIComponent(username)}`),
    searchCount(`author:${username} is:pr is:merged`),
  ])

  const userData = await userRes.json()

  return {
    globalMergedPRs,
    followers: userData.followers ?? 0,
    createdAt: userData.created_at,
    publicRepos: userData.public_repos ?? 0,
  }
}
