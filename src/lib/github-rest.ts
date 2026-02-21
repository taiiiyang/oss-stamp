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
  globalTotalPRs: number
  globalReviewsGiven: number
  followers: number
  createdAt: string
  publicRepos: number
}

// —— Internal helpers ——

async function githubFetch(url: string, token: string): Promise<Response> {
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

async function searchCount(query: string, token: string): Promise<number> {
  const res = await githubFetch(
    `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=1`,
    token,
  )
  const data = await res.json()
  return data.total_count ?? 0
}

// —— Public API ——

export async function fetchPRAuthor(owner: string, repo: string, prNumber: number, token: string): Promise<string> {
  const res = await githubFetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${prNumber}`,
    token,
  )
  const data = await res.json()
  return data.user.login
}

export async function fetchRepoContribution(
  owner: string,
  repo: string,
  username: string,
  token: string,
): Promise<RepoContribution> {
  const [mergedPRs, totalPRs, reviewsGiven] = await Promise.all([
    searchCount(`repo:${owner}/${repo} author:${username} is:pr is:merged`, token),
    searchCount(`repo:${owner}/${repo} author:${username} is:pr`, token),
    searchCount(`repo:${owner}/${repo} is:pr reviewed-by:${username} -author:${username}`, token),
  ])

  let firstContributionAt: string | null = null
  if (totalPRs > 0) {
    const res = await githubFetch(
      `https://api.github.com/search/issues?q=${encodeURIComponent(`repo:${owner}/${repo} author:${username} is:pr`)}&sort=created&order=asc&per_page=1`,
      token,
    )
    const data = await res.json()
    firstContributionAt = data.items?.[0]?.created_at ?? null
  }

  return { mergedPRs, totalPRs, reviewsGiven, firstContributionAt }
}

export async function fetchGlobalContribution(
  username: string,
  token: string,
): Promise<GlobalContribution> {
  const [userRes, globalMergedPRs, globalTotalPRs, globalReviewsGiven] = await Promise.all([
    githubFetch(`https://api.github.com/users/${encodeURIComponent(username)}`, token),
    searchCount(`author:${username} is:pr is:merged`, token),
    searchCount(`author:${username} is:pr`, token),
    searchCount(`is:pr reviewed-by:${username} -author:${username}`, token),
  ])

  const userData = await userRes.json()

  return {
    globalMergedPRs,
    globalTotalPRs,
    globalReviewsGiven,
    followers: userData.followers ?? 0,
    createdAt: userData.created_at,
    publicRepos: userData.public_repos ?? 0,
  }
}

export async function validateToken(token: string): Promise<boolean> {
  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `token ${token}` },
  })
  return res.ok
}
