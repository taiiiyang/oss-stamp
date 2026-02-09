# WXT Browser Extension Framework - Research Summary

## Overview

WXT is a next-gen web extension framework built on top of Vite. It provides file-based entrypoints, automatic manifest generation, HMR during development, TypeScript-first support, and automated publishing for Chrome, Firefox, Edge, and Safari. It is framework-agnostic and supports React, Vue, Svelte, and Solid via official modules.

Sources:

- https://wxt.dev/
- https://wxt.dev/guide/installation
- https://wxt.dev/guide/essentials/content-scripts
- https://wxt.dev/guide/essentials/project-structure
- https://wxt.dev/guide/essentials/config/manifest
- https://wxt.dev/guide/essentials/publishing

---

## 1. Project Initialization (React + TypeScript)

### Scaffold with CLI

```bash
npx wxt@latest init <project-name>
# or
pnpm dlx wxt@latest init <project-name>
```

The CLI is interactive and prompts for template selection. Choose **React** and your preferred package manager (pnpm recommended).

### Install React Module

The `@wxt-dev/module-react` package enables React usage in HTML pages and content scripts. Configure in `wxt.config.ts`:

```typescript
// wxt.config.ts
import { defineConfig } from 'wxt'

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
})
```

### Available Templates

- Vanilla (TypeScript)
- Vue
- React
- Svelte
- Solid

All templates use TypeScript by default.

---

## 2. Project Structure and Conventions

### Default Directory Layout

```
{rootDir}/
  .output/          # Build artifacts
  .wxt/             # Generated TS config / types
  assets/           # CSS, images, processed by Vite
  components/       # Auto-imported UI components
  entrypoints/      # Bundled extension entry points (core convention)
  hooks/            # Auto-imported React hooks
  modules/          # Local WXT Modules
  public/           # Unprocessed static files (copied as-is)
  utils/            # Auto-imported utility functions
  .env              # Environment variables
  package.json
  tsconfig.json
  wxt.config.ts     # Main WXT configuration
  web-ext.config.ts # Optional web-ext runner config
```

### Optional `src/` Directory Organization

For larger projects, consolidate source code under `src/`:

```typescript
// wxt.config.ts
export default defineConfig({
  srcDir: 'src',
})
```

This moves `assets/`, `components/`, `entrypoints/`, `hooks/`, `utils/` into `src/`.

### Directory Customization

```typescript
export default defineConfig({
  srcDir: 'src', // default: "."
  modulesDir: 'wxt-modules', // default: "modules"
  outDir: 'dist', // default: ".output"
  publicDir: 'static', // default: "public"
  entrypointsDir: 'entries', // default: "entrypoints" (relative to srcDir)
})
```

### Entrypoint Types

WXT uses file-based routing in the `entrypoints/` directory. Files automatically map to manifest.json entries:

| File                               | Manifest Entry              |
| ---------------------------------- | --------------------------- |
| `popup.html` or `popup/index.html` | `action.default_popup`      |
| `background.ts`                    | `background.service_worker` |
| `content.ts` or `*.content.ts`     | `content_scripts`           |
| `options.html`                     | `options_ui.page`           |
| `sidepanel.html`                   | Side panel entrypoint       |

---

## 3. Content Scripts

### Defining a Content Script

Content scripts are defined using `defineContentScript()` with a `matches` array for URL patterns:

```typescript
// entrypoints/example.content.ts
export default defineContentScript({
  matches: ['<all_urls>'],
  // or specific patterns: ['*://*.github.com/*']
  main(ctx) {
    console.log('Content script loaded')
  },
})
```

### File Naming Convention

- Single file: `entrypoints/overlay.content.ts`
- Directory (for multi-file content scripts with components): `entrypoints/overlay.content/index.ts`

### URL Match Patterns

Standard Chrome match patterns are supported:

- `<all_urls>` - all URLs
- `*://*.example.com/*` - all pages on example.com
- `https://github.com/*` - only HTTPS GitHub pages
- `*://*.github.com/*/pull/*` - GitHub pull request pages

### Context and Lifecycle

