# wl-idp-docs-hub

## Installation

This project uses [pnpm](https://pnpm.io/installation) 12. pnpm downloads the version pinned in the `packageManager` field of [package.json](./package.json) by itself.

### Setup the GitHub package firewall

The npm dependencies are installed through the `gsoft` enterprise GitHub package firewall (configured in the repository [.npmrc](./.npmrc) file). Only members of the `gsoft` GitHub enterprise can install the dependencies.

The firewall requires a GitHub token. First, sign in with the [GitHub CLI](https://cli.github.com/) and choose "Login with a web browser":

```bash
gh auth login
```

On the browser authorization page, under **Organization access**, click **Authorize** next to your Workleap organizations (e.g. `workleap`). `gsoft` is the enterprise slug, so it won't be listed. If there's no **Authorize** button, the GitHub CLI is already authorized.

Then, add the token to your **user-level** `.npmrc` file (`~/.npmrc`). The commands start with a newline in case the file doesn't end with one:

```powershell
# PowerShell
Add-Content -Encoding ascii "$HOME\.npmrc" "`n//package-firewall.githubapp.com/npm/enterprises/gsoft/:_authToken=$(gh auth token)"
```

```bash
# bash / zsh
printf '\n//package-firewall.githubapp.com/npm/enterprises/gsoft/:_authToken=%s\n' "$(gh auth token)" >> ~/.npmrc
```

Finally, verify that the token was added to your `~/.npmrc` file:

```powershell
# PowerShell
Get-Content "$HOME\.npmrc"
```

```bash
# bash / zsh
cat ~/.npmrc
```

The output should include a line like `//package-firewall.githubapp.com/npm/enterprises/gsoft/:_authToken=gho_...` (the token prefix depends on how you signed in with the GitHub CLI), and only one such line. If there's more than one, delete the older ones.

> [!IMPORTANT]
> Never add the token to the repository `.npmrc` file: it would be committed to a public repository. pnpm doesn't expand environment variables (like `${GITHUB_TOKEN}`) in a repository `.npmrc` file either, which is why the token goes in the user-level `~/.npmrc` file.

> [!NOTE]
> If an install fails with a `401` error from `package-firewall.githubapp.com`, the token is missing, expired, or not authorized for your Workleap organizations. Check the organization access of the GitHub CLI app at https://github.com/settings/applications, then run `gh auth login` again and replace the `_authToken` line in `~/.npmrc` with a new token.

## Usage

```bash
pnpm install
pnpm dev
```

## License

Copyright © 2023, Workleap This code is licensed under the Apache License, Version 2.0. You may obtain a copy of this license at https://github.com/workleap/workleap-license/blob/master/LICENSE.
