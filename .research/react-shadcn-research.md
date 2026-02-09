# React 19 + shadcn/ui Research Summary

## 1. React 19 Key Patterns and Features

### 1.1 Actions

React 19 introduces **Actions** -- functions that manage sending data from the client to the server. Actions can be added directly to elements like `<form/>` via the `action` prop, replacing the traditional `onSubmit` handler pattern.

```jsx
<form action={submitAction}>
  <input name="name" />
  <button type="submit">Submit</button>
</form>
```

Actions are async by default and integrate with React's transition system, meaning React manages pending states, errors, and optimistic updates automatically.

### 1.2 `useActionState`

`useActionState` manages form submission state and provides a pending indicator. It wraps an async action function and returns the current state, a bound action, and a pending boolean.

**Signature:** `const [state, formAction, isPending] = useActionState(action, initialState)`

```jsx
import { useActionState } from 'react'

function AddToCartForm({ itemID, itemTitle }) {
  const [message, formAction, isPending] = useActionState(addToCart, null)
  return (
    <form action={formAction}>
      <h2>{itemTitle}</h2>
      <input type="hidden" name="itemID" value={itemID} />
      <button type="submit">Add to Cart</button>
      {isPending ? 'Loading...' : message}
    </form>
  )
}
```

The action receives `(previousState, formData)` and returns the next state. This replaces many uses of `useState` + manual async handling.

### 1.3 `useFormStatus`

`useFormStatus` reads the status of the parent `<form>` from within a child component. It must be called from a component that is rendered inside a `<form>`.

```jsx
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button disabled={pending} type="submit">
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  )
}
```

### 1.4 `useOptimistic`

`useOptimistic` enables optimistic UI updates -- immediately rendering a provisional state while an async mutation is in progress. React automatically reverts if the mutation fails.

```jsx
import { useOptimistic } from 'react'

function ChangeName({ currentName, onUpdateName }) {
  const [optimisticName, setOptimisticName] = useOptimistic(currentName)

  const submitAction = async (formData) => {
    const newName = formData.get('name')
    setOptimisticName(newName) // Immediately show new name
    const updatedName = await updateName(newName)
    onUpdateName(updatedName)
  }

  return (
    <form action={submitAction}>
      <p>
        Your name is:
        {optimisticName}
      </p>
      <input type="text" name="name" disabled={currentName !== optimisticName} />
    </form>
  )
}
```

### 1.5 `use` API

React 19 introduces the `use` API for reading resources (Promises, Context) during render. Unlike hooks, `use` can be called conditionally.

```jsx
import { use } from 'react'

function Comments({ commentsPromise }) {
  const comments = use(commentsPromise)
  return comments.map(c => <p key={c.id}>{c.text}</p>)
}
```

### 1.6 Summary of React 19 Patterns for This Project

For a browser extension popup/widget, the most relevant React 19 patterns are:

- **Standard hooks** (`useState`, `useEffect`, `useMemo`) for local state management
- **`use`** for reading async data (e.g., fetched contribution stats)
- **`useOptimistic`** if we ever need optimistic UI updates
- Server components and Actions are primarily for full-stack React (Next.js etc.) and are **not directly applicable** to a browser extension context

---

## 2. shadcn/ui Overview

shadcn/ui is **not a traditional component library** installed as a dependency. Instead, it is a collection of copy-paste components that you add directly into your project source code. This means:

- Full ownership and customization of component code
- No version lock-in or breaking updates from upstream
- Components are built on **Radix UI** primitives (accessible, unstyled) + **Tailwind CSS** styling
- TypeScript support out of the box

### 2.1 Installation and Setup (Vite + React)

#### Step 1: Create Vite Project

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
```

#### Step 2: Install Tailwind CSS v4 with Vite Plugin

```bash
npm install tailwindcss @tailwindcss/vite
```

#### Step 3: Configure Vite

```typescript
// vite.config.ts
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

#### Step 4: Configure tsconfig paths

```json
// tsconfig.json (or tsconfig.app.json)
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### Step 5: Set Up Global CSS

Replace `src/index.css` contents with:

```css
@import 'tailwindcss';
```

#### Step 6: Initialize shadcn/ui

```bash
npx shadcn@latest init
```

Interactive prompts will ask for:

- Style (Default / New York)
- Base color (Slate, Neutral, Zinc, etc.)
- CSS variables preference
- Import aliases

This creates a `components.json` configuration file:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

**Important for browser extensions:** Set `"rsc": false` since React Server Components are not used.

---

## 3. Tailwind CSS v4 Integration

Tailwind CSS v4 changes significantly from v3:

- **No `tailwind.config.js` file needed** -- configuration is done via CSS
- Uses `@import "tailwindcss"` instead of `@tailwind` directives
- Vite plugin (`@tailwindcss/vite`) replaces PostCSS plugin
- CSS-first configuration using `@theme` directive

```css
@import 'tailwindcss';

