# CI/CD and Changesets Research

## 1. @changesets/cli Setup and Configuration

### Installation and Initialization

```bash
# Install changesets CLI
pnpm add -D @changesets/cli

# Initialize changesets in the repo
pnpm changeset init
```

This creates a `.changeset/` directory with:

- `config.json` - Configuration file
- `README.md` - Documentation about changesets

### Configuration File (`.changeset/config.json`)

```json
{
  "$schema": "https://unpkg.com/@changesets/config@latest/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": [],
  "privatePackages": {
    "version": true,
    "tag": true
  }
}
```

Key config options:

- **changelog**: Generator for changelog entries. `"@changesets/cli/changelog"` is the default; `"@changesets/changelog-github"` adds GitHub PR/author links.
- **commit**: If `true`, `changeset version` and `changeset publish` will commit changes automatically.
- **fixed**: Array of arrays grouping packages that must always share the same version number.
- **linked**: Array of arrays grouping packages whose versions move in lockstep (but can differ initially).
- **access**: `"restricted"` (default) or `"public"` for npm publishing scope.
- **baseBranch**: The branch changesets are compared against (typically `"main"`).
- **privatePackages**: Controls behavior for `"private": true` packages. Set `{ "version": true, "tag": true }` to still version and tag them even though they are not published to npm. This is critical for browser extensions.

### Using Changesets for Non-NPM Projects (Browser Extensions)

Since oss-stamp is a browser extension (not published to npm), the `privatePackages` config is essential:

1. Ensure `package.json` has `"private": true` set.
2. Set `privatePackages: { "version": true, "tag": true }` in `.changeset/config.json`.
3. Changesets will bump versions in `package.json` and generate `CHANGELOG.md` entries.
4. The `changeset publish` step creates git tags but skips npm publishing.
5. A separate GitHub Actions step handles extension store publishing.

---

## 2. Changeset Workflow

### Adding a Changeset

When making a change (feature, bugfix, etc.), contributors run:

```bash
pnpm changeset
# or
pnpm changeset add
```

This interactive prompt asks:

1. Which packages are affected
2. What semver bump type (major, minor, patch)
3. A summary of the changes

This creates a markdown file in `.changeset/` like:

```markdown
---
"oss-stamp": minor
---

Add GitHub contribution heatmap visualization
```

For CI or automated contexts, use `--empty`:

```bash
pnpm changeset add --empty
```

### Versioning

When ready to release, run:

```bash
pnpm changeset version
```

This:

1. Reads all changeset files in `.changeset/`
2. Determines the appropriate version bump (multiple changesets are merged; the highest bump wins)
3. Updates `package.json` version
4. Updates `CHANGELOG.md` with all changeset summaries
5. Deletes consumed changeset files

### Publishing

```bash
pnpm changeset publish
```

For browser extensions, this creates git tags. The actual store publishing is handled separately by `wxt submit`.

---

## 3. GitHub Actions Workflow for Automated Releases

### The `changesets/action` GitHub Action

The official `changesets/action@v1` automates the release workflow:

1. **When changesets exist on `main`**: Creates/updates a "Version Packages" PR that bumps versions and updates changelogs.
2. **When that PR is merged**: Runs the publish command (which for us triggers git tagging + extension store submission).

### Outputs from the Action

- **published**: Boolean indicating whether publishing occurred.
- **publishedPackages**: JSON array of published packages with names and versions.

### Required Permissions

- Enable "Allow GitHub Actions to create and approve pull requests" in repository settings.
- `GITHUB_TOKEN` (automatically available) for PR creation.

---

## 4. WXT Browser Extension Publishing

### `wxt submit` Command

WXT has a built-in `wxt submit` command for automated publishing to browser stores.

```bash
# Initialize submit configuration
wxt submit init

# Submit to all configured stores
wxt submit \
  --chrome-zip .output/<name>-<version>-chrome.zip \
  --firefox-zip .output/<name>-<version>-firefox.zip \
  --firefox-sources-zip .output/<name>-<version>-sources.zip
```

### Supported Stores

| Store                 | Supported | Notes                                  |
| --------------------- | --------- | -------------------------------------- |
| Chrome Web Store      | Yes       | Via Chrome Web Store API               |
| Firefox Add-ons (AMO) | Yes       | Via AMO JWT authentication             |
| Edge Add-ons          | Yes       | Reuses Chrome ZIP                      |
| Safari                | No        | Not supported for automated publishing |

### Building ZIPs

```bash
# Build Chrome ZIP
pnpm zip

# Build Firefox ZIP (includes sources ZIP automatically)
pnpm zip:firefox
```

### Important Notes

- The **first submission** must be done manually. Subsequent updates can be automated.
- When introducing breaking changes (e.g., new permissions), you may need to update store metadata manually.
- Firefox requires source code upload; `wxt zip:firefox` handles this.
- Delete `.env` before running `wxt zip:firefox` or use `zip.includeSources` config to avoid leaking secrets.

---

## 5. Required Secrets for Store Publishing

### Chrome Web Store Secrets

| Secret Name            | Description          | How to Obtain                             |
| ---------------------- | -------------------- | ----------------------------------------- |
| `CHROME_EXTENSION_ID`  | Your extension's ID  | From Chrome Web Store developer dashboard |
| `CHROME_CLIENT_ID`     | OAuth2 client ID     | From Google Cloud Console                 |
| `CHROME_CLIENT_SECRET` | OAuth2 client secret | From Google Cloud Console                 |
| `CHROME_REFRESH_TOKEN` | OAuth2 refresh token | Generated via OAuth flow                  |