The `main` function receives a `ctx` (context) object that tracks invalidation status:

```typescript
main(ctx) {
  // Wrapped utilities that auto-cleanup on invalidation
  ctx.addEventListener(window, 'scroll', handler);
  ctx.setTimeout(callback, 1000);
  ctx.setInterval(callback, 5000);

  // Check validity
  if (ctx.isValid) { /* still active */ }
  if (ctx.isInvalid) { /* extension was unloaded */ }
}
```

This prevents "Extension context invalidated" errors when the extension is updated/uninstalled.

### SPA Navigation Handling

Content scripts only run on full page loads. For single-page apps, listen for `wxt:locationchange`:

```typescript
window.addEventListener('wxt:locationchange', ({ detail }) => {
  const { newUrl, oldUrl } = detail
  // React to SPA navigation
})
```

---

## 4. UI Injection Methods

### Option A: createShadowRootUi (Recommended for style isolation)

Creates a Shadow DOM to isolate extension UI styles from the host page. This is the recommended approach for injecting React components.

```typescript
// entrypoints/stamp-overlay.content/index.tsx
import './style.css';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

export default defineContentScript({
  matches: ['*://*.github.com/*'],
  cssInjectionMode: 'ui',  // Required for shadow root CSS

  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: 'oss-stamp',           // Custom element name
      position: 'inline',          // 'inline' | 'overlay' | 'modal'
      anchor: 'body',              // CSS selector or Element
      onMount: (container) => {
        const app = document.createElement('div');
        container.append(app);
        const root = ReactDOM.createRoot(app);
        root.render(<App />);
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    ui.mount();
  },
});
```

**Key options for `createShadowRootUi`:**

- `name`: Custom element tag name (required)
- `position`: `'inline'` (in document flow), `'overlay'` (fixed position), `'modal'` (modal overlay)
- `anchor`: CSS selector string or DOM Element to mount near
- `append`: How to append relative to anchor (`'first'`, `'last'`, `'before'`, `'after'`, or a custom function)
- `mode`: Shadow DOM mode (`'open'` or `'closed'`), defaults to `'open'`
- `onMount`: Called when UI is mounted, receives the shadow root container
- `onRemove`: Called when UI is removed, for cleanup

**CSS Injection:** When `cssInjectionMode: 'ui'` is set, imported CSS is injected into the shadow root rather than the page head, keeping styles isolated.

### Option B: createIntegratedUi (No style isolation)

Injects directly into the page DOM. Simpler but styles can conflict with the host page:

```typescript
// entrypoints/example-ui.content/index.tsx
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

export default defineContentScript({
  matches: ['<all_urls>'],

  main(ctx) {
    const ui = createIntegratedUi(ctx, {
      position: 'inline',
      anchor: 'body',
      onMount: (container) => {
        const root = ReactDOM.createRoot(container);
        root.render(<App />);
        return root;
      },
      onRemove: (root) => {
        root.unmount();
      },
    });

    ui.mount();
  },
});
```

### Option C: createIframeUi (Full isolation)

Hosts content in a separate iframe. Supports HMR. Requires HTML page in `web_accessible_resources`.

### Auto-mounting for Dynamic Elements

Use `ui.autoMount()` instead of `ui.mount()` to observe anchor elements appearing/disappearing dynamically (useful for SPAs):

```typescript
ui.autoMount(ctx)
```

---

## 5. Manifest and Permissions Configuration

### wxt.config.ts Manifest Configuration

WXT auto-generates `manifest.json` from your project structure. Additional properties are configured in `wxt.config.ts`:

```typescript
export default defineConfig({
  manifest: {
    name: 'OSS Stamp',
    description: 'Verify open source project health on GitHub',
    permissions: ['storage', 'tabs'],
    host_permissions: ['*://*.github.com/*'],
  },
})
```

### Dynamic Manifest

The manifest can be a function for conditional configuration:

```typescript
export default defineConfig({
  manifest: ({ browser, manifestVersion, mode, command }) => ({
    name: mode === 'development' ? '[DEV] OSS Stamp' : 'OSS Stamp',
    permissions: ['storage'],
    host_permissions: ['*://*.github.com/*'],
  }),
})
```

