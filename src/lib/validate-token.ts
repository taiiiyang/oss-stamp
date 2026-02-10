export interface TokenValidation {
  login: string
  rateLimit: number
}

export async function validateToken(token: string): Promise<TokenValidation> {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error('Invalid token')
  }

  const user = await res.json()
  const rateLimit = Number(res.headers.get('x-ratelimit-limit')) || 5000

  return { login: user.login, rateLimit }
}
