---
order: 200
---

# Use loggers

Most of Workleap's frontend platform libraries can produce meaningful logs when provided with logger instances. Once configured, these libraries use a five-level logging system: `debug`, `information`, `warning`, `error`, and `critical`.

The following libraries integrate with loggers that implement the RootLogger interface :point_down:

Name | Documentation
---  | ---
Squide | [Guide](https://workleap.github.io/wl-squide/guides/use-loggers/)
Platform widgets | [Guide](https://dev.azure.com/workleap/WorkleapPlatform/_git/workleap-platform-widgets?path=/docs/user/usage/loggers.md&_a=preview)
Telemetry | [Reference](https://workleap.github.io/wl-telemetry/introduction/reference/initializetelemetry/#loggers)
LogRocket | [Reference](https://workleap.github.io/wl-telemetry/logrocket/reference/registerlogrocketinstrumentation/#loggers)
Honeycomb | [Reference](https://workleap.github.io/wl-telemetry/honeycomb/reference/registerhoneycombinstrumentation/#loggers)
Mixpanel | [Reference](https://workleap.github.io/wl-telemetry/mixpanel/reference/initializemixpanel/#loggers)
Common Room | [Reference](https://workleap.github.io/wl-telemetry/common-room/reference/registercommonroominstrumentation/#loggers)

## Log levels

A logger can output log entries with different levels: `debug`, `information`, `warning`, `error`, `critical`. This allows to filter logs according to a minimum severity:

```ts !#4
import { BrowserConsoleLogger, LogLevel } from "@workleap/logging";

const logger = new BrowserConsoleLogger({
    logLevel: LogLevel.error
});
```

In the previous example, the logger instance would process only `error` and `critical` entries :point_up:. 

For development environments, we generally recommend setting the minimum severity to `debug`. For production environments, we recommend setting the minimum severity to `information`. The `information` level provides a good balance as it is detailed enough for basic troubleshooting, while reducing noise in production.

For reference, here's a description of each level:

### Debug

- Very detailed, often verbose, logs used mainly during development.
- _Example: API request/response bodies, lifecycle hooks, variable state._

### Information

- General events that show the normal flow of the application.
- _Example: User login, component mounted, scheduled task started._

### Warning

- Non-critical issues that might need attention but don't break functionality.
- _Example: Deprecated API usage, retries after a failed network call._

### Error

- Failures that prevent part of the system from working as intended.
- _Example: Unhandled exceptions, failed database query, API call failed with 500._

### Critical

- Severe errors that cause the application to stop functioning or risk data integrity.
- _Example: Application crash, loss of critical service connection._

## Example

The following example shows how to integrate loggers into a Squide application (loggers are also supported in both React and non-React applications):

```tsx !#12,30,34,39 index.tsx
import { createRoot } from "react-dom/client";
import { initializeWidgets } from "@workleap-widgets/squide-firefly";
import { initializeFirefly, FireflyProvider } from "@squide/firefly";
import { BrowserConsoleLogger, LogLevel, type RootLogger } from "@workleap/logging";
import { LogRocketLogger, } from "@workleap/logrocket";
import { initializeTelemetry, TelemetryProvider } from "@workleap/telemetry/react";
import { registerCommonRoomInstrumentation } from "@workleap/common-room/react";

// Do not do this, it's only for demo purpose.
const isDev = process.env === "development";

const loggers: RootLogger[] = [isDev ? new BrowserConsoleLogger() : new LogRocketLogger(LogLevel.information)];

const telemetryClient = initializeTelemetry({
    logRocket: {
        appId: "my-app-id"
    },
    honeycomb: {
        namespace: "sample",
        serviceName: "my-app",
        apiServiceUrls: [/.+/g],
        options: {
            proxy: "https://sample-proxy"
        }
    },
    mixpanel: {
        productId: "wlp",
        envOrTrackingApiBaseUrl: "development"
    },
    loggers
});

registerCommonRoomInstrumentation("my-site-id", {
    loggers
});

// IMPORTANT: Squide loggers are propagated to platform widgets under the hood.
const fireflyRuntime = initializeFirefly({
    loggers
});

const widgetsRuntime = initializeWidgets(fireflyRuntime, "wlp", "development", {
    colorScheme: "light",
    language: "en-US",
    widgets: {
        fte: {
            invitationModal: true
        }
    }
});

const root = createRoot(document.getElementById("root")!);

root.render(
    <FireflyProvider runtime={runtime}>
        <TelemetryProvider client={telemetryClient}>
            <App />
        </TelemetryProvider>
    </FireflyProvider>
);
```

!!!tip
Create the `LogRocketLogger` instance with a minimum log level of `LogLevel.information` to reduce noise in production environments.
!!!

## Troubleshoot a production issue

To troubleshoot an issue in production, remove the `LogLevel` from the `LogRocketLogger` constructor options and set the `verbose` option to `true` when applicable:

```tsx !#12,30,35,52 index.tsx
import { createRoot } from "react-dom/client";
import { initializeWidgets } from "@workleap-widgets/squide-firefly";
import { initializeFirefly, FireflyProvider } from "@squide/firefly";
import { BrowserConsoleLogger, type RootLogger } from "@workleap/logging";
import { LogRocketLogger, } from "@workleap/logrocket";
import { initializeTelemetry, TelemetryProvider } from "@workleap/telemetry/react";
import { registerCommonRoomInstrumentation } from "@workleap/common-room/react";

// Do not do this, it's only for demo purpose.
const isDev = process.env === "development";

const loggers: RootLogger[] = [isDev ? new BrowserConsoleLogger() : new LogRocketLogger()];

const telemetryClient = initializeTelemetry({
    logRocket: {
        appId: "my-app-id"
    },
    honeycomb: {
        namespace: "sample",
        serviceName: "my-app",
        apiServiceUrls: [/.+/g],
        options: {
            proxy: "https://sample-proxy"
        }
    },
    mixpanel: {
        productId: "wlp",
        envOrTrackingApiBaseUrl: "development"
    },
    verbose: true,
    loggers
});

registerCommonRoomInstrumentation("my-site-id", {
    verbose: true,
    loggers
});

// IMPORTANT: Squide loggers are propagated to platform widgets under the hood.
const fireflyRuntime = initializeFirefly({
    loggers
});

const widgetsRuntime = initializeWidgets(fireflyRuntime, "wlp", "development", {
    colorScheme: "light",
    language: "en-US",
    widgets: {
        fte: {
            invitationModal: true
        }
    },
    verbose: true
});

const root = createRoot(document.getElementById("root")!);

root.render(
    <FireflyProvider runtime={runtime}>
        <TelemetryProvider client={telemetryClient}>
            <App />
        </TelemetryProvider>
    </FireflyProvider>
);
```

## Application logs

Once loggers are configured, Squide applications can write log entries using the [FireflyRuntime](https://workleap.github.io/wl-squide/reference/runtime/runtime-class/) instance:

```ts !#3,5
import { useLogger } from "@squide/firefly";

const logger = useLogger();

logger.debug("Hello!");
```

```ts !#5
import { useRuntime } from "@squide/firefly";

const runtime = useRuntime();

runtime.logger.debug("Hello!");
```

!!!warning
Never log any **Personally Identifiable Information (PII)**.

API responses frequently contain sensitive user data such as names, email addresses, phone numbers, or IDs. Remove all logs outputting API response before deploying to production, as these can expose private information that will be included in session replays.

For debugging, use `console.log` instead, since its output is not captured in LogRocket session replays.
!!!
