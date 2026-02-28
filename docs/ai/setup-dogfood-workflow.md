---
order: 160
label: Setup dogfood workflow
---

# Setup a dogfood workflow

This guide describes how to set up a [GitHub Action](https://github.com/features/actions) that uses [Claude Code](https://code.claude.com/) and the [agent browser](https://agent-browser.dev/) and the [dogfood](https://skills.sh/vercel-labs/agent-browser/dogfood) skill to perform a monthly exploration session of a web application to find issues, and produce a report with full reproduction evidence for every finding.

>:icon-mark-github: For a complete example of this workflow, refer to the [Squide repository](https://github.com/workleap/wl-squide/blob/main/.github/workflows/dogfood.yml) on GitHub.

## Install the agent skills and the CLI

First, install directly in your project the [agent-browser](https://skills.sh/vercel-labs/agent-browser/agent-browser) and [dogfood](https://skills.sh/vercel-labs/agent-browser/dogfood) skills. To do so, open a terminal at the root of the workspace and execute the following command:

```bash
pnpx skills add https://github.com/vercel-labs/agent-browser --skill agent-browser
pnpx skills add https://github.com/vercel-labs/agent-browser --skill dogfood
```

Then, install the [agent-browser](https://www.npmjs.com/package/agent-browser) CLI. To do so, open a terminal at the root of the workspace and execute the following command:

```bash
pnpm add -D agent-browser
```

## Create the prompt file

Then, create a `.github/prompts/dogfood.md` with the following content, and adjust the steps to match your project's capabilities:

````md .github/prompts/dogfood.md
# Dogfood

## Constraints
- Do NOT read AGENTS.md or agent-docs/
- Do NOT read the target app's source code
- Do NOT use the Skill tool — read skill files directly with the Read tool

## Task

Run an exploratory QA session on the endpoints sample app using the agent-browser dogfood skill, then report findings as a GitHub issue.

### Step 1 — Start servers

Start the endpoint servers in the background and wait for them to be ready:

```bash
pnpm serve-endpoints > /tmp/endpoints-serve.log 2>&1 &
```

Wait for both servers to be ready (single command to save a turn):

```bash
curl --retry 30 --retry-delay 5 --retry-connrefused --silent --output /dev/null http://localhost:8080 && curl --retry 30 --retry-delay 5 --retry-connrefused --silent --output /dev/null http://localhost:8081
```

If either curl command fails, run `cat /tmp/endpoints-serve.log` for diagnostics and stop.

### Step 2 — Run the dogfood session

Read and follow the skill instructions at `.agents/skills/dogfood/SKILL.md` with these parameters:
- **Target URL**: `http://localhost:8080`
- **Session name**: `endpoints`
- **Output directory**: `/tmp/dogfood-output`
- **Auth credentials**: username `temp`, password `temp`

### Step 3 — Known noise (IGNORE these)

Apply these ignore rules during the dogfood session:
- `/federated-tabs/failing` — intentionally throws to exercise error boundaries. The error boundary UI is expected.
- MSW (Mock Service Worker) console warnings — expected in this mock-data app.
- React warnings and deprecation notices — only flag actual JS errors/exceptions.

### Step 4 — Upload evidence and file a GitHub issue (or stop)

After the skill completes, read the generated report at `/tmp/dogfood-output/report.md`.

- **If the report contains zero issues**: end with "DOGFOOD PASSED — no issues found" and stop.
- **If the report contains issues**:

  1. **Identify referenced evidence** — Using the Grep tool (parameter is `path`, not `file_path`), find all `screenshots/*.png` and `videos/*.webm` paths referenced in the report. Only these files should be uploaded (ignore exploration screenshots not cited in the report).

  2. **Push evidence to the `dogfood-evidence` branch** — Evidence is stored in date-stamped directories (`YYYY-MM-DD/screenshots/`, `YYYY-MM-DD/videos/`) so each run's evidence persists and old issue links keep working.
     - Configure git auth (use `--global` so it applies to any repo or clone):
       ```bash
       git config --global user.name "github-actions[bot]"
       git config --global user.email "github-actions[bot]@users.noreply.github.com"
       git remote set-url origin "https://x-access-token:${GH_TOKEN}@github.com/workleap/wl-squide.git"
       ```
     - Fetch or create the `dogfood-evidence` branch:
       - If it exists: `git fetch origin dogfood-evidence && git checkout -B dogfood-evidence origin/dogfood-evidence`
       - If not: `git checkout --orphan dogfood-evidence && git rm -rf . 2>/dev/null || true`
     - **Prune old evidence** — Delete date directories older than 60 days, then commit the deletions if any were removed. **Do NOT use `git add -A`** — the working directory contains the full main-branch checkout (node_modules, packages, etc.) which must never be staged on this branch. Only add/remove the specific date directories:
       ```bash
       CUTOFF=$(date -d '60 days ago' +%Y-%m-%d)
       PRUNED=false
       for d in ./[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]/; do
         [ -d "$d" ] || continue
         name=$(basename "$d")
         if [[ "$name" < "$CUTOFF" ]]; then
           git rm -rf "$d"
           PRUNED=true
         fi
       done
       if [ "$PRUNED" = true ]; then
         git commit -m "Prune evidence older than 60 days"
       fi
       ```
     - **Add new evidence** — Create `YYYY-MM-DD/screenshots/` and `YYYY-MM-DD/videos/`, copy only the referenced files. Stage only the new date directory (`git add ./YYYY-MM-DD/`), commit, push. **Never use `git add -A` or `git add .`** on this branch.
     - **Return to main branch** — `git checkout main`

  3. **Rewrite evidence paths** in the report — Replace relative asset paths with absolute GitHub URLs so images render in the issue. First, capture today's date into a variable, then use it in the sed replacements:
     ```bash
     TODAY=$(date +%Y-%m-%d)
     sed -i "s|screenshots/|https://raw.githubusercontent.com/workleap/wl-squide/dogfood-evidence/${TODAY}/screenshots/|g" /tmp/dogfood-output/report.md
     sed -i "s|videos/|https://raw.githubusercontent.com/workleap/wl-squide/dogfood-evidence/${TODAY}/videos/|g" /tmp/dogfood-output/report.md
     ```

  4. **Create the issue**:
     ```bash
     gh issue create \
       --title "Dogfood: endpoints — $(date +%Y-%m-%d)" \
       --body "$(cat /tmp/dogfood-output/report.md)"
     ```
````

## Create the workflow file

Then, create a `.github/workflows/dogfood.yml` file for the GitHub action:

```yml .github/workflows/dogfood.yml
name: Dogfood

on:
  schedule:
    - cron: "0 9 15 * *"
  workflow_dispatch:

permissions:
  contents: write
  issues: write
  id-token: write

concurrency:
  group: dogfood
  cancel-in-progress: true

jobs:
  dogfood:
    runs-on: ubuntu-latest
    timeout-minutes: 45
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
      - name: Add node_modules/.bin to PATH
        run: echo "$PWD/node_modules/.bin" >> $GITHUB_PATH

      - name: Install browser dependencies
        run: agent-browser install --with-deps

      - name: Warm up browser
        run: |
          agent-browser open about:blank
          agent-browser close

      - name: Run dogfood
        uses: anthropics/claude-code-action@v1
        with:
          prompt: |
            Read and follow the instructions in .github/prompts/dogfood.md
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          show_full_output: true
          claude_args: >-
            --max-turns 200
            --allowedTools Read,Write,Edit,Glob,Grep,Bash(agent-browser:*),Bash(mkdir:*),Bash(cp:*),Bash(sleep:*),Bash(cat:*),Bash(gh:*),Bash(date:*),Bash(pnpm:*),Bash(curl:*),Bash(git:*),Bash(sed:*),Bash(rm:*),Bash(find:*),Bash(ls:*)
        env:
          # Required by gh CLI to create issues for dogfood findings.
          GH_TOKEN: ${{ github.token }}
```

## Try it :rocket:

Push the GitHub Action and manually trigger the workflow. Once it completes, the workflow will open an issue with findings if it runs successfully.
