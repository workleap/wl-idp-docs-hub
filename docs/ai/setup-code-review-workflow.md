---
order: 190
label: Setup code review workflow
---

# Setup a code review workflow

Review agents can be extended with additional capabilities to better understand your tools, frameworks, and internal libraries. This guide explains how to create a [GitHub Action](https://github.com/features/actions) that uses [Claude Code](https://code.claude.com/) and [agent skills](https://agentskills.io/home) to automate code reviews.

>:icon-mark-github: For a complete example of this workflow, refer to the [Squide repository](https://github.com/workleap/wl-squide/blob/main/.github/workflows/code-review.yml) on GitHub.

## Install the agent skills

First, install directly in your project the [recommended frontend code review extensions](./setup-agent-extensions.md#code-review-extensions) that match your project's technology stack.

## Create the prompt file

Then, create a `.github/prompts/code-review.md` file with the following content, and adjust the list of agent skills to match your project's technology stack:

````md .github/prompts/code-review.md
# Code Review

You are an automated code reviewer for this repository. Analyze the PR diff for bugs, security vulnerabilities, and code quality problems.

## Rules

- Only report definite issues introduced by this change (not pre-existing ones).
- Every reported issue must include a clear fix, with the file path and line number.
- Skip style preferences, minor nitpicks, and issues typically caught by linters.
- Do not include positive feedback; focus only on problems.

## Severity

- **Critical** — data loss or security breach.
- **High** — incorrect behavior.
- **Medium** — conditional issues.
- **Low** — minor issues or typos.

## Agent skills

When performing code reviews, load and use the following agent skills available in the `.agents/skills/` folder.

### Apply based on file name (changed lines only)

- Source files (`*.ts`, `*.tsx`, `*.js`, `*.jsx`, excluding test files) -> `/accessibility`, `/best-practices`
- React files (`*.tsx`, `*.jsx`, excluding test files) -> `/workleap-react-best-practices`
- Test files (`*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`) -> `/vitest`
- `turbo.json` -> `/turborepo`
- `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.npmrc` -> `/pnpm`

### Apply based on imports (changed lines only)

- Files importing `@workleap/logging` -> `/workleap-logging`
- Files importing `@workleap/telemetry` -> `/workleap-telemetry`
- Files importing `@workleap/browserslist-config`, `@workleap/eslint-configs`, `@workleap/stylelint-plugin`, `@workleap/typescript-configs`, `@workleap/rsbuild-configs`, `@workleap/rslib-configs` -> `/workleap-web-configs`

## Issues reporting

When reporting issues:

- If the issue matches an agent skill, name the skill explicitly.
- Otherwise, choose an appropriate category based on the nature of the issue.
- All issues must be reported as inline pull request comments using the `mcp__github_inline_comment__` tools.
````

## Create the workflow file

Then, create a `.github/workflows/code-review.yml` file for the GitHub action:

```yaml .github/workflows/code-review.yml
name: Code review

on:
  pull_request:
    branches: ["main"]
    types: [opened, synchronize, ready_for_review, reopened]

permissions:
  contents: read
  pull-requests: write
  issues: write
  # Required for OIDC authentication: https://github.com/anthropics/claude-code-action/blob/main/docs/faq.md#why-am-i-getting-oidc-authentication-errors.
  id-token: write

concurrency:
  group: code-review-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  code-review:
    # Skip drafts.
    if: ${{ !github.event.pull_request.draft }}

    runs-on: ubuntu-latest
    timeout-minutes: 60
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          # Provides better git history context than "1".
          fetch-depth: 0

      - name: Run code review
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          allowed_bots: "claude[bot]"
          prompt: |
            Review PR #${{ github.event.pull_request.number }} in ${{ github.repository }}.
            Get the diff: gh pr diff ${{ github.event.pull_request.number }}

            Read and follow the instructions in .github/prompts/code-review.md
          claude_args: >-
            --allowedTools Read,Glob,Grep,Skill,Task,Bash(gh:*),mcp__github_inline_comment__*
        env:
          # Required by gh CLI to fetch PR diffs and post review comments.
          GH_TOKEN: ${{ github.token }}
```

!!!info
The previous workflow does not use the [code-review](https://github.com/anthropics/claude-code/blob/main/plugins/code-review/README.md) plugin. Our tests showed that enabling the plugin often results in reviews costing above $4 per review. This is because the plugin creates a pool of four agents that work together to review the changes. Our testing indicates that acceptable review quality can be achieved without the plugin, at a lower cost.
!!!

## Try it :rocket:

Deliberately add changes that should trigger the installed agent skills, then open a pull request. The review agent should report issues as inline comments on the pull request.
