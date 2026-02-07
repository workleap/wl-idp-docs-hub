---
order: 200
toc:
    depth: 2-3
---

# Setup agent extensions

Agents can be extended with **additional capabilities** to interact with tools, libraries, and external systems, enabling them to go beyond their core reasoning abilities. This page outlines the agent extensions we recommend for frontend development at Workleap.

## Recommended extensions

Below is a non-exhaustive list of agent extensions we currently recommend for frontend development at Workleap. This list is expected to change over time as our practices, patterns, and technologies evolve.

Some libraries provide both an agent skill and an MCP integration. When an **agent skill** is available, we generally **recommend using it** rather than its MCP counterpart, as it avoids additional protocol overhead and reduces token usage.

:point_right: To propose a new agent skill or MCP, [open an issue on GitHub](https://github.com/workleap/wl-idp-docs-hub/issues).

==- Key differences between agent skills and MCP

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

### Coding agent extensions

Description | Agent skill | MCP {.agent-extensions}
---  | --- | ---
Agent extensions for Squide. | [workleap-squide](https://workleap.github.io/wl-squide/introduction/use-with-agents/#install-agent-skill) | - |
Agent extensions for web configs libraries. | [workleap-web-configs](https://workleap.github.io/wl-web-configs/introduction/use-with-agents/#install-agent-skills) | - |
Agent extensions for telemetry libraries. | [workleap-telemetry](https://workleap.github.io/wl-telemetry/introduction/use-with-agents/#install-agent-skill) | - |
Agent extensions for logging libraries. | [workleap-logging](https://workleap.github.io/wl-logging/introduction/use-with-agents/#install-agent-skill) | - |
Agent extensions for Hopper. | - | [hopper.workleap.design/mcp](https://hopper.workleap.design/getting-started/ai-for-agents/mcp-server) |
Agent extension for React Aria. | [adobe/com/react-aria](https://skills.sh/adobe/com/react-aria) | - |
Performance optimization based on Lighthouse performance audits. Focuses on loading speed, runtime efficiency, and resource optimization. | [web-quality-skills/performance](https://skills.sh/addyosmani/web-quality-skills/performance) | - |
Targeted optimization for the three Core Web Vitals metrics that affect Google Search ranking and user experience. | [web-quality-skills/core-web-vitals](https://skills.sh/addyosmani/web-quality-skills/core-web-vitals) | - |
Modern web development standards based on Lighthouse best practices audits. Covers security, browser compatibility, and code quality patterns. | [web-quality-skills/best-practices](https://skills.sh/addyosmani/web-quality-skills/best-practices) | - |
Comprehensive accessibility guidelines based on [WCAG 2.1](https://www.w3.org/TR/WCAG21/) and Lighthouse accessibility audits. | [web-quality-skills/accessibility](https://skills.sh/addyosmani/web-quality-skills/accessibility) | - |
Turborepo best practices | [vercel/turborepo](https://skills.sh/vercel/turborepo/turborepo) | - |

### Code review extensions

Description | Agent skill | MCP {.agent-extensions}
---  | --- | ---
Agent extension for Squide. | [workleap-squide](https://workleap.github.io/wl-squide/introduction/use-with-agents/#install-agent-skill) | - |
Agent extension for web configs libraries. | [workleap-web-configs](https://workleap.github.io/wl-web-configs/introduction/use-with-agents/#install-agent-skills) | - |
Agent extension for telemetry libraries. | [workleap-telemetry](https://workleap.github.io/wl-telemetry/introduction/use-with-agents/#install-agent-skill) | - |
Agent extension for logging libraries. | [workleap-logging](https://workleap.github.io/wl-logging/introduction/use-with-agents/#install-agent-skill) | - |
Agent extension for React Aria. | [adobe/com/react-aria](https://skills.sh/adobe/com/react-aria) | - |
Performance optimization based on Lighthouse performance audits. Focuses on loading speed, runtime efficiency, and resource optimization. | [web-quality-skills/performance](https://skills.sh/addyosmani/web-quality-skills/performance) | - |
Targeted optimization for the three Core Web Vitals metrics that affect Google Search ranking and user experience. | [web-quality-skills/core-web-vitals](https://skills.sh/addyosmani/web-quality-skills/core-web-vitals) | - |
Modern web development standards based on Lighthouse best practices audits. Covers security, browser compatibility, and code quality patterns. | [web-quality-skills/best-practices](https://skills.sh/addyosmani/web-quality-skills/best-practices) | - |
Comprehensive accessibility guidelines based on [WCAG 2.1](https://www.w3.org/TR/WCAG21/) and Lighthouse accessibility audits. | [web-quality-skills/accessibility](https://skills.sh/addyosmani/web-quality-skills/accessibility) | - |
Turborepo best practices | [vercel/turborepo](https://skills.sh/vercel/turborepo/turborepo) | - |

### Debug & inspection extensions

Description | Agent skill | MCP {.agent-extensions}
---  | --- | ---
Let agents control and inspect a live Chrome browser. Useful for automation, in-depth debugging, and performance analysis. | - | [chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp?tab=readme-ov-file#getting-started) |

### Audit extensions

Description | Agent skill | MCP {.agent-extensions}
---  | --- | ---
Comprehensive quality review based on Google Lighthouse audits. Covers performance, accessibility, SEO, and best practices. | [web-quality-skills/web-quality-audit](https://skills.sh/addyosmani/web-quality-skills/web-quality-audit) | - |
Workleap Chromatic best practices | [workleap-chromatic-best-practices](https://workleap.github.io/wl-web-configs/introduction/use-with-agents/#install-agent-skills) | - |





