import type { Config } from '@/types/config'
import { createStore } from 'jotai'
import ReactDOM from 'react-dom/client'
import { CONFIG_STORAGE_KEY } from '@/atoms/config'
import { AppProviders } from '@/providers/app-providers'
import { DEFAULT_CONFIG } from '@/types/config'
import { onNavigate, parsePRFromUrl, setupDarkMode, waitForElement } from '@/utils/github-dom'
import { storageAdapter } from '@/utils/storage-adapter'
import App from './app'

type Ctx = Parameters<typeof createShadowRootUi>[0]

export async function setupStampCard(ctx: Ctx) {
  let currentUi: Awaited<ReturnType<typeof createShadowRootUi>> | null = null

  async function inject() {
    currentUi?.remove()

    const pr = parsePRFromUrl(location.href)
    if (!pr)
      return

    const sidebar = await waitForElement('#partial-discussion-sidebar')
    if (!sidebar)
      return

    const store = createStore()
    const config = await storageAdapter.get<Config>(CONFIG_STORAGE_KEY, DEFAULT_CONFIG)

    currentUi = await createShadowRootUi(ctx, {
      name: 'oss-stamp-score-card',
      position: 'inline',
      anchor: sidebar,
      append: 'first',
      onMount: (container) => {
        setupDarkMode(container)
        const wrapper = document.createElement('div')
        container.append(wrapper)
        const root = ReactDOM.createRoot(wrapper)
        root.render(
          <AppProviders store={store} config={config}>
            <App owner={pr.owner} repo={pr.repo} prNumber={pr.prNumber} />
          </AppProviders>,
        )
        return root
      },
      onRemove: root => root?.unmount(),
    })
    currentUi.mount()
  }

  if (parsePRFromUrl(location.href))
    await inject()

  const cleanup = onNavigate(() => {
    if (parsePRFromUrl(location.href)) {
      void inject()
    }
    else {
      currentUi?.remove()
      currentUi = null
    }
  })

  ctx.onInvalidated(cleanup)
}
