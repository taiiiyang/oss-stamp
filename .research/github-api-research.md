# GitHub API Research for PR Contribution Data

## Overview

This document covers how to use the GitHub API (primarily GraphQL) to fetch PR contribution data for a given author in a specific repository. The goal is to power a contributor "rating score" stamp.

---

## 1. API Choice: GraphQL vs REST

**Recommendation: Use GraphQL API (`https://api.github.com/graphql`)**

| Factor                 | REST API                               | GraphQL API                                |
| ---------------------- | -------------------------------------- | ------------------------------------------ |
| PR filtering by author | Requires Search API (`/search/issues`) | Native `search` query with qualifiers      |
| Data efficiency        | Multiple requests for related data     | Single request for all needed fields       |
| Rate limit             | 5,000 requests/hour                    | 5,000 points/hour (queries cost 1+ points) |
| Per-minute limit       | 900 points/min                         | 2,000 points/min                           |
| Pagination             | Link headers                           | Cursor-based with `pageInfo`               |
| Review data            | Separate endpoint                      | Nested in same query                       |

GraphQL is preferred because we can fetch PR count, review data, and first contribution date in a single query or a small number of queries.

---

## 2. Core GraphQL Queries

### 2.1 Merged PR Count by Author in a Repo

```graphql
query MergedPRCount($queryString: String!) {
  search(query: $queryString, type: ISSUE, first: 1) {
    issueCount
  }
}
```

**Variables:**

```json
{
  "queryString": "repo:owner/repo is:pr is:merged author:username"
}
```

- `issueCount` returns the total number of matching PRs without fetching all nodes.
- Cost: ~1 point (minimal because we only request `issueCount`).

### 2.2 Total PRs (All States) by Author

```graphql
query TotalPRs($merged: String!, $open: String!, $closed: String!) {
  merged: search(query: $merged, type: ISSUE, first: 1) {
    issueCount
  }
  open: search(query: $open, type: ISSUE, first: 1) {
    issueCount
  }
  closed: search(query: $closed, type: ISSUE, first: 1) {
    issueCount
  }
}
```

**Variables:**

```json
{
  "merged": "repo:owner/repo is:pr is:merged author:username",
  "open": "repo:owner/repo is:pr is:open author:username",
  "closed": "repo:owner/repo is:pr is:unmerged is:closed author:username"
}
```

This batches three searches into one query. Cost: ~3 points total (one per search alias).

### 2.3 First Contribution Date

```graphql
query FirstContribution($queryString: String!) {
  search(query: $queryString, type: ISSUE, first: 1) {
    issueCount
    nodes {
      ... on PullRequest {
        createdAt
        number
        title
      }
    }
  }
}
```

**Variables:**

```json
{
  "queryString": "repo:owner/repo is:pr author:username sort:created-asc"
}
```

The first result (sorted ascending by creation date) gives us the author's first PR in the repo.

### 2.4 Review Activity (Reviews Given by User in a Repo)

There is no direct `search` qualifier for "reviews given by user in repo." The approach is:

**Option A: Search for PRs reviewed by the user**

```graphql
query ReviewsGiven($queryString: String!) {
  search(query: $queryString, type: ISSUE, first: 1) {
    issueCount
  }
}
```

**Variables:**

```json
{
  "queryString": "repo:owner/repo is:pr reviewed-by:username"
}
```

This gives the count of PRs the user has reviewed in the repo.

**Option B: Get review details on a specific PR**

```graphql
query PRReviews($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      reviews(first: 100) {
        totalCount
        nodes {
          author { login }
          state
          createdAt
        }
      }
    }
  }
}
```

### 2.5 Combined Efficient Query (Recommended)

This single query fetches most of what we need in one round trip:

```graphql
query ContributorStats(
  $mergedQuery: String!,
  $openQuery: String!,
  $closedQuery: String!,
  $firstPRQuery: String!,
  $reviewsQuery: String!
) {
  merged: search(query: $mergedQuery, type: ISSUE, first: 1) {
    issueCount
  }
  open: search(query: $openQuery, type: ISSUE, first: 1) {
    issueCount
  }
  closed: search(query: $closedQuery, type: ISSUE, first: 1) {
    issueCount
  }
  firstPR: search(query: $firstPRQuery, type: ISSUE, first: 1) {
    issueCount
    nodes {
      ... on PullRequest {
        createdAt
      }
    }
  }
  reviewedPRs: search(query: $reviewsQuery, type: ISSUE, first: 1) {
    issueCount
  }
}
```

**Variables:**