@theme {
  --color-brand: #3b82f6;
  --radius-lg: 0.5rem;
}
```

shadcn/ui works with Tailwind CSS v4 by using CSS variables for theming. The `cssVariables: true` option in `components.json` ensures components use CSS custom properties that integrate with Tailwind v4's `@theme` system.

---

## 4. Key shadcn/ui Components for This Project

### 4.1 Badge

Install: `npx shadcn@latest add badge`

The Badge component displays a small status indicator. Ideal for showing contribution level, score labels, etc.

```tsx
import { Badge } from "@/components/ui/badge";

// Variants: default, secondary, destructive, outline
<Badge variant="default">Contributor</Badge>
<Badge variant="secondary">5 PRs</Badge>
<Badge variant="outline">Active</Badge>
```

Badges support custom styling via `className` and can be extended with custom variants.

### 4.2 Card

Install: `npx shadcn@latest add card`

The Card component provides a structured container with header, content, and footer sections.

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Contributor Stats</CardTitle>
    <CardDescription>GitHub contribution summary</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Total PRs: 42</p>
    <p>Issues: 15</p>
  </CardContent>
  <CardFooter>
    <p>Last active: 2 days ago</p>
  </CardFooter>
</Card>
```

### 4.3 Tooltip

Install: `npx shadcn@latest add tooltip`

Tooltips display informational text when hovering over an element. Requires `TooltipProvider` to be wrapped around the app or component tree.

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>
      <p>Detailed information here</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### 4.4 Popover

Install: `npx shadcn@latest add popover`

Popovers display rich content in a floating panel, triggered by click. Useful for showing detailed contribution breakdowns.

```tsx
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">View Details</Button>
  </PopoverTrigger>
  <PopoverContent className="w-80" align="start">
    <div className="space-y-2">
      <h4 className="font-medium">Contribution Details</h4>
      <p className="text-sm text-muted-foreground">
        PRs merged: 12, Issues closed: 8
      </p>
    </div>
  </PopoverContent>
</Popover>
```

The `align` prop controls horizontal alignment: `"start"`, `"center"`, or `"end"`.

### 4.5 Other Useful Components

| Component | Install Command                   | Use Case                            |
| --------- | --------------------------------- | ----------------------------------- |
| Avatar    | `npx shadcn@latest add avatar`    | Display user profile images         |
| Progress  | `npx shadcn@latest add progress`  | Show contribution progress bars     |
| Separator | `npx shadcn@latest add separator` | Visual dividers between sections    |
| Skeleton  | `npx shadcn@latest add skeleton`  | Loading placeholders                |
| Tabs      | `npx shadcn@latest add tabs`      | Switch between different data views |

---

## 5. Best Practices for Small UI Widgets (Browser Extensions)

### 5.1 Bundle Size Considerations

- shadcn/ui components are tree-shakeable since they are source code in your project
- Only add the components you actually use
- Radix UI primitives are individually installable (each component is a separate package)
- Use `lucide-react` icons selectively (import individual icons, not the entire library)

### 5.2 Popup Sizing

Browser extension popups have limited viewport:

- Default max width is typically 400px (can be set via CSS on `body`/`html`)
- Default max height is ~600px
- Design for compact layouts; use Popovers/Tooltips to reveal details on demand
- Keep the primary view simple (badge + score), expand with interaction

### 5.3 CSS and Styling

- Use Tailwind CSS utility classes for compact, scoped styling
- CSS variables from shadcn/ui theme integrate well with extension contexts
- Prefix Tailwind classes if needed to avoid conflicts with page styles (for content scripts):
  ```json
  // components.json
  "tailwind": {
    "prefix": "oss-"
  }
  ```
- For popup-only UI (not injected into pages), prefixing is usually unnecessary

### 5.4 Component Architecture for Extension Popup

Recommended structure:

```
src/
  components/
    ui/          # shadcn/ui components (auto-generated)
      badge.tsx
      card.tsx
      popover.tsx
      tooltip.tsx
    stamp/       # Custom project components
      StampBadge.tsx      # Main badge display
      StampPopover.tsx    # Detailed view popover
      ContributorCard.tsx # Full contributor info card
  lib/
    utils.ts     # shadcn/ui cn() utility
  hooks/
    useContributorData.ts  # Data fetching hook
```

### 5.5 Theming

shadcn/ui uses CSS variables for theming, making it easy to support light/dark modes:

```css
@import 'tailwindcss';

:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  /* ... more variables */
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... dark mode overrides */
}
```

For a browser extension, you can detect the user's system preference with `prefers-color-scheme` or provide a manual toggle.

---

## 6. Key Takeaways for oss-stamp

1. **React 19** is the target version. Use standard hooks for state management; server-specific features (Actions, Server Components) are not applicable to browser extensions.
2. **shadcn/ui** provides accessible, customizable components with zero runtime dependency overhead -- ideal for a browser extension where bundle size matters.
3. **Tailwind CSS v4** simplifies setup (no config file needed) and integrates via the Vite plugin.
4. **Badge + Popover** is the ideal component pattern for the stamp widget: a small badge that expands into a detailed popover on click.
5. **Card** is useful for the detailed contribution view inside the popover.
6. **Tooltip** is good for quick hover hints on individual stats.
7. Use `"rsc": false` in shadcn/ui config since this is a client-only extension.
8. Consider Tailwind prefix for content script scenarios to avoid CSS conflicts with host pages.
