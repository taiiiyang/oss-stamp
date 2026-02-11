import process from 'node:process'
import { createAppAuth } from '@octokit/auth-app'
import { request as octokitRequest } from '@octokit/request'

const auth = createAppAuth({
  appId: process.env.GITHUB_APP_ID!,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
  installationId: Number(process.env.GITHUB_APP_INSTALLATION_ID),
})

export async function getAuthedRequest() {
  const { token } = await auth({ type: 'installation' })
  return octokitRequest.defaults({
    headers: { authorization: `token ${token}` },
  })
}

export async function searchCount(
  req: typeof octokitRequest,
  query: string,
): Promise<number> {
  const res = await req('GET /search/issues', {
    q: query,
    per_page: 1,
  })
  return res.data.total_count ?? 0
}