```json
{
  "mergedQuery": "repo:owner/repo is:pr is:merged author:username",
  "openQuery": "repo:owner/repo is:pr is:open author:username",
  "closedQuery": "repo:owner/repo is:pr is:unmerged is:closed author:username",
  "firstPRQuery": "repo:owner/repo is:pr author:username sort:created-asc",
  "reviewsQuery": "repo:owner/repo is:pr reviewed-by:username -author:username"
}
```

Estimated cost: ~5 points per call. With 5,000 points/hour, this allows ~1,000 lookups per hour.

### 2.6 Contribution Frequency (Recent Activity)

To gauge how active a contributor is recently, use date-scoped searches:

```graphql
query RecentActivity(
  $last30days: String!,
  $last90days: String!,
  $lastYear: String!
) {
  last30: search(query: $last30days, type: ISSUE, first: 1) {
    issueCount
  }
  last90: search(query: $last90days, type: ISSUE, first: 1) {
    issueCount
  }
  lastYear: search(query: $lastYear, type: ISSUE, first: 1) {
    issueCount
  }
}
```

**Variables (dynamically computed):**

```json
{
  "last30days": "repo:owner/repo is:pr is:merged author:username merged:>=2025-01-10",
  "last90days": "repo:owner/repo is:pr is:merged author:username merged:>=2024-11-10",
  "lastYear": "repo:owner/repo is:pr is:merged author:username merged:>=2024-02-09"
}
```

---

## 3. Authentication Requirements

### Personal Access Token (PAT)

- **Required**: Yes. The GraphQL API requires authentication for all requests.
- **Minimum scope**: `public_repo` (for public repositories) or `repo` (for private repositories).
- **For contribution data**: `read:user` scope needed if querying `contributionsCollection`.
- **Header**: `Authorization: bearer <token>`

### Unauthenticated Access

- **Not supported** for GraphQL API. All GraphQL requests require a token.
- REST API allows unauthenticated requests but with a much lower rate limit (60 requests/hour vs 5,000).

### Server-Side Usage

For a stamp service, use a **GitHub App installation token** or a **server-side PAT** with minimal scopes. A GitHub App is preferred for production because:

- Higher rate limits (5,000 per installation)
- Granular permissions
- No user account dependency

---

## 4. Rate Limiting Considerations

### Primary Rate Limit

- **5,000 points/hour** per authenticated user/app installation
- Each `search` alias in a query costs approximately 1 point
- The combined query (Section 2.5) costs ~5 points
- **Capacity**: ~1,000 contributor lookups per hour with the combined query

### Secondary Rate Limits

- **2,000 points/minute** for GraphQL
- **100 concurrent requests** maximum
- **90 seconds CPU time** per 60 seconds real time

### Checking Rate Limit Status

```graphql
query {
  rateLimit {
    limit
    cost
    remaining
    resetAt
  }
}
```

Add this to any query to monitor usage.

### Best Practices

1. **Cache aggressively** -- contribution data changes infrequently
2. **Batch queries** -- use GraphQL aliases to combine multiple searches
3. **Implement exponential backoff** when hitting limits
4. **Use conditional requests** where possible
5. **Spread requests** with throttling (avoid bursts)

---

## 5. Search API Limitations

- **1,000 result cap**: The `search` endpoint returns a maximum of 1,000 results. For `issueCount`, this is not a problem -- the count is accurate even beyond 1,000. But if you need to paginate through individual PR nodes, you cannot retrieve more than 1,000.
- **Workaround**: For repos where an author has >1,000 PRs (very rare), use date-range partitioning to split queries.

---

## 6. Proposed Rating Score Formula

### Input Metrics

| Metric                                | Variable      | Source                  |
| ------------------------------------- | ------------- | ----------------------- |
| Merged PRs                            | `mergedPRs`   | search `is:merged`      |
| Total PRs                             | `totalPRs`    | merged + open + closed  |
| Merge rate                            | `mergeRate`   | mergedPRs / totalPRs    |
| PRs reviewed (for others)             | `reviewCount` | search `reviewed-by:`   |
| Days since first PR                   | `tenureDays`  | now - firstPR.createdAt |
| Recent activity (PRs in last 90 days) | `recentPRs`   | date-scoped search      |

### Scoring Formula (0-100 scale)

```
score = (
  contributionScore * 0.40 +
  mergeRateScore * 0.15 +
  reviewScore * 0.15 +
  tenureScore * 0.15 +
  recencyScore * 0.15
)
```

#### Component Calculations

**Contribution Score (40% weight)** -- based on merged PR count:

