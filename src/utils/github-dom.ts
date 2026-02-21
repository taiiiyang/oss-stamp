import { githubTheme } from '@/lib/theme-storage'

/**
 * Wait for a DOM element matching `selector` to appear.
 * Resolves immediately if already present; otherwise uses MutationObserver.
 * Returns `null` if the element does not appear within `timeout` ms.
 */
export function waitForElement(selector: string, timeout = 5000): Promise<Element | null> {
  const el = document.querySelector(selector)
  if (el)
    return Promise.resolve(el)

  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      const found = document.querySelector(selector)
      if (found) {
        observer.disconnect()
        resolve(found)
      }
    })
    observer.observe(document.documentElement, { childList: true, subtree: true })
    setTimeout(() => {
      observer.disconnect()
      resolve(null)
    }, timeout)
  })
}

/**
 * Parse owner and repo from a GitHub URL.
 * Matches: https://github.com/{owner}/{repo}/...
 */
export function parseRepoFromUrl(url: string): { owner: string, repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
  if (!match)
    return null
  return { owner: match[1], repo: match[2] }
}

/**
 * Parse owner, repo, and PR number from a GitHub PR URL.
 * Returns null if the URL is not a PR page.
 */
export function parsePRFromUrl(url: string): { owner: string, repo: string, prNumber: number } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/)
  if (!match)
    return null
  return { owner: match[1], repo: match[2], prNumber: Number(match[3]) }
}

/**
 * Detect GitHub SPA navigations via URL change detection.
 *
 * GitHub is migrating pages from Turbo Drive to React rendering,
 * so Turbo events alone are unreliable. Instead we combine multiple
 * signals and deduplicate with `lastUrl`:
 *
 * - `turbo:render` — immediate response for pages still using Turbo Drive
 * - `popstate` — browser back/forward navigation
 * - `setInterval` polling — catches `pushState` navigations from React pages
 *   that fire no DOM events (content script isolated world cannot monkey-patch
 *   `history.pushState`); 200ms is imperceptible with negligible overhead
 *
 * Returns a cleanup function that removes all listeners and stops polling.
 */
export function onNavigate(callback: () => void): () => void {
  let lastUrl = location.href

  const check = () => {
    if (location.href !== lastUrl) {
      lastUrl = location.href
      callback()
    }
  }

  // Event-driven triggers (respond immediately when available)
  document.addEventListener('turbo:render', check)
  window.addEventListener('popstate', check)

  // Polling fallback — catches pushState navigations that fire no events
  const timer = setInterval(check, 200)

  return () => {
    document.removeEventListener('turbo:render', check)
    window.removeEventListener('popstate', check)
    clearInterval(timer)
  }
}

/**
 * Set up dark mode synchronization between GitHub host page and Shadow DOM container.
 * Reads GitHub's data-color-mode attribute and toggles .dark class on the container.
 * Also persists the theme to storage so the popup can follow the same theme.
 */
export function setupDarkMode(container: HTMLElement): MutationObserver {
  const sync = () => {
    const mode = document.documentElement.getAttribute('data-color-mode')
    const isDark = mode === 'dark'
    container.classList.toggle('dark', isDark)
    void githubTheme.setValue(isDark ? 'dark' : 'light')
  }
  sync()

  const observer = new MutationObserver(sync)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-color-mode'],
  })

  return observer
}
