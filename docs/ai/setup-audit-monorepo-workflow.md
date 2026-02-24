---
order: 170
label: Setup audit monorepo workflow
---

# Setup an audit monorepo workflow

As AI agents accelerate development velocity, regularly validating code quality becomes even more important. This guide describes how to set up a [GitHub Action](https://github.com/features/actions) that uses [Claude Code](https://code.claude.com/) and [agent skills](https://agentskills.io/home) to perform a monthly codebase audit.

>:icon-mark-github: For a complete example of this workflow, refer to the [Squide repository](https://github.com/workleap/wl-squide/blob/main/.github/workflows/audit-monorepo.yml) on GitHub.

## Install the agent skills

First, install directly in your project the [recommended frontend audit extensions](./setup-agent-extensions.md#audit-extensions) that match your project's technology stack.

## Create the prompt file

Then, create a `.github/prompts/audit-monorepo.md` file with the following content, and adjust the list of agent skills to match your project's technology stack:

````md .github/prompts/audit-monorepo.md
# Audit Monorepo

You are an automated agent responsible for auditing this monorepo against best practices defined in locally installed agent skills. You produce a report of actionable findings as a GitHub issue.

## Severity levels

- **High** — actively harmful pattern causing broken caches, incorrect builds, or security risk.
- **Medium** — suboptimal pattern with measurable impact on performance, maintainability, or correctness.
- **Low** — minor improvement opportunity, non-urgent.
- **Informational** — working as designed or acceptable trade-off. **Do NOT report these.**

## False positive prevention

Before including ANY finding in the report, you MUST:

1. Identify the potential issue from the skill documentation.
2. Re-read the actual source file to confirm the issue exists.
3. Consider whether the pattern is intentional or is an explicit choice with a valid trade-off.
4. Ask yourself: "Does this finding describe a **real problem** the maintainers would want to fix, or am I just noting a deviation from a textbook default?" Only real problems belong in the report.
5. Do NOT recommend replacing a working pattern with an alternative that has its own trade-offs (e.g., recommending a remote URL over a local path, or vice versa). If both options are reasonable, it's not a finding.
6. Only include the finding if you are confident it is a genuine issue at severity Low or higher.

When in doubt, do NOT report the finding.

**Examples of patterns that are NOT findings:**

- A task using `pkg#task` dependencies instead of `^build` (may be intentional for isolated/module-federation workflows)
- Root tasks (`//#task`) that exist because the task genuinely applies to root-level code only
- A `$schema` pointing to a local path or a remote URL — both are valid choices
- A workspace glob like `samples/**` that correctly matches the actual directory structure
- An env var that exists at runtime but isn't in `globalEnv` — only flag it if there's evidence of actual cache correctness issues, not just because it's "missing" from a list

---

## Step 1: Load skill documentation

Read all files in `.agents/skills/turborepo/`, `.agents/skills/pnpm/`, and `.agents/skills/workleap-react-best-practices/` (including all subdirectories) so you understand the best practices to audit against. Do not skip any file.

## Step 2: Audit

Using the best practices and anti-patterns from the skill documentation loaded in Step 1, audit the repository. Read whatever files you need (turbo.json, package.json files, pnpm-workspace.yaml, .npmrc, pnpm-lock.yaml, tsconfig files, .env files, CI workflows, etc.) to check for issues. The skill documentation describes what to look for — use it to guide your investigation.

## Step 3: Validate findings with a subagent

Before generating the report, validate your findings using a subagent to eliminate false positives. Launch a subagent with the Task tool using the **opus** model and provide it with:

1. The full list of candidate findings (severity, skill, file, description, and recommendation for each).
2. Instructions to independently re-read each referenced file and verify whether the issue actually exists.
3. Instructions to check whether each flagged pattern might be intentional (e.g., comments explaining the choice, consistency with the rest of the codebase, or a valid trade-off).
4. Instructions to return a verdict for each finding: **confirmed** or **rejected** with a brief justification.

Only carry forward findings that the subagent confirms. Drop any finding that the subagent rejects.

## Step 4: Generate report

Compile all confirmed findings (severity Low, Medium, or High only) into a structured report.

If there are **zero findings**, STOP. The audit passed cleanly. You are done.

If there are findings, create a GitHub issue:

```bash
gh issue create \
  --title "audit: monorepo audit findings — $(date -u +%Y-%m-%d)" \
  --body "$(cat <<'EOF'
## Monorepo Audit Report — YYYY-MM-DD

### Skills Audited
- Turborepo (best practices from `.agents/skills/turborepo/`)
- pnpm (best practices from `.agents/skills/pnpm/`)
- Workleap React Best Practices (best practices from `.agents/skills/workleap-react-best-practices/`)

### Summary

| # | Severity | Skill | Finding | File |
|---|----------|-------|---------|------|
| 1 | Medium | Turborepo | Brief description | `turbo.json` |

### Details

#### 1. [Finding title]

**Severity:** Medium
**Skill:** Turborepo
**File:** `turbo.json:15`
**Issue:** Description of the problem.
**Recommendation:** How to fix it.

---
EOF
)"
```

Replace the placeholder content above with the actual findings. Then STOP. You are done.
````

## Create the workflow file

Then, create a `.github/workflows/audit-monorepo.yml` file for the GitHub action:

````yaml .github/workflows/audit-monorepo.yml
name: Audit monorepo

on:
  schedule:
    - cron: "0 9 1 * *"
  workflow_dispatch:

permissions:
  contents: read
  issues: write
  id-token: write

concurrency:
  group: audit-monorepo
  cancel-in-progress: true

jobs:
  audit-monorepo:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Audit monorepo
        uses: anthropics/claude-code-action@v1
        with:
          prompt: |
            Read and follow the instructions in .github/prompts/audit-monorepo.md
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          show_full_output: true
          claude_args: >-
            --max-turns 100
            --allowedTools Read,Glob,Grep,Task,Bash(git:*),Bash(node:*),Bash(gh:*)
        env:
          # Required by gh CLI to create issues for audit findings.
          GH_TOKEN: ${{ github.token }}
````

## Try it :rocket:

Push the GitHub Action and manually trigger the workflow. Once it completes, the workflow should have created an issue with it's findings.