### Auto-added Permissions

WXT automatically adds during development:

- `tabs` and `scripting` permissions (for HMR/hot reload)
- `sidepanel` permission (if a sidepanel entrypoint exists)

These are NOT included in production builds unless explicitly configured.

---

## 6. Build Configuration and Output

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "wxt",
    "dev:firefox": "wxt -b firefox",
    "build": "wxt build",
    "build:firefox": "wxt build -b firefox",
    "zip": "wxt zip",
    "zip:firefox": "wxt zip -b firefox",
    "postinstall": "wxt prepare"
  }
}
```

### Build Commands

| Command                | Purpose                                           |
| ---------------------- | ------------------------------------------------- |
| `wxt` / `wxt dev`      | Dev mode with HMR (Chrome default)                |
| `wxt -b firefox`       | Dev mode for Firefox                              |
| `wxt build`            | Production build for Chrome                       |
| `wxt build -b firefox` | Production build for Firefox                      |
| `wxt zip`              | Build + zip for Chrome Web Store                  |
| `wxt zip -b firefox`   | Build + zip for Firefox Add-ons (includes source) |
| `wxt zip -b edge`      | Build + zip for Edge Add-ons                      |
| `wxt submit`           | Automated store submission                        |
| `wxt submit init`      | Set up submission credentials                     |

### Build Output

Default output directory: `.output/`

- `.output/chrome-mv3/` - Chrome Manifest V3 build
- `.output/firefox-mv3/` - Firefox build

### Multi-Browser Support

WXT supports Chrome, Firefox, Edge, and Safari (Safari requires manual native app wrapping).

### Publishing Workflow (CI/CD)

Example GitHub Actions workflow:

```yaml
- run: pnpm zip
- run: pnpm zip:firefox
- run: pnpm wxt submit
  env:
    CHROME_EXTENSION_ID: ${{ secrets.CHROME_EXTENSION_ID }}
    CHROME_CLIENT_ID: ${{ secrets.CHROME_CLIENT_ID }}
    CHROME_CLIENT_SECRET: ${{ secrets.CHROME_CLIENT_SECRET }}
    CHROME_REFRESH_TOKEN: ${{ secrets.CHROME_REFRESH_TOKEN }}
    FIREFOX_EXTENSION_ID: ${{ secrets.FIREFOX_EXTENSION_ID }}
    FIREFOX_JWT_ISSUER: ${{ secrets.FIREFOX_JWT_ISSUER }}
    FIREFOX_JWT_SECRET: ${{ secrets.FIREFOX_JWT_SECRET }}
```

### Firefox-specific Considerations

Firefox requires source code alongside the extension during review. WXT automatically handles this by zipping both compiled extension and source files. Config files, tests, and excluded entrypoints are automatically excluded from the source zip.

**Important:** `.env` files can affect chunk hashes and cause build inconsistencies. Either delete `.env` before zipping or include it in sources (be cautious about secrets).

---

## 7. Key Takeaways for OSS Stamp Project

1. **Use `createShadowRootUi`** for injecting the stamp overlay on GitHub pages - provides style isolation from GitHub's CSS.

2. **Content script with specific matches** like `*://*.github.com/*` to target only GitHub pages.

3. **Directory-based content script** (`entrypoints/stamp.content/index.tsx`) allows organizing the React component, styles, and logic together.

4. **`cssInjectionMode: 'ui'`** ensures CSS is injected into the shadow root, not the page.

5. **`ui.autoMount(ctx)`** is useful if the target anchor element may not exist immediately (GitHub is a partial SPA).

6. **Listen for `wxt:locationchange`** to detect GitHub's SPA navigation and re-mount/update the stamp UI.

7. **`@wxt-dev/module-react`** module is required for React support.

8. **Auto-generated manifest** means we only need to configure permissions and host_permissions in `wxt.config.ts`.

9. **Build produces browser-specific output** with `wxt zip` for store submission.
