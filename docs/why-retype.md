---
order: 70
label: "Why Retype"
icon: question
---

# Why Retype?

## Comparison with GitHub readme files

While GitHub `README.md` files are great, there are several compelling reasons to consider using a documentation platform like Retype:

1. **Better Structuring:** Retype simplifies the organization of documentation by allowing easy division into multiple files and provides an intuitive navigation system with a left sidebar for seamless browsing.

2. **Automatic Table of Contents:** Retype generates an in-page Table of Contents automatically from the page's headers, improving navigation within the documentation.

3. **Powerful Search:** Retype integrates advanced content search functionality, enabling developers to quickly locate the information they need.

4. **Broken Link Detection:** Retype's compilers swiftly identify any broken links (including anchors), ensuring that your documentation remains error-free.

:::align-image-left
![Retype's compiler warning](/static/broken-link.png)
:::

5. **Advanced Code Block Features:** Retype's code blocks support features like [line highlighting](https://retype.com/components/code-block/#line-highlighting) and optional [titles](https://retype.com/components/code-block/#title), enhancing the presentation of code samples.

6. **Rich components collection:** Retype offers out of the box a rich collection of [markdown components](https://retype.com/components/) that should meet the requirements of most documentation websites.

7. **Outbound Links:** Retype automatically identifies and manages external [(outbound) links](https://retype.com/configuration/project/#outbound) within the project, opening them in new tabs when clicked for a smoother user experience.

8. **Multiple Layouts:** Retype offers three distinct [layouts](https://retype.com/configuration/page/#layout) out of the box: `page`, `central`, and `blog`, allowing flexibility in presentation.

9. **Custom CSS:** Retype allows to add [custom global CSS](https://retype.com/components/container/#custom-global-css) and [CSS classes to containers](https://retype.com/components/container/#custom--class).

10. **The Hub Functionality:** Retype's [hub functionality](https://retype.com/configuration/project/#hub) enables the interlinking of multiple websites, facilitating seamless navigation between related resources.

By choosing Retype, we can take advantage of these features to enhance our documentation's organization, accessibility, and overall developers experience.

## Comparison with other documentation platforms

When considering documentation platforms, it's essential to explore alternatives to [Retype](https://retype.com/). Several options exist, including SaaS-based solutions like [Gitbook](https://www.gitbook.com/) and self-hosted options like [Docusaurus](https://docusaurus.io/), [Rspress](https://rspress.dev/), or even creating a custom website using [Next.js](https://nextjs.org/).

### SaaS-based platforms

SaaS-based platforms like Gitbook offer convenience but can fall short in terms of customization and often come with complex pricing structures, particularly when managing a collection of libraries like Workleap's IDP.

### Self-hosted platforms

Self-hosted platforms like Docusaurus can match Retype's feature set but tend to have a higher entry barrier. Each website created with Docusaurus is entirely custom and involves frontend tooling. The entry barrier increases significantly because developers must possess knowledge of how frontend tools operate and how to build a React application.

One of Retype's strengths lies in its balance between customization and ease of entry. It provides just enough customization to create rich and personalized documentation while maintaining a very low entry barrier. Basic knowledge of markdown is all that's needed to get started.

High-level solution structure of a Docusaurus website:

``` !#6-8,10-12,15,17,18
root
├── docs
├──── Folder-1
├─────── page1.md
├── src
├──── components
├─────── Tab.tsx
├─────── HomePageItem.tsx
├──── css
├──── pages
├─────── index.tsx
├─────── Home.tsx
├──── static
├── .gitignore
├── babel.config.js
├── docusaurus.config.js
├── sidebars.js
├── tsconfig.ts
├── package.json
```

High-level solution structure of a Retype website:

```
root
├── docs
├──── Folder-1
├─────── page1.md
├── retype.yml
├── package.json
```

In summary, platforms like Docusaurus demand frontend expertise to write documentation effectively, while Retype only requires a basic understanding of markdown. Retype functions as a command-line interface (CLI) that compiles markdown files into a website, making it adaptable even within a `.NET` repository since it supports the [.NET](https://retype.com/guides/getting-started/) platform.

## .NET support

Retype fully supports the `.NET` platform, making it a seamless choice for `.NET` developers:

```bash
dotnet tool install retypeapp --global
retype start
```

With Retype's `.NET` support, creating documentation for an IDP backend library becomes straightforward. All you need to do is include a `docs` folder at the root of your repository, and Retype will handle the rest:

```
wl-domain-event-propagation
├── docs
├──── getting-started.md
├──── guides
├─────── building-releasing-versioning.md
├── src
├── retype.yml
```

