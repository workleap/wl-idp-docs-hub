---
order: 200
toc:
    depth: 2-3
---

# Setup agent extensions

Agents can be extended with **additional capabilities** to interact with tools, libraries, and external systems, enabling them to go beyond their core reasoning abilities. This page outlines the agent extensions we recommend for frontend development at Workleap.

## Recommended extensions

Below is a non-exhaustive curated list of agent extensions we recommend for frontend development at Workleap. This list is expected to change over time as our practices, patterns, and technologies change. Avoid installing every extension, as too many can negatively affect performance. Select only those that are relevant to your project.

==- :icon-light-bulb: Key differences between agent skills and MCP

**Agent skills**

_In-process_ extensions that run in the same runtime as the agent.

They are typically used to:

- Avoid additional prompt, serialization, or protocol overhead
- Minimize token consumption by not requiring round-trips to external services
- Expose shared libraries and utilities directly to the agent (for example, logging or telemetry)

**MCP**

_Out-of-process_ extensions that communicate with the agent over a protocol boundary.

They are typically used to:

- Access external systems
- Isolate execution environments
- Share capabilities across multiple agents or runtimes

**Comparison**

Requirement / constraint | Agent skills | MCP {.compact}
---  | :---: | :---:
Executes in agent runtime | :icon-check: | |
Requires external protocol or round-trip | | :icon-check: |
Additional prompt / context overhead | Minimal | Higher |
Token consumption per operation | Lower | Higher |
Process or runtime isolation | | :icon-check: |
Access to external systems | | :icon-check: |
Failure surface area | Smaller | Larger |
===

==- :icon-light-bulb: Understanding extension bloat

Installing too many agent extensions can degrade agent performance. This phenomenon, commonly referred to as **extension bloat**, occurs because every enabled extension consumes a portion of the agent's context window, leaving less room for the actual task at hand.

**How extensions consume context**

Agent skills and MCP servers consume context differently:

- **Agent skills**: Only skill metadata (name + description) is loaded into context at all times. The full `SKILL.md` body loads only when the skill is invoked. This is known as _progressive disclosure_.
- **MCP servers**: Tool definitions (names, descriptions, JSON schemas for every parameter) are loaded into context. A single MCP server can expose dozens of tools, each consuming tokens.
- **Subagents**: When skills are preloaded via a subagent's `skills` field, the **full skill content** is injected at startup, which is significantly heavier than the normal metadata-only behavior.

**The skill metadata budget**

Claude Code allocates a character budget for skill metadata. The budget scales dynamically at **2% of the context window**, with a **fallback of 16,000 characters**. When the total metadata of all enabled skills exceeds this budget, some skills are silently excluded and the agent will not know they exist.

The `SLASH_COMMAND_TOOL_CHAR_BUDGET` environment variable can be used to override this limit, and the `/context` command can be used to check for warnings about excluded skills.

Each skill consumes roughly **109 characters of overhead** plus the length of its description. With typical descriptions (~250-300 characters), the 16,000-character fallback allows approximately **40-45 skills** before some start getting excluded. Shorter descriptions allow more skills; longer descriptions reduce the count.

:point_right: Run `/context` in Claude Code periodically to verify that none of your skills are being excluded.

**When bloat starts to matter**

