<div align="center">

<!-- TODO: add banner image at assets/banner.png (logo + tagline) -->
<!-- <img src="assets/banner.png" alt="OSS Stamp" width="600" /> -->

# OSS Stamp

**Contributor health metrics on GitHub**

A browser extension that shows contributor score cards in pull request sidebars.

[简体中文](./README.zh-CN.md) | English

[![GitHub Stars](https://img.shields.io/github/stars/taiiiyang/oss-stamp?style=flat)](https://github.com/taiiiyang/oss-stamp)
[![License](https://img.shields.io/github/license/taiiiyang/oss-stamp)](./LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/taiiiyang/oss-stamp)](https://github.com/taiiiyang/oss-stamp/commits/main)

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/dhhibeifipigpbkihogkolbhkcecjgfp)](https://chromewebstore.google.com/detail/oss-stamp/dhhibeifipigpbkihogkolbhkcecjgfp)

<!-- TODO: uncomment when published -->
<!-- [![Firefox Add-ons](https://img.shields.io/amo/v/oss-stamp)](https://addons.mozilla.org/firefox/addon/oss-stamp) -->

</div>

## Demo

<!-- TODO: add screenshot or GIF at assets/demo.gif showing the score card in a real GitHub PR sidebar -->
<!-- <img src="assets/demo.gif" alt="OSS Stamp demo" width="700" /> -->

> Screenshot coming soon — see [Install](#install) to try it yourself.

## Features

### Contributor Score Card

See a contributor's tier (S/A/B/C/D) and overall score at a glance, right in the GitHub PR sidebar.

### Dual Scoring System

Two independent scores — **Repo Trust Score** (context-specific) and **Profile Score** (global profile) — each rated 0–100 across four dimensions.

### Dark Mode

Automatically matches GitHub's light or dark theme — no manual toggle needed.

### Multilingual

Supports English and 简体中文.

## How Scoring Works

OSS Stamp computes two independent scores, each 0–100 with four dimensions.

### Repo Trust Score

Measures the contributor's relationship with the **current repository**.

> **Special case:** The repository owner always receives **S / 100**.

| Dimension          | Max | Factors                                                                               |
| ------------------ | --- | ------------------------------------------------------------------------------------- |
| Repo Familiarity   | 35  | Merged PRs (0–12), reviews given (0–8), active duration (0–10), contributor flag (+5) |
| Community Standing | 25  | Account age (0–5), followers (0–10), org membership (+10)                             |
| OSS Influence      | 20  | Top repo stars (0–15), total stars (0–5)                                              |
| PR Track Record    | 20  | Merge rate bands: <50% → 5, 50–74% → 10, 75–89% → 15, ≥90% → 20 (no PRs → 5)          |

### Profile Score

Measures the contributor's **global GitHub profile**, independent of any specific repo.

| Dimension          | Max | Factors                                                                                                |
| ------------------ | --- | ------------------------------------------------------------------------------------------------------ |
| Community Presence | 25  | Account age (0–5), followers via log scale (0–12), follower/following ratio (0–4), has bio (+4)        |
| OSS Impact         | 25  | Top repo stars via log scale (0–10), total stars via log scale (0–10), total forks via log scale (0–5) |
| Activity           | 30  | Yearly contributions via log scale (0–18), public repos via log scale (0–12)                           |
| Ecosystem          | 20  | Org memberships (0–12), language diversity (0–8)                                                       |

### Tiers

Both scores share the same tier thresholds:

| Tier  | Score  |
| ----- | ------ |
| **S** | 90–100 |
| **A** | 70–89  |
| **B** | 50–69  |
| **C** | 30–49  |
| **D** | 0–29   |

### Log Scale

Several Profile Score factors use a logarithmic scale (`logScale(value, ref, max)`) to prevent extreme values from dominating. The `ref` parameter is the reference value that maps to ~70% of the maximum points. For example, `logScale(followers, 200, 12)` means 200 followers ≈ 8.4 points out of 12.

## Install

### From Store

- **Chrome**: [Install from Chrome Web Store](https://chromewebstore.google.com/detail/oss-stamp/dhhibeifipigpbkihogkolbhkcecjgfp)

### From Source

```bash
git clone https://github.com/taiiiyang/oss-stamp.git
cd oss-stamp
pnpm install && pnpm build
```

Then load the unpacked extension:

- **Chrome**: go to `chrome://extensions` → enable Developer mode → Load unpacked → select `.output/chrome-mv3`
- **Firefox**: go to `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → select any file in `.output/firefox-mv2`

## Browser Support

| Browser | Status    |
| ------- | --------- |
| Chrome  | Supported |
| Firefox | Supported |

<details>
<summary><strong>Development</strong></summary>

### Prerequisites

- [Node.js](https://nodejs.org) 22+
- [pnpm](https://pnpm.io)

### Commands

```bash
# Install dependencies
pnpm install

# Start dev server (Chrome)
pnpm dev

# Start dev server (Firefox)
pnpm dev:firefox

# Production build (Chrome)
pnpm build

# Production build (Firefox)
pnpm build:firefox
```

</details>

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit using [Conventional Commits](https://www.conventionalcommits.org)
4. Push and open a Pull Request

See [Development](#development) for setup instructions.

## License

[MIT](./LICENSE)