```
contributionScore = min(100, mergedPRs * scaleFactor)
```

Where `scaleFactor` depends on repo size:

- Small repos (<100 total PRs): `scaleFactor = 20` (5 merged PRs = 100)
- Medium repos (100-1000 PRs): `scaleFactor = 5` (20 merged PRs = 100)
- Large repos (>1000 PRs): `scaleFactor = 2` (50 merged PRs = 100)

**Merge Rate Score (15% weight)**:

```
mergeRateScore = mergeRate * 100
```

(Only calculated if totalPRs >= 3 to avoid noise; default to 50 otherwise)

**Review Score (15% weight)**:

```
reviewScore = min(100, reviewCount * 10)
```

(10 reviews = max score)

**Tenure Score (15% weight)**:

```
tenureScore = min(100, tenureDays / 3.65)
```

(365 days = max score)

**Recency Score (15% weight)**:

```
recencyScore = min(100, recentPRs * 25)
```

(4 PRs in last 90 days = max score)

### Rating Tiers

| Score Range | Label              | Badge Color |
| ----------- | ------------------ | ----------- |
| 80-100      | Core Contributor   | Gold        |
| 60-79       | Active Contributor | Silver      |
| 40-59       | Contributor        | Bronze      |
| 20-39       | Newcomer           | Blue        |
| 0-19        | First-timer        | Gray        |

---

## 7. Data Caching Strategy

### Cache Layers

1. **In-Memory Cache (L1)**: For hot data during a request lifecycle
2. **Redis/KV Store (L2)**: For cross-request caching with TTL

### TTL Strategy

| Data Type               | TTL        | Reason                           |
| ----------------------- | ---------- | -------------------------------- |
| Merged PR count         | 1 hour     | Changes only when PRs are merged |
| Open/Closed PR count    | 15 minutes | Changes more frequently          |
| First contribution date | 24 hours   | Never changes once set           |
| Review count            | 1 hour     | Changes infrequently             |
| Computed score          | 1 hour     | Derived from cached data         |

### Cache Key Pattern

```
stamp:contributor:{owner}/{repo}:{username}
```

### Cache Invalidation

- **Time-based**: Use TTLs above
- **Webhook-based (advanced)**: Listen for `pull_request` and `pull_request_review` webhook events to invalidate specific cache entries
- **On-demand**: Allow users to request a fresh score calculation

### Storage Estimate

- Each cached entry: ~500 bytes (JSON with all metrics + computed score)
- 10,000 unique contributor lookups: ~5 MB
- Well within free-tier limits of most KV stores

---

## 8. Implementation Notes

### Error Handling

- Handle `RATE_LIMITED` errors with exponential backoff
- Handle `NOT_FOUND` for invalid usernames/repos gracefully
- Handle timeout errors (GitHub deducts extra rate limit points for timeouts)

### Edge Cases

- **Bot accounts**: Filter out known bots (e.g., `dependabot`, `renovate`)
- **Renamed users**: GitHub handles redirects, but cache keys should use current login
- **Organization-owned forks**: PRs from forks show up in the upstream repo's search
- **First-time contributors**: All scores will be low; present this positively ("First-timer" badge)

### API Request Flow

1. Check cache for `stamp:contributor:{owner}/{repo}:{username}`
2. If cache miss or expired, run the Combined Efficient Query (Section 2.5)
3. Optionally run the Recent Activity Query (Section 2.6)
4. Compute score using the formula
5. Cache the result
6. Return the stamp/badge

---

## Sources

- [GitHub GraphQL API Queries Reference](https://docs.github.com/en/graphql/reference/queries)
- [GitHub GraphQL API Objects Reference](https://docs.github.com/en/graphql/reference/objects)
- [GitHub REST API - Pull Requests](https://docs.github.com/en/rest/pulls/pulls)
- [GitHub GraphQL Rate Limits](https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api)
- [GitHub Search API for PRs (Gist)](https://gist.github.com/MichaelCurrin/f8a7a11451ce4ec055d41000c915b595)
- [GitHub GraphQL Snippets (Gist)](https://gist.github.com/StevenACoffman/ffcc754f7f84a69efcb84442eca302e0)
- [Searching >1000 PRs with GraphQL](https://herve.bzh/github-graphql-api-search-for-more-than-1000-pull-requests/)
- [Fetching GitHub Contribution Stats](https://ramos.je/blog/fetching-github-stats)
- [GitHub Contribution Graph Data](https://medium.com/@yuichkun/how-to-retrieve-contribution-graph-data-from-the-github-api-dc3a151b4af)
