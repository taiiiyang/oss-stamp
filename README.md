# OSS Stamp

> Contributor health metrics on GitHub — a browser extension that injects a Contributor Score card into pull request sidebars.

[简体中文](./README.zh-CN.md) | English

## Features

- **Contributor Score Card** — Displays an overall score and tier (S/A/B/C/D) for PR authors directly in the GitHub sidebar
- **Multi-dimensional Metrics** — Evaluates contribution count, merge rate, code reviews, tenure, and recency
- **Dark Mode** — Follows GitHub's theme automatically
- **Internationalization** — English and Simplified Chinese (via `@wxt-dev/i18n`)

## Tech Stack

| Technology                                                              | Purpose                            |
| ----------------------------------------------------------------------- | ---------------------------------- |
| [WXT](https://wxt.dev)                                                  | Browser extension framework        |
| [React 19](https://react.dev)                                           | UI library                         |
| [Tailwind CSS v4](https://tailwindcss.com)                              | Utility-first styling              |
| [Jotai](https://jotai.org)                                              | Atomic state management            |
| [TanStack Query](https://tanstack.com/query)                            | Async data fetching & caching      |
| [jotai-tanstack-query](https://github.com/jotaijs/jotai-tanstack-query) | Jotai + TanStack Query integration |
| [Radix UI](https://www.radix-ui.com)                                    | Accessible UI primitives           |
| [Lucide React](https://lucide.dev)                                      | Icon library                       |
| TypeScript                                                              | Type safety                        |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 22+
- [pnpm](https://pnpm.io)

### Install

```bash
pnpm install
```

### Development

```bash
# Chrome
pnpm dev

# Firefox
pnpm dev:firefox
```

### Build

```bash
# Chrome
pnpm build

# Firefox
pnpm build:firefox
```

## Scoring Algorithm

The overall score is a weighted sum of five components, each normalized to 0–100:

| Component    | Weight | Description                                     |
| ------------ | ------ | ----------------------------------------------- |
| Contribution | 40%    | Merged PR count (log scale, cap 50)             |
| Merge Rate   | 15%    | Merged PRs / Total PRs                          |
| Review       | 15%    | Reviews given (log scale, cap 30)               |
| Tenure       | 15%    | Time since first contribution (up to 24 months) |
| Recency      | 15%    | Public repos + followers (capped at 100)        |

### Tiers

| Tier | Score Range |
| ---- | ----------- |
| S    | 90–100      |
| A    | 70–89       |
| B    | 50–69       |
| C    | 30–49       |
| D    | 0–29        |

## Browser Support

| Browser | Status    |
| ------- | --------- |
| Chrome  | Supported |
| Firefox | Supported |

## Scripts

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `pnpm dev`           | Start development (Chrome)         |
| `pnpm dev:firefox`   | Start development (Firefox)        |
| `pnpm build`         | Production build (Chrome)          |
| `pnpm build:firefox` | Production build (Firefox)         |
| `pnpm zip`           | Package for distribution (Chrome)  |
| `pnpm zip:firefox`   | Package for distribution (Firefox) |
| `pnpm check`         | TypeScript type checking           |
| `pnpm lint`          | Run ESLint                         |
| `pnpm lint:fix`      | Run ESLint with auto-fix           |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit using [Conventional Commits](https://www.conventionalcommits.org)
4. Push and open a Pull Request

This project uses:

- **[husky](https://typicode.github.io/husky)** — Git hooks
- **[lint-staged](https://github.com/lint-staged/lint-staged)** — Pre-commit linting
- **[commitlint](https://commitlint.js.org)** — Enforces conventional commit messages

## License

MIT
