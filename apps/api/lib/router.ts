import { implement } from '@orpc/server'
import { contract } from '@oss-stamp/contract'
import { getAuthedRequest, searchCount } from './github'

const os = implement(contract)

const repoContribution = os.contributor.repo
  .handler(async ({ input }) => {
    const req = await getAuthedRequest()
    const { owner, repo, username } = input

    const [mergedPRs, totalPRs, reviewsGiven] = await Promise.all([
      searchCount(req, `repo:${owner}/${repo} author:${username} is:pr is:merged`),
      searchCount(req, `repo:${owner}/${repo} author:${username} is:pr`),
      searchCount(req, `repo:${owner}/${repo} is:pr reviewed-by:${username} -author:${username}`),
    ])

    let firstContributionAt: string | null = null
    if (totalPRs > 0) {
      const res = await req('GET /search/issues', {
        q: `repo:${owner}/${repo} author:${username} is:pr`,
        sort: 'created',
        order: 'asc',
        per_page: 1,
      })
      firstContributionAt = res.data.items?.[0]?.created_at ?? null
    }

    return { mergedPRs, totalPRs, reviewsGiven, firstContributionAt }
  })

const globalContribution = os.contributor.global
  .handler(async ({ input }) => {
    const req = await getAuthedRequest()
    const { username } = input

    const [userRes, globalMergedPRs] = await Promise.all([
      req('GET /users/{username}', { username }),
      searchCount(req, `author:${username} is:pr is:merged`),
    ])

    return {
      globalMergedPRs,
      followers: userRes.data.followers ?? 0,
      createdAt: userRes.data.created_at,
      publicRepos: userRes.data.public_repos ?? 0,
    }
  })

export const router = os.router({
  contributor: { repo: repoContribution, global: globalContribution },
})
