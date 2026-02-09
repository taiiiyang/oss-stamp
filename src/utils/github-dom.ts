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
 * Get the PR author username from the current page DOM.
 * Tries multiple selectors for robustness.
 */
export function getPRAuthor(): string | null {
  // Primary: the author link in the PR header
  const authorEl
    = document.querySelector('.gh-header-meta .author')
      ?? document.querySelector('a.author[data-hovercard-type="user"]')
      ?? document.querySelector('.pull-discussion-timeline .author')

  return authorEl?.textContent?.trim() ?? null
}

/**
 * Check if the current URL is a GitHub PR page.
 * Matches: /{owner}/{repo}/pull/{number}
 */
export function isPRPage(url: string): boolean {
  return /github\.com\/[^/]+\/[^/]+\/pull\/\d+/.test(url)
}

/**
 * Set up dark mode synchronization between GitHub host page and Shadow DOM container.
 * Reads GitHub's data-color-mode attribute and toggles .dark class on the container.
 */
export function setupDarkMode(container: HTMLElement): MutationObserver {
  const sync = () => {
    const mode = document.documentElement.getAttribute('data-color-mode')
    container.classList.toggle('dark', mode === 'dark')
  }
  sync()

  const observer = new MutationObserver(sync)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-color-mode'],
  })

  return observer
}