Reference: [Chrome Web Store API documentation](https://developer.chrome.com/docs/webstore/using-api/)

### Firefox Add-ons Secrets

| Secret Name            | Description                       | How to Obtain                                                                          |
| ---------------------- | --------------------------------- | -------------------------------------------------------------------------------------- |
| `FIREFOX_EXTENSION_ID` | Your extension's ID               | From AMO developer dashboard                                                           |
| `FIREFOX_JWT_ISSUER`   | API key (format: `user:12345:67`) | From [AMO API Credentials](https://addons.mozilla.org/en-US/developers/addon/api/key/) |
| `FIREFOX_JWT_SECRET`   | API secret (hex string)           | From AMO API Credentials page                                                          |

---

## 6. Recommended GitHub Actions Workflow

### Complete Workflow: Changesets + WXT Publishing

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches:
      - main

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Create Release Pull Request or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          version: pnpm changeset version
          publish: pnpm run release
          commit: 'chore: version packages'
          title: 'chore: version packages'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Separate Submit Workflow (Triggered After Release)

```yaml
# .github/workflows/submit.yml
name: Submit to Stores

on:
  workflow_dispatch:
  # Or trigger on version tag creation:
  # push:
  #   tags:
  #     - 'v*'

jobs:
  submit:
    name: Submit Extension
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build and zip for Chrome
        run: pnpm zip

      - name: Build and zip for Firefox
        run: pnpm zip:firefox

      - name: Submit to stores
        run: pnpm wxt submit --chrome-zip .output/*-chrome.zip --firefox-zip .output/*-firefox.zip --firefox-sources-zip .output/*-sources.zip
        env:
          CHROME_EXTENSION_ID: ${{ secrets.CHROME_EXTENSION_ID }}
          CHROME_CLIENT_ID: ${{ secrets.CHROME_CLIENT_ID }}
          CHROME_CLIENT_SECRET: ${{ secrets.CHROME_CLIENT_SECRET }}
          CHROME_REFRESH_TOKEN: ${{ secrets.CHROME_REFRESH_TOKEN }}
          FIREFOX_EXTENSION_ID: ${{ secrets.FIREFOX_EXTENSION_ID }}
          FIREFOX_JWT_ISSUER: ${{ secrets.FIREFOX_JWT_ISSUER }}
          FIREFOX_JWT_SECRET: ${{ secrets.FIREFOX_JWT_SECRET }}
```

### package.json Scripts

```json
{
  "scripts": {
    "version": "changeset version",
    "release": "changeset publish",
    "zip": "wxt zip",
    "zip:firefox": "wxt zip -b firefox",
    "submit": "wxt submit"
  }
}
```

---

## 7. Recommended Integration Strategy for oss-stamp

### Two-Workflow Approach

1. **Release Workflow** (`release.yml`): Triggered on push to `main`. Uses `changesets/action` to either create a "Version Packages" PR (when changesets are present) or run `changeset publish` (when the version PR is merged). The publish step tags the release in git.

2. **Submit Workflow** (`submit.yml`): Triggered either manually (`workflow_dispatch`) or on version tag push. Builds ZIP artifacts and runs `wxt submit` to publish to Chrome Web Store and Firefox Add-ons.

### Why Two Workflows?

- **Separation of concerns**: Versioning/changelog management is independent from store submission.
- **Manual control**: Store submissions might fail due to review requirements, permission changes, or metadata issues. Having a separate workflow allows re-running submissions.
- **First-time setup**: The first extension submission must be manual. The automated workflow handles subsequent updates.

### Contributor Workflow

1. Developer creates a feature branch and makes changes.
2. Developer runs `pnpm changeset` to create a changeset file describing the change.
3. Developer opens a PR. The changeset file is included in the PR.
4. PR is reviewed and merged to `main`.
5. The release workflow detects changesets and creates/updates a "Version Packages" PR.
6. When maintainer merges the "Version Packages" PR, the release workflow bumps versions, updates CHANGELOG.md, and creates a git tag.
7. The submit workflow is triggered (manually or via tag) to publish to browser stores.

---

## Sources

- [Changesets GitHub Repository](https://github.com/changesets/changesets)
- [Changesets Action](https://github.com/changesets/action)
- [Changesets: Automating Changesets Docs](https://github.com/changesets/changesets/blob/main/docs/automating-changesets.md)
- [Changesets: Versioning Apps Docs](https://github.com/changesets/changesets/blob/main/docs/versioning-apps.md)
- [WXT Publishing Guide](https://wxt.dev/guide/essentials/publishing.html)
- [Chrome Extension Publishing with GitHub Actions (Jam.dev)](https://jam.dev/blog/automating-chrome-extension-publishing/)
- [Simplify Browser Extension Deployment (DEV Community)](https://dev.to/jellyfith/simplify-browser-extension-deployment-with-github-actions-37ob)
- [Auto Publish NPM with Changesets (DEV Community)](https://dev.to/wdsebastian/simplest-way-to-publish-and-automate-npm-packages-d0c)
- [Changesets for Automated Changelog (Medium)](https://chanonroy.medium.com/setting-up-changesets-for-automated-changelog-management-and-releases-with-github-actions-50722f0575c9)
