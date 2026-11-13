# wl-idp-docs-hub

## Installation

This project uses [pnpm](https://pnpm.io/installation) 12. pnpm downloads the version pinned in the `packageManager` field of [package.json](./package.json) by itself.

## Usage

```bash
pnpm install
pnpm dev
```

## GitHub Actions

[Renovate](./renovate.json) updates the GitHub Actions used by the workflows and merges its updates into `main` without a pull request (`automerge` with `automergeType: "branch"`): it pushes the update to a `renovate/*` branch and, on a later run, fast-forwards `main` to it. Major updates are included on purpose, so the organization's `all-automerge.json` preset, which only covers minor and patch updates, is not used. This depends on two things:

- The [CI](./.github/workflows/ci.yml) workflow builds the documentation website on pushes to `renovate/**`. Renovate never merges a branch that has no passing check, and no other check runs on a `renovate/*` branch: never remove the workflow.
- The `Workleap Renovate` GitHub App can push to `main`: it is a bypass actor of the organization rulesets, and `main` has no repository-level branch protection. Adding one that requires a pull request or an approval stops the auto-merge.

A merge takes at least a day. Renovate runs once a day, merges one branch per run, and only merges a branch that is up to date with `main` and green. A commit on `main` between two runs costs another day.

When a check fails on the branch, or stays pending for a day, Renovate opens a regular pull request instead. That pull request is never auto-merged: a maintainer fixes, approves and merges it.

### Action pins

Every `uses:` is pinned to a commit hash, with the release it matches in a comment:

```yaml
uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
```

Never reference an action by a tag (`@v7`, `@latest`) or a branch. A tag picks up a new release on the next workflow run, which skips the 7-day minimum release age of the organization preset. Keep the version comment: Renovate ignores a hash that has none. Renovate pins an action added with a tag on its next run (`helpers:pinGitHubActionDigestsToSemver`).

The CI on the `renovate/*` branch only exercises `actions/checkout` and `retypeapp/action-build`. An update to `retypeapp/action-github-pages` reaches `main` without having run: the minimum release age is its only guard.

## License

Copyright © 2023, Workleap This code is licensed under the Apache License, Version 2.0. You may obtain a copy of this license at https://github.com/workleap/workleap-license/blob/master/LICENSE.
