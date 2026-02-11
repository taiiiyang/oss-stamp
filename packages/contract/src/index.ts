import { oc } from '@orpc/contract'
import * as z from 'zod'

// —— Schemas ——

export const RepoContributionSchema = z.object({
  mergedPRs: z.number(),
  totalPRs: z.number(),
  reviewsGiven: z.number(),
  firstContributionAt: z.string().nullable(),
})

export const GlobalContributionSchema = z.object({
  followers: z.number(),
  createdAt: z.string(),
  publicRepos: z.number(),
  globalMergedPRs: z.number(),
})

// —— Inferred types (for extension use) ——

export type RepoContribution = z.infer<typeof RepoContributionSchema>
export type GlobalContribution = z.infer<typeof GlobalContributionSchema>

// —— Contract ——

const usernamePattern = /^[a-zA-Z0-9_-]+$/
const repoNamePattern = /^[a-zA-Z0-9_.-]+$/

export const contract = {
  contributor: {
    repo: oc
      .input(z.object({
        owner: z.string().regex(repoNamePattern),
        repo: z.string().regex(repoNamePattern),
        username: z.string().regex(usernamePattern),
      }))
      .output(RepoContributionSchema),

    global: oc
      .input(z.object({
        username: z.string().regex(usernamePattern),
      }))
      .output(GlobalContributionSchema),
  },
}
