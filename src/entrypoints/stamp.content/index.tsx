import { createStore } from 'jotai'
import ReactDOM from 'react-dom/client'
import { currentRepoAtom, prAuthorAtom } from '@/atoms/pr-page'
import { ScoreCard } from '@/components/stamp/ScoreCard'
import { AppProviders } from '@/providers/AppProviders'
import {
  getPRAuthor,
  isPRPage,
  parseRepoFromUrl,
  setupDarkMode,
} from '@/utils/github-dom'
import './style.css'

export default defineContentScript({
  matches: ['*://*.github.com/*/pull/*'],
  cssInjectionMode: 'ui',

  async main(ctx) {
    let currentUi: Awaited<ReturnType<typeof createShadowRootUi>> | null
      = null

    async function inject() {
      currentUi?.remove()

      const sidebar = document.querySelector('#partial-discussion-sidebar')
      const repo = parseRepoFromUrl(location.href)
      const author = getPRAuthor()
      if (!sidebar || !repo || !author)
        return

      const store = createStore()
      store.set(prAuthorAtom, author)
      store.set(currentRepoAtom, { owner: repo.owner, repo: repo.repo })

      currentUi = await createShadowRootUi(ctx, {
        name: 'oss-stamp-score-card',
        position: 'inline',
        anchor: sidebar,
        append: 'first',
        onMount: (container) => {
          setupDarkMode(container)
          const app = document.createElement('div')
          container.append(app)
          const root = ReactDOM.createRoot(app)
          root.render(
            <AppProviders store={store}>
              <ScoreCard />
            </AppProviders>,
          )
          return root
        },
        onRemove: (root) => {
          root?.unmount()
        },
      })
      currentUi.mount()
    }

    await inject()

    ctx.addEventListener(window, 'wxt:locationchange', () => {
      if (isPRPage(location.href)) {
        void inject()
      }
      else {
        currentUi?.remove()
      }
    })
  },
})
