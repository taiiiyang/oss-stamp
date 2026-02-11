import { onError } from '@orpc/server'
import { RPCHandler } from '@orpc/server/fetch'
import { CORSPlugin } from '@orpc/server/plugins'
import { router } from '../../lib/router'

const handler = new RPCHandler(router, {
  plugins: [new CORSPlugin()],
  interceptors: [
    onError((error: unknown) => {
      console.error(error)
    }),
  ],
})

export default async function (request: Request) {
  const { matched, response } = await handler.handle(request, {
    prefix: '/api/rpc',
    context: {},
  })

  if (matched) {
    return response
  }

  return new Response('Not found', { status: 404 })
}