[Anthropic's guide to building skills](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf) recommends evaluating your setup when you have **more than 20-50 skills** enabled simultaneously. Beyond this range:

- **Skills may be silently excluded** from the agent's view, depending on description length.
- **Decision quality drops** as the agent must choose between more semantically similar options. [Microsoft Research](https://www.microsoft.com/en-us/research/blog/tool-space-interference-in-the-mcp-era-designing-for-agent-compatibility-at-scale/) documented up to 85% performance reduction in large tool spaces, and found 775 tool name collisions across 1,470 MCP servers.
- **Conflicting guidance** between skills with overlapping domains can produce inconsistent or unexpected behavior.
- **Response latency increases** as the agent processes more context per turn.
===

### Code generation extensions

Description | Agent skill | MCP {.agent-extensions}
---  | --- | ---
Agent extensions for Squide. | [workleap-squide](https://workleap.github.io/wl-squide/introduction/use-with-agents/#install-agent-skill) | - |
Agent extensions for web configs libraries. | [workleap-web-configs](https://workleap.github.io/wl-web-configs/introduction/use-with-agents/#install-agent-skills) | - |
Agent extensions for telemetry libraries. | [workleap-telemetry](https://workleap.github.io/wl-telemetry/introduction/use-with-agents/#install-agent-skill) | - |
Agent extensions for logging libraries. | [workleap-logging](https://workleap.github.io/wl-logging/introduction/use-with-agents/#install-agent-skill) | - |
Agent extensions for React. | [workleap-react-best-practices](https://workleap.github.io/wl-web-configs/introduction/use-with-agents/#install-agent-skills) | - |
Agent extensions for Hopper. | - | [hopper.workleap.design/mcp](https://hopper.workleap.design/getting-started/ai-for-agents/mcp-server) |
Agent extension for React Aria. | [adobe/com/react-aria](https://skills.sh/adobe/com/react-aria) | - |
Agent extension for Vitest. | [antfu/skills/vitest](https://skills.sh/antfu/skills/vitest) | - |
Agent extensions for end to end tests. | [microsoft/playwright-cli](https://skills.sh/microsoft/playwright-cli/playwright-cli) + [wshobson/agents/e2e-testing-patterns](https://skills.sh/wshobson/agents/e2e-testing-patterns) | - |
Performance optimization based on Lighthouse performance audits. Focuses on loading speed, runtime efficiency, and resource optimization. | [web-quality-skills/performance](https://skills.sh/addyosmani/web-quality-skills/performance) | - |
Targeted optimization for the three Core Web Vitals metrics that affect Google Search ranking and user experience. | [web-quality-skills/core-web-vitals](https://skills.sh/addyosmani/web-quality-skills/core-web-vitals) | - |
Modern web development standards based on Lighthouse best practices audits. Covers security, browser compatibility, and code quality patterns. | [web-quality-skills/best-practices](https://skills.sh/addyosmani/web-quality-skills/best-practices) | - |
Comprehensive accessibility guidelines based on [WCAG 2.1](https://www.w3.org/TR/WCAG21/) and Lighthouse accessibility audits. | [web-quality-skills/accessibility](https://skills.sh/addyosmani/web-quality-skills/accessibility) | - |
Turborepo best practices. | [vercel/turborepo](https://skills.sh/vercel/turborepo/turborepo) | - |

### Code review extensions

Description | Agent skill | MCP {.agent-extensions}
---  | --- | ---
Agent extension for Squide. | [workleap-squide](https://workleap.github.io/wl-squide/introduction/use-with-agents/#install-agent-skill) | - |
Agent extension for web configs libraries. | [workleap-web-configs](https://workleap.github.io/wl-web-configs/introduction/use-with-agents/#install-agent-skills) | - |
Agent extension for telemetry libraries. | [workleap-telemetry](https://workleap.github.io/wl-telemetry/introduction/use-with-agents/#install-agent-skill) | - |
Agent extension for logging libraries. | [workleap-logging](https://workleap.github.io/wl-logging/introduction/use-with-agents/#install-agent-skill) | - |
Agent extensions for React. | [workleap-react-best-practices](https://workleap.github.io/wl-web-configs/introduction/use-with-agents/#install-agent-skills) | - |
Agent extension for React Aria. | [adobe/com/react-aria](https://skills.sh/adobe/com/react-aria) | - |
Performance optimization based on Lighthouse performance audits. Focuses on loading speed, runtime efficiency, and resource optimization. | [web-quality-skills/performance](https://skills.sh/addyosmani/web-quality-skills/performance) | - |
Targeted optimization for the three Core Web Vitals metrics that affect Google Search ranking and user experience. | [web-quality-skills/core-web-vitals](https://skills.sh/addyosmani/web-quality-skills/core-web-vitals) | - |
Modern web development standards based on Lighthouse best practices audits. Covers security, browser compatibility, and code quality patterns. | [web-quality-skills/best-practices](https://skills.sh/addyosmani/web-quality-skills/best-practices) | - |
Comprehensive accessibility guidelines based on [WCAG 2.1](https://www.w3.org/TR/WCAG21/) and Lighthouse accessibility audits. | [web-quality-skills/accessibility](https://skills.sh/addyosmani/web-quality-skills/accessibility) | - |
Turborepo best practices. | [vercel/turborepo](https://skills.sh/vercel/turborepo/turborepo) | - |
PNPM best practices. | [antfu/skills/pnpm](https://skills.sh/antfu/skills/pnpm) | - |

### Debug & inspection extensions

Description | Agent skill | MCP {.agent-extensions}
---  | --- | ---
Let agents control and inspect a live Chrome browser. Useful for automation, in-depth debugging, and performance analysis. **It debug and inspect a page as a human.** | - | [chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp?tab=readme-ov-file#getting-started) |
Agent extensions for the `agent-browser` CLI. `agent-browser` drives a browser like a test runner/automation tool (scripted actions and snapshots). **It consume 93% less tokens than Playwright.** | [vercel-labs/agent-browser](https://skills.sh/vercel-labs/agent-browser/agent-browser) | - |
Help the agent query the LogRocket highlights API to retrieve user session information, behavior data, and answer questions about user activity. | - | [@logrocket/mcp](https://www.npmjs.com/package/@logrocket/mcp)

### Audit extensions

Description | Agent skill | MCP {.agent-extensions}
---  | --- | ---
Comprehensive quality review based on Google Lighthouse audits. Covers performance, accessibility, SEO, and best practices. | [web-quality-skills/web-quality-audit](https://skills.sh/addyosmani/web-quality-skills/web-quality-audit) | - |
Workleap React best practices. | [workleap-react-best-practices](https://workleap.github.io/wl-web-configs/introduction/use-with-agents/#install-agent-skills) | - |
Workleap Chromatic best practices. | [workleap-chromatic-best-practices](https://workleap.github.io/wl-web-configs/introduction/use-with-agents/#install-agent-skills) | - |
Turborepo best practices. | [vercel/turborepo](https://skills.sh/vercel/turborepo/turborepo) | - |
PNPM best practices. | [antfu/skills/pnpm](https://skills.sh/antfu/skills/pnpm) | - |
Explore and test a web application with the `agent-browser` CLI for bugs, UX issues, and other problems, producing a structured report with step-by-step screenshots and reproduction evidence. | [vercel-labs/agent-browser/dogfood](https://skills.sh/vercel-labs/agent-browser/dogfood) | - |

### Others

Description | Agent skill | MCP {.agent-extensions}
---  | --- | ---
Evaluate third-party agent skills for security risks before adoption. | [workleap-skill-safety-review](https://skills.sh/workleap/wl-web-configs/workleap-skill-safety-review) | - |
Reduce skill token consumption (metadata bloat) without losing coverage. <br><br>_Important: Must be invoked manually using `/workleap-skill-optimizer`._ | [workleap-skill-optimizer](https://skills.sh/workleap/wl-web-configs/workleap-skill-optimizer) | - |

:point_right: To propose a new agent extension, [open an issue](https://github.com/workleap/wl-idp-docs-hub/issues) on GitHub.
