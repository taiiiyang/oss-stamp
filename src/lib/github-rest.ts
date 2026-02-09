export interface RepoContribution {
  mergedPRs: number
  totalPRs: number
  reviewsGiven: number
  firstContributionAt: string | null
}

export interface GlobalContribution {
  followers: number
  createdAt: string
  publicRepos: number
  globalMergedPRs: number
}

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

async function githubFetch(url: string): Promise<Response> {
  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  })

  if (res.status === 403 || res.status === 429) {
    const reset = res.headers.get('x-ratelimit-reset')
    throw new RateLimitError(reset ? Number(reset) * 1000 : Date.now() + 60000)
  }

  if (!res.ok) {
    throw new GitHubApiError(`GitHub API error: ${res.statusText}`, res.status)
  }

  return res
}

async function searchCount(query: string): Promise<number> {
  const res = await githubFetch(
    `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=1`,
  )
  const data = await res.json()
  return data.total_count ?? 0
}

export async function fetchRepoContribution(
  owner: string,
  repo: string,
  username: string,
): Promise<RepoContribution> {
  const [mergedPRs, totalPRs, reviewsGiven] = await Promise.all([
    searchCount(`repo:${owner}/${repo} author:${username} is:pr is:merged`),
    searchCount(`repo:${owner}/${repo} author:${username} is:pr`),
    searchCount(
      `repo:${owner}/${repo} is:pr reviewed-by:${username} -author:${username}`,
    ),
  ])

  let firstContributionAt: string | null = null
  if (totalPRs > 0) {
    const res = await githubFetch(
      `https://api.github.com/search/issues?q=${encodeURIComponent(
        `repo:${owner}/${repo} author:${username} is:pr`,
      )}&sort=created&order=asc&per_page=1`,
    )
    const data = await res.json()
    if (data.items?.[0]?.created_at) {
      firstContributionAt = data.items[0].created_at
    }
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

  const user = await userRes.json()

  return {
    globalMergedPRs,
    followers: user.followers ?? 0,
    createdAt: user.created_at,
    publicRepos: user.public_repos ?? 0,
  }
}
