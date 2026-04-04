import type { Page, ConsoleMessage, Response, Request } from "playwright";
import type { CrawlError, ErrorSource } from "./types.js";

/**
 * Attaches to a Playwright Page and collects console errors,
 * uncaught exceptions, crashes, and failed network requests.
 */
export class ErrorCollector {
  private errors: CrawlError[] = [];
  private currentUrl = "";
  private source: ErrorSource = "load";
  private handlers: {
    console: (msg: ConsoleMessage) => void;
    pageerror: (error: Error) => void;
    crash: () => void;
    response: (response: Response) => void;
    requestfailed: (request: Request) => void;
  } | null = null;

  attach(page: Page, url: string) {
    this.currentUrl = url;
    this.source = "load";

    const handlers = {
      console: (msg: ConsoleMessage) => {
        const type = msg.type();
        if (type === "error") {
          this.errors.push({
            url: this.currentUrl,
            timestamp: Date.now(),
            type: "console-error",
            message: msg.text(),
            source: this.source,
          });
        } else if (type === "warning") {
          // Skip noisy React dev warnings
          const text = msg.text();
          if (
            text.includes("Download the React DevTools") ||
            text.includes("React does not recognize")
          ) {
            return;
          }
          this.errors.push({
            url: this.currentUrl,
            timestamp: Date.now(),
            type: "console-warning",
            message: text,
            source: this.source,
          });
        }
      },

      pageerror: (error: Error) => {
        this.errors.push({
          url: this.currentUrl,
          timestamp: Date.now(),
          type: "uncaught-exception",
          message: `${error.name}: ${error.message}`,
          source: this.source,
        });
      },

      crash: () => {
        this.errors.push({
          url: this.currentUrl,
          timestamp: Date.now(),
          type: "crash",
          message: "Page crashed",
          source: this.source,
        });
      },

      response: (response: Response) => {
        const status = response.status();
        const responseUrl = response.url();

        // Skip expected auth-related 401s and browser internals
        if (responseUrl.includes("/api/auth/") && status === 401) return;
        if (responseUrl.startsWith("data:")) return;

        if (status >= 400) {
          this.errors.push({
            url: this.currentUrl,
            timestamp: Date.now(),
            type: "http-error",
            message: `${response.request().method()} ${responseUrl}`,
            source: this.source,
            statusCode: status,
          });
        }
      },

      requestfailed: (request: Request) => {
        const failure = request.failure();
        // Skip aborted requests (normal SPA navigation)
        if (failure?.errorText === "net::ERR_ABORTED") return;

        this.errors.push({
          url: this.currentUrl,
          timestamp: Date.now(),
          type: "network-error",
          message: `${request.method()} ${request.url()} — ${failure?.errorText || "unknown"}`,
          source: this.source,
        });
      },
    };

    page.on("console", handlers.console);
    page.on("pageerror", handlers.pageerror);
    page.on("crash", handlers.crash);
    page.on("response", handlers.response);
    page.on("requestfailed", handlers.requestfailed);
    this.handlers = handlers;
  }

  detach(page: Page) {
    if (this.handlers) {
      page.removeListener("console", this.handlers.console);
      page.removeListener("pageerror", this.handlers.pageerror);
      page.removeListener("crash", this.handlers.crash);
      page.removeListener("response", this.handlers.response);
      page.removeListener("requestfailed", this.handlers.requestfailed);
      this.handlers = null;
    }
  }

  setSource(source: ErrorSource) {
    this.source = source;
  }

  getErrors(): CrawlError[] {
    return [...this.errors];
  }

  clear() {
    this.errors = [];
  }
}
