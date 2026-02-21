import type { createStore } from 'jotai'
import type { Config } from '@/types/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'jotai'
import { queryClientAtom } from 'jotai-tanstack-query'
import { useHydrateAtoms } from 'jotai/react/utils'
import { configAtom } from '@/atoms/config'
import { DEFAULT_CONFIG } from '@/types/config'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 60 * 1000,
      gcTime: 2 * 60 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function HydrateAtoms({ children, config }: { children: React.ReactNode, config: Config }) {
  useHydrateAtoms([[queryClientAtom, queryClient], [configAtom, config]])
  return children
}

export function AppProviders({
  children,
  store,
  config = DEFAULT_CONFIG,
}: {
  children: React.ReactNode
  store?: ReturnType<typeof createStore>
  config?: Config
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <HydrateAtoms config={config}>{children}</HydrateAtoms>
      </Provider>
    </QueryClientProvider>
  )
}
