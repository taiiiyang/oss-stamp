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

interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message: string, type?: string }>
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

async function githubGraphQL<T>(query: string, variables: Record<string, string>, token: string): Promise<T> {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  })
  if (res.status === 403 || res.status === 429) {
    const reset = Number(res.headers.get('x-ratelimit-reset')) * 1000
    throw new RateLimitError(reset || Date.now() + 60_000)
  }
  if (!res.ok)
    throw new GitHubApiError(res.statusText, res.status)
  const json: GraphQLResponse<T> = await res.json()
  if (json.errors?.length)
    throw new GitHubApiError(json.errors[0].message, 422)
  return json.data!
}

async function searchIssues(query: string, token: string, sort?: string, order?: string): Promise<{ total_count: number, items: Array<{ created_at?: string }> }> {
  let url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=1`
  if (sort)
    url += `&sort=${sort}`
  if (order)
    url += `&order=${order}`
  const res = await githubFetch(url, token)
  return res.json()
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

// —— GraphQL queries ——

const REPO_CONTRIBUTION_QUERY = `
query RepoContribution($merged: String!, $total: String!, $reviews: String!) {
  merged: search(query: $merged, type: ISSUE, first: 1) { issueCount }
  total: search(query: $total, type: ISSUE, first: 1) {
    issueCount
    edges { node { ... on PullRequest { createdAt } } }
  }
  reviews: search(query: $reviews, type: ISSUE, first: 1) { issueCount }
}
`

interface RepoContributionGQL {
  merged: { issueCount: number }
  total: { issueCount: number, edges: Array<{ node: { createdAt?: string } }> }
  reviews: { issueCount: number }
}

const GLOBAL_CONTRIBUTION_QUERY = `
query GlobalContribution($username: String!, $merged: String!, $total: String!, $reviews: String!) {
  user(login: $username) {
    followers { totalCount }
    createdAt
    repositories(privacy: PUBLIC) { totalCount }
  }
  merged: search(query: $merged, type: ISSUE, first: 1) { issueCount }
  total: search(query: $total, type: ISSUE, first: 1) { issueCount }
  reviews: search(query: $reviews, type: ISSUE, first: 1) { issueCount }
}
`

interface GlobalContributionGQL {
  user: {
    followers: { totalCount: number }
    createdAt: string
    repositories: { totalCount: number }
  }
  merged: { issueCount: number }
  total: { issueCount: number }
  reviews: { issueCount: number }
}

// —— Fetch functions ——

export async function fetchRepoContribution(
  owner: string,
  repo: string,
  username: string,
  token: string,
): Promise<RepoContribution> {
  // With token: use GraphQL (1 request instead of 3-4 REST Search requests)
  if (token) {
    const repoSlug = `${owner}/${repo}`
    const data = await githubGraphQL<RepoContributionGQL>(REPO_CONTRIBUTION_QUERY, {
      merged: `repo:${repoSlug} author:${username} is:pr is:merged`,
      total: `repo:${repoSlug} author:${username} is:pr sort:created-asc`,
      reviews: `repo:${repoSlug} is:pr reviewed-by:${username} -author:${username}`,
    }, token)

    const firstContributionAt = data.total.edges[0]?.node?.createdAt ?? null

    return {
      mergedPRs: data.merged.issueCount,
      totalPRs: data.total.issueCount,
      reviewsGiven: data.reviews.issueCount,
      firstContributionAt,
    }
  }

  // Without token: REST fallback (merge totalPRs + firstContributionAt into 1 call)
  const repoSlug = `${owner}/${repo}`
  const [mergedData, totalData, reviewsData] = await Promise.all([
    searchIssues(`repo:${repoSlug} author:${username} is:pr is:merged`, token),
    searchIssues(`repo:${repoSlug} author:${username} is:pr`, token, 'created', 'asc'),
    searchIssues(`repo:${repoSlug} is:pr reviewed-by:${username} -author:${username}`, token),
  ])

  return {
    mergedPRs: mergedData.total_count ?? 0,
    totalPRs: totalData.total_count ?? 0,
    reviewsGiven: reviewsData.total_count ?? 0,
    firstContributionAt: totalData.items?.[0]?.created_at ?? null,
  }
}

export async function fetchGlobalContribution(
  username: string,
  token: string,
): Promise<GlobalContribution> {
  // With token: use GraphQL (1 request instead of 3 REST Search + 1 REST user)
  if (token) {
    const data = await githubGraphQL<GlobalContributionGQL>(GLOBAL_CONTRIBUTION_QUERY, {
      username,
      merged: `author:${username} is:pr is:merged`,
      total: `author:${username} is:pr`,
      reviews: `is:pr reviewed-by:${username} -author:${username}`,
    }, token)

    return {
      globalMergedPRs: data.merged.issueCount,
      globalTotalPRs: data.total.issueCount,
      globalReviewsGiven: data.reviews.issueCount,
      followers: data.user.followers.totalCount,
      createdAt: data.user.createdAt,
      publicRepos: data.user.repositories.totalCount,
    }
  }

  // Without token: REST fallback
  const [userRes, mergedData, totalData, reviewsData] = await Promise.all([
    githubFetch(`https://api.github.com/users/${encodeURIComponent(username)}`, token),
    searchIssues(`author:${username} is:pr is:merged`, token),
    searchIssues(`author:${username} is:pr`, token),
    searchIssues(`is:pr reviewed-by:${username} -author:${username}`, token),
  ])

  const userData = await userRes.json()

  return {
    globalMergedPRs: mergedData.total_count ?? 0,
    globalTotalPRs: totalData.total_count ?? 0,
    globalReviewsGiven: reviewsData.total_count ?? 0,
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
