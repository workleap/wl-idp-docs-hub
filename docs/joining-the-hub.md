---
order: 60
icon: rocket
label: "Joining the hub"
---

# Joining the hub

To include your library documentation in Workleap's IDP hub, follow these steps.

## Create your Retype website

First, navigate to the Retype [getting started](https://retype.com/guides/getting-started/) guide to set up a Retype website within your library repository.

### Basic setup

Then, open the `retype.yml` file located at the root of the repository and copy/paste the following basic configuration:

```yaml retype.yml
# -------------------
# Retype
# -------------------

input: ./docs
output: .retype

url: [THE GITHUB PAGES URL OF YOUR SITE]

branding:
    title: [THE NAME OF YOUR LIBRARY]
    logo: ./static/logo.png

edit:
    repo: [YOUR REPOSITORY]
    base: /docs
    branch: main

footer:
    copyright: "&copy; Copyright {{ year }} - Workleap"

# To allow using {{ }} in code blocks.
# View: https://github.com/retypeapp/retype/issues/622#issuecomment-1712391219.
templating:
    enabled: false

verbose: true
```

Finally, add the following script to your `package.json` file:

```json package.json
{
    "dev-docs": "retype start"
}
```

!!!info
Please note that Retype is also compatible with `.NET` projects. If you are working on a `.NET` project, visit the Retype website for guidance on starting your Retype development.
!!!

### Try it :rocket:

Start your new Retype site by executing the `dev-docs` script.

### Adhere to Workleap's conventions

The following conventions are optional but highly recommend to to guarantee a consistent and unified experience for Workleap's developers within the Workleap IDP hub.

#### Icons

First, add Workleap's **reversed bleu** logo and favicon to the `/docs/static` folder:

``` !#3-5
root
├── docs
├──── static
├────── logo.png
├────── favicon.png
```

Then, configure Retype to use the new assets by including the following configurations to your `retype.yml` file:

```yaml retype.yml
# -------------------
# Retype
# -------------------
branding:
    logo: ./static/logo.png

favicon: ./static/favicon.png
```

#### Top bar links

Then, add the following links to the top nav bar of your Retype site:

Link | Description
---  | ---
Home | A link to the homepage of your Retype site.
Found a bug | A link to your library's bug tracker.
Feature requests | A link to request a new feature for your library.
Releases | A link to a page listing your library releases.
GitHub (or another platform) | A link to your library's repository.
NPM / Nugget | A link to the library's packages.

Your Retype links configuration should closely resemble the following configurations

```yaml retype.yml
# -------------------
# Retype
# -------------------
links:
    - text: Home
      icon: home
      link: /

    - text: Found a bug?
      icon: issue-opened
      link: [YOUR LINK]
      target: blank

    - text: Feature requests
      icon: comment-discussion
      link: [YOUR LINK]
      target: blank

    - text: Releases
      icon: tag
      link: [YOUR LINK]
      target: blank

    - text: Github
      icon: mark-github
      link: [YOUR LINK]
      target: blank

    - text: NPM
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H24V24H0V0Z" fill="#CC0000"/><path d="M11.9184 2.57758H2.57764V21.4214H11.9175V7.32958H16.6695V21.4214H21.4215V2.57758H11.9184Z" fill="white"/></svg>
      link: [YOUR LINK]
      target: blank
```

#### Footer links

Then, add the following links to the footer of your Retype site:

Link | Description
---  | ---
About | A link to an about page including meta informations about your library project ([example](https://gsoft-inc.github.io/wl-web-configs/about/)).
License | A link to the license of your library.

Your Retype footer links configuration should closely resemble the following configurations

```yaml retype.yml
# -------------------
# Retype
# -------------------
footer:
    links:
        - text: About
          icon: question
          link: [YOUR LINK]

        - text: License
          icon: shield-check
          link: [YOUR LINK]
          target: blank
```

#### Retype navigation folder items

We recommend adding an icon before each [folder item](https://retype.com/configuration/folder/#icon) of the main navigation (on the left):

Icon | Section
---  | ---
:icon-rocket: | Use a `rocket` icon for a "Getting Started" section ([example](https://gsoft-inc.github.io/wl-squide/getting-started/)).
:icon-book: | Use a `book` icon for a "Guides" section ([example](https://gsoft-inc.github.io/wl-squide/guides/)).
:icon-gear: | Use a `gear` icon for a "Reference" section ([example](https://gsoft-inc.github.io/wl-squide/reference/)).
:icon-question: | Use a `question` icon for a "Troubleshooting" section ([example](https://gsoft-inc.github.io/wl-squide/troubleshooting/)).
:icon-command-palette: | Use a `command-palette` icon for a "Sample" section ([example](https://gsoft-inc.github.io/wl-squide/samples/)).

### Include the shared CSS customizations file

Our Retype websites share a [CSS file](https://github.com/gsoft-inc/wl-idp-docs-hub/blob/main/docs/static/retype_customization.css) that contains several customizations to enhance the default Retype style. To incorporate this file into your Retype site, follow these steps:

#### Create the `_includes/head.html` file

Create a `_includes/head.html` file within the `/docs` folder:

``` !#3-4
root
├── docs
├──── _includes
├────── head.html
```

#### Link the shared CSS file

Then, open the newly created `_includes/head.html` file and copy/paste the following content:

```html _includes/head.html
<link href="https://gsoft-inc.github.io/wl-idp-docs-hub/static/retype-customization.css" rel="stylesheet" />
```

### Activate pro features

Workleap has acquired an [Enterprise license](https://retype.com/pro/) for Retype, which you can locate the key in our secure Vault. To enable Retype's pro features, copy and paste the following configuration into your `retype.yml` file:

```yaml retype.yml
# -------------------
# Retype Pro
# -------------------

poweredByRetype: false

outbound:
    enabled: true
    icon: ""

breadcrumb:
    enabled: true
    home: false

toc:
    depth: 2

hub:
    link: https://gsoft-inc.github.io/wl-idp-docs-hub/
    alt: Workleap's IDP homepage

start:
    pro: true
```

### Configure your Retype wallet

Since we've added the following lines to your `retype.yml` file:

```yaml retype.yml
start:
    pro: true
```

You can now develop a Retype site locally with the pro features without the need for a local Retype [wallet](https://retype.com/guides/cli/#retype-wallet). However, if you prefer to set up your local Retype wallet, follow these steps:

1. Locate the Retype license key in our secure Vault.
2. Utilize the [Retype CLI](https://retype.com/guides/cli/#retype-wallet) to create your wallet.

## Host your site on GitHub pages

To use our [Retype enterprise license](https://retype.com/pro/), and for every hub features of Retype to work properly, the site must be hosted on the `https://gsoft-inc.github.io` domain. As this is a [GitHub Pages](https://pages.github.com/) domain, to join the hub, your Retype site must be deployed with GitHub Pages.

To configure your Retype site to be deployed with GitHub Pages, refer to the following [guide](https://retype.com/hosting/github-pages/).

!!!info
You don't need to set the Retype Enterprise license key as it's already configured as an organization secret.
!!!

## Add your site to the hub

Send a PR to the [wl-idp-docs-hub](https://github.com/gsoft-inc/wl-idp-docs-hub) GitHub repository to add your site to the hub. Once merged, your site will be automatically added to the Workleap IDP hub!
