---
name: create-pr
description: Create a GitHub pull request for the current branch in this repository. Use when the user asks to create, open, draft, or prepare a PR, especially after code changes are complete.
---

# Create PR

Use this skill when the user wants Codex to prepare or create a pull request for the current work.

## Inputs

Optional user-provided inputs:

- Issue number to close or reference
- Base branch override
- PR title override
- PR body override
- Draft vs ready-for-review preference

If the user does not provide them, infer from the current branch, commit history, and diff.

## Workflow

1. Inspect repo state with `git status --short --branch`, `git branch --show-current`, `git log`, and `git diff main...HEAD`.
2. If on `main` with uncommitted or unpushed work, create a feature branch before proceeding. Name it from the change intent using the repository's conventional prefixes such as `feat/`, `fix/`, `docs/`, `style/`, or `chore/`.
3. Review whether a changeset is needed.
   If the diff changes shipped code, dependencies, or user-facing behavior and there is no matching new `.changeset/*.md` file, add one before creating the PR.
4. Ensure the branch is ready for PR creation.
   Stage and commit any remaining tracked changes with a conventional commit message that matches the final PR title.
5. Push the branch if it does not yet exist on `origin`.
6. Read `.github/PULL_REQUEST_TEMPLATE.md` and prepare the PR body from that template.
7. Create the PR with `gh pr create`.
   Use a conventional title in the format `type(scope): description` when possible.
8. Return the PR URL and summarize the final title, base branch, head branch, and whether a changeset was added.

## Repository Rules

- This repository uses conventional commit types from `commitlint.config.js`:
  `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`, `i18n`, `ai`
- Prefer `main` as the default PR base branch unless the user specifies otherwise.
- Use `.github/PULL_REQUEST_TEMPLATE.md` as the source of truth for PR sections and checklist items.
- There is no repository `CLAUDE.md` file here; do not block on it.

## Notes

- If `gh` authentication is missing or push/create fails, stop and tell the user exactly which command failed.
- If the user asks only for PR copy, stop before `gh pr create` and return the proposed title/body instead.
