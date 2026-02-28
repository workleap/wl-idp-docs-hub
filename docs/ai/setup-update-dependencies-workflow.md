---
order: 180
label: Setup update dependencies workflow
---

# Setup an update dependencies workflow

Tired of Renovate Bot? Looking for a smarter way to keep your dependencies up to date? Create a [GitHub Action](https://github.com/features/actions) that uses [Claude Code](https://code.claude.com/) to update a project dependencies once a week and perform validation tests before opening a pull request.

>:icon-mark-github: For a complete example of this workflow, refer to the [Squide repository](https://github.com/workleap/wl-squide/blob/main/.github/workflows/update-dependencies.yml) on GitHub.

## Install the agent skills

First, install directly in your project the [agent-browser](https://skills.sh/vercel-labs/agent-browser/agent-browser) skill. This skill will help the agent perform the validation steps that requires a browser. To do so, open a terminal at the root of the workspace and execute the following command:

```bash
pnpx skills add https://github.com/vercel-labs/agent-browser --skill agent-browser
```

## Create the prompt file

Then, create a `.github/prompts/update-dependencies.md` with the following content, and adjust the validation steps to match your project's capabilities:

````md .github/prompts/update-dependencies.md
# Update Dependencies

You are an automated agent responsible for updating the dependencies of this monorepo and validating that everything still works correctly.

## Constraints

- You have a maximum of **10 attempts** to pass all validation steps. If you exhaust all attempts, go to Step 4 (Failure).
- You MUST execute every validation step (2a, 2b, 2c, 2d) in order. Do NOT skip any step.
- Do NOT create new source files as part of a dependency update. Only modify existing files when migrating to a newer API.
- Do NOT read `AGENTS.md` or `agent-docs/`.
- **Avoid rabbit holes**: If you spend more than 3 attempts or 10 tool calls investigating a single issue without progress, stop. Revert the problematic package to its previous version, open an issue, and move on.

---

## Step 1: Update dependencies

Update all dependencies to their latest versions:

```bash
pnpm update-outdated-deps
```

Then, check if any `package.json` files were modified:

```bash
git diff --name-only -- '**/package.json' ':!node_modules'
```

If the output is empty, there are no dependency updates. STOP immediately. You are done.

Otherwise, install the updated dependencies:

```bash
pnpm install --no-frozen-lockfile
```

## Step 2: Validation loop

Run steps 2a through 2d in order. If ANY step fails, diagnose and fix the issue before retrying. Read error messages carefully, inspect failing source code, look up changelogs or migration guides for packages with breaking changes, then apply the fix and restart from Step 2a.

**When fixing breaking changes:**

- Migrate code to use the newer API or pattern introduced by the updated package.
- Do NOT add polyfills, shims, or workarounds for features already available in the runtime.
- Do NOT patch or monkey-patch libraries to suppress errors.
- If a breaking change cannot be resolved by a clean migration, revert that specific package to its previous version, open an issue using the template below, then continue with the remaining updates.

```bash
gh issue create \
  --title "[agent] Failed to update <package-name>" \
  --body "## Failed dependency update

**Package**: \`<package-name>\`
**From**: \`<old-version>\` → **To**: \`<new-version>\`

## Error

<Error messages and which validation step failed>

## What was tried

<Brief description of migration attempts>

## Workflow run

$GITHUB_SERVER_URL/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID"
```

### Step 2a: Linting

```bash
pnpm lint
```

All checks must pass with zero errors.

### Step 2b: Tests

```bash
pnpm test
```

All tests must pass. If a test fails, run the failing package's tests directly (e.g., `pnpm --filter <package> test`) to get clearer output instead of re-running the full suite.

### Step 2c: Validate the "endpoints" sample app

Use `agent-browser` for all browser interactions in this step. It is installed as a workspace devDependency. Read the locally installed agent skill at `.agents/skills/agent-browser/` to learn the available commands. Do NOT use `agent-browser screenshot` — use only `snapshot` (text) and `console` (errors). Screenshots are binary and cannot be analyzed. Running a build is NOT sufficient — you must start the dev server and validate in a real browser.

1. Start the server in the background using the shell `&` operator (do NOT use `run_in_background: true`): `pnpm serve-endpoints > /tmp/endpoints-serve.log 2>&1 &`
2. The endpoints app listens on port **8080** (host) and **8081** (remote module). Wait for both to be ready — do NOT use `sleep`, do NOT write polling loops, do NOT parse the log file for a URL. Instead, immediately run: `curl --retry 30 --retry-delay 5 --retry-connrefused --silent --output /dev/null http://localhost:8080 && curl --retry 30 --retry-delay 5 --retry-connrefused --silent --output /dev/null http://localhost:8081`. If the curl command fails, run `cat /tmp/endpoints-serve.log` for diagnostics.
3. The app has a mock login page. Use username `temp` and password `temp` to authenticate.
4. Navigate to the following pages and check that each renders without errors:
   - `/` (Home page)
   - `/subscription`
   - `/federated-tabs`
   - `/federated-tabs/episodes`
   - `/federated-tabs/locations`
5. For each page, use `agent-browser snapshot` to verify the page rendered content, and use `agent-browser console` to check for console errors (ignore warnings and known noise like network errors from fake APIs or MSW)
6. Stop the dev server process when done: `kill $(lsof -t -i:8080) 2>/dev/null || true; fuser -k 8080/tcp 2>/dev/null || true`

### Step 2d: Validate the "storybook" sample app

Use `agent-browser` for all browser interactions in this step. It is installed as a workspace devDependency. Read the locally installed agent skill at `.agents/skills/agent-browser/` to learn the available commands. Do NOT use `agent-browser screenshot` — use only `snapshot` (text) and `console` (errors). Screenshots are binary and cannot be analyzed. Running a build is NOT sufficient — you must start the dev server and validate in a real browser.

1. Start the dev server in the background using the shell `&` operator (do NOT use `run_in_background: true`): `pnpm dev-storybook > /tmp/storybook-dev.log 2>&1 &`
2. The storybook app listens on port **6006**. Wait for it to be ready — do NOT use `sleep`, do NOT write polling loops, do NOT parse the log file for a URL. Instead, immediately run: `curl --retry 30 --retry-delay 5 --retry-connrefused --silent --output /dev/null http://localhost:6006`
3. Navigate to http://localhost:6006 and verify it loads correctly
4. Click on at least **2 different stories** in the sidebar and verify each renders without errors. Use `agent-browser snapshot` to verify the rendered content and `agent-browser console` to check for console errors (ignore warnings and known noise)
5. Stop the dev server process when done: `kill $(lsof -t -i:6006) 2>/dev/null || true; fuser -k 6006/tcp 2>/dev/null || true`

## Step 3: Success

All validations passed.

### 3a: Create a changeset (if needed)

Only include `@squide/*` packages whose `dependencies` or `peerDependencies` have actually changed. Do NOT include packages where only `devDependencies` changed — devDependency-only changes do not affect the published package. If no `@squide/*` packages qualify (i.e., every change is devDependency-only), skip this step entirely — do NOT create a changeset file.

Create a changeset file at `.changeset/update-deps-<YYYYMMDD-HHMMSS>.md` (use the current UTC date-time to avoid filename collisions with unreleased changesets). Use `patch` as the default bump level, but use your judgment to bump as `minor` or `major` if warranted by the dependency changes.

Example format:

```markdown
---
"@squide/core": patch
---

Updated dependencies to their latest versions.
```

### 3b: Commit and create pull request

Close any existing open dependency-update PRs before creating a new one:

```bash
gh pr list --search "chore: update dependencies" --state open --json number --jq '.[].number' | xargs -I{} gh pr close {} --comment "Superseded by a newer dependency update run."
```

Then create the new PR with the body described below.

#### How to write the Summary section

Before writing the summary, run `git diff main -- '**/package.json'` to see the actual changes. Then apply these rules:

1. In unified diff output, context lines start with a SPACE character, removed lines start with a single `-`, and added lines start with a single `+`. Only `-` and `+` lines represent actual changes — do NOT include dependencies that only appear on space-prefixed context lines.
2. Deduplicate: list each dependency name + version change only once, even if it appears in multiple package.json files.
3. If a dependency appears in different categories across packages (e.g., peerDependencies in a library and devDependencies in a sample), list all categories it belongs to (e.g., "peerDependencies, devDependencies").
4. Format each as: `package-name`: `old-version` → `new-version` (category), where category is dependencies, peerDependencies, or devDependencies.
5. Sort by category priority: peerDependencies first, then dependencies, then devDependencies. If a dependency belongs to multiple categories, sort it by its highest-priority category.
6. Highlight any peerDependency range narrowing with "(range narrowed — may break consumers)" — these affect consumers.
7. Do NOT mention transitive dependencies (pnpm-lock.yaml only).

#### PR body template

```markdown
## Summary

<list the updated dependencies here, following the rules above>

## Validation checklist
- [x] Step 2a: Linting
- [x] Step 2b: Tests
- [x] Step 2c: Endpoints sample app
- [x] Step 2d: Storybook sample app
```

#### Create the PR

```bash
BRANCH_NAME="agent/update-deps-$(date -u +%Y%m%d-%H%M%S)"
git checkout -b "$BRANCH_NAME"
git add -A
git commit -m "chore: update dependencies"
git push origin "$BRANCH_NAME"

gh pr create \
  --base main \
  --head "$BRANCH_NAME" \
  --title "chore: update dependencies $(date -u +%Y-%m-%d)" \
  --body "<use the PR body template above>"
```

Then STOP. You are done.

## Step 4: Failure

You have exhausted 10 validation attempts. Do NOT create a pull request.

```bash
gh issue create \
  --title "[agent] Cannot update dependencies" \
  --body "<Include: which step(s) failed, error messages, what fixes were attempted, and a link to: $GITHUB_SERVER_URL/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID>"
```

Then STOP. You are done.
````

!!!tip
If the project is not a library, remove the `3a: Create a changeset` step.
!!!

## Create the workflow file

Then, create a `.github/workflows/update-dependencies.yml` file for the GitHub action:

```yml .github/workflows/update-dependencies.yml
name: Update dependencies

on:
  schedule:
    - cron: "0 14 * * 2"
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write
  issues: write
  id-token: write

concurrency:
  group: update-dependencies
  cancel-in-progress: true

jobs:
  update-dependencies:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          run_install: false

      - name: Install Node.js
        uses: actions/setup-node@v6
        with:
          node-version: ">=24.0.0"
          check-latest: true
          cache: pnpm
          cache-dependency-path: pnpm-lock.yaml

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      # Expose workspace binaries (e.g. agent-browser) as bare commands.
      # This aligns with the agent-browser skill which expects `agent-browser <cmd>`
      # without a `pnpm exec` prefix.
      - name: Add node_modules/.bin to PATH
        run: echo "$PWD/node_modules/.bin" >> $GITHUB_PATH

      - name: Install browser dependencies
        run: agent-browser install --with-deps

      - name: Warm up browser
        run: |
          agent-browser open about:blank
          agent-browser close

      - name: Update dependencies
        uses: anthropics/claude-code-action@v1
        with:
          prompt: |
            Read and follow the instructions in .github/prompts/update-dependencies.md
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          show_full_output: true
          claude_args: >-
            --max-turns 200
            --allowedTools Edit,Read,Write,Glob,Grep,Bash(pnpm:*),Bash(git:*),Bash(node:*),Bash(gh:*),Bash(agent-browser:*),Bash(kill:*),Bash(lsof:*),Bash(curl:*),Bash(fuser:*)
        env:
          # Required by gh CLI to create PRs and issues.
          GH_TOKEN: ${{ github.token }}
```

## Try it :rocket:

Push the GitHub Action and manually trigger the workflow. Once it completes, the workflow will either open a pull request if new dependency versions are found or create an issue if it fails.
