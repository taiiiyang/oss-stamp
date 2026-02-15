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

<!-- TODO: uncomment when published -->
<!-- [![Chrome Web Store](https://img.shields.io/chrome-web-store/v/EXTENSION_ID)](https://chrome.google.com/webstore/detail/EXTENSION_ID) -->
<!-- [![Firefox Add-ons](https://img.shields.io/amo/v/oss-stamp)](https://addons.mozilla.org/firefox/addon/oss-stamp) -->

</div>

## Demo

<!-- TODO: add screenshot or GIF at assets/demo.gif showing the score card in a real GitHub PR sidebar -->
<!-- <img src="assets/demo.gif" alt="OSS Stamp demo" width="700" /> -->

> Screenshot coming soon — see [Install](#install) to try it yourself.

## Features

### Contributor Score Card

See a contributor's tier (S/A/B/C/D) and overall score at a glance, right in the GitHub PR sidebar.

### Multi-dimensional Analysis

Evaluates five dimensions: contribution count, merge rate, code reviews, tenure, and community presence.

### Dark Mode

Automatically matches GitHub's light or dark theme — no manual toggle needed.

### Multilingual

Supports English and 简体中文.

## How Scoring Works

Each contributor is scored across five dimensions, normalized to 0–100:

| Dimension     | What it measures                 |
| ------------- | -------------------------------- |
| Contributions | Number of merged pull requests   |
| Merge Rate    | Ratio of merged PRs to total PRs |
| Reviews       | Number of code reviews given     |
| Tenure        | Time since first contribution    |
| Presence      | Public repos and followers       |

Contributions carry the most weight; the other four dimensions contribute equally.

### Tiers

| Tier  | Score  |
| ----- | ------ |
| **S** | 90–100 |
| **A** | 70–89  |
| **B** | 50–69  |
| **C** | 30–49  |
| **D** | 0–29   |

## Install

### From Store

> Coming soon — [star this repo](https://github.com/taiiiyang/oss-stamp) to get notified.

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
