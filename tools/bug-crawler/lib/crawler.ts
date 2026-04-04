import type { Browser, BrowserContext, Page } from "playwright";
import type { CrawlOptions, CrawlResult, UserConfig } from "./types.js";
import { authenticate } from "./auth.js";
import { deriveTestKeys, ensureOrganizationKeys, injectPrivateKey } from "./key-setup.js";
import { ErrorCollector } from "./error-collector.js";
import { unleashGremlins } from "./gremlins.js";

/**
 * Crawls the app as a specific user role. Visits seed routes,
 * discovers links, collects errors from each page.
 */
export async function crawlAsUser(
  browser: Browser,
  user: UserConfig,
  options: CrawlOptions
): Promise<CrawlResult[]> {
  console.log(`\n  Authenticating as ${user.role} (${user.email})...`);

  const auth = await authenticate(
    user.email,
    user.password,
    options.authServerUrl
  );

  // Derive test keys for key-setup bypass
  const keys = await deriveTestKeys();

  // Create browser context with session cookie
  const context = await browser.newContext();
  await context.addCookies([
    {
      name: "better-auth.session_token",
      value: auth.sessionCookie,
      domain: new URL(options.baseUrl).hostname,
      path: "/",
    },
  ]);

  const page = await context.newPage();

  // Navigate to the app origin first, then inject private key into IndexedDB
  await page.goto(`${options.baseUrl}/login`, {
    waitUntil: "domcontentloaded",
    timeout: 15000,
  });
  await injectPrivateKey(page, keys.privateKeyPem);

  // Crawl
  const visited = new Set<string>();
  const queue = [...user.seedRoutes];
  const results: CrawlResult[] = [];
  const collector = new ErrorCollector();

  while (queue.length > 0 && visited.size < options.maxPages) {
    const route = queue.shift()!;
    const fullUrl = `${options.baseUrl}${route}`;

    if (visited.has(route)) continue;
    visited.add(route);

    const result = await visitPage(
      page,
      fullUrl,
      collector,
      options
    );
    results.push(result);

    // Add newly discovered links to queue
    for (const link of result.discoveredLinks) {
      if (!visited.has(link) && !queue.includes(link)) {
        queue.push(link);
      }
    }

    const errCount = result.errors.length;
    const status = errCount > 0 ? `${errCount} issues` : "clean";
    console.log(
      `    ${route} (${result.loadTimeMs}ms) — ${status}`
    );
  }

  await context.close();
  return results;
}

async function visitPage(
  page: Page,
  url: string,
  collector: ErrorCollector,
  options: CrawlOptions
): Promise<CrawlResult> {
  collector.clear();
  collector.attach(page, url);

  const start = Date.now();

  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    // Wait for the app to settle (data fetching, renders)
    await page.waitForTimeout(options.settleTimeMs);
  } catch (err) {
    // Navigation timeout or crash — record it, continue crawling
    collector.getErrors(); // errors already captured by listeners
  }

  const loadTimeMs = Date.now() - start;

  // Discover links on the page
  const discoveredLinks = await discoverLinks(page, options.baseUrl);

  // Optional gremlins phase
  if (options.gremlins) {
    collector.setSource("gremlins");
    try {
      await unleashGremlins(page, 5000);
    } catch {
      // gremlins failure is not a crawl error
    }
    collector.setSource("load");
  }

  const errors = collector.getErrors();
  collector.detach(page);

  return { url, errors, discoveredLinks, loadTimeMs };
}

async function discoverLinks(
  page: Page,
  baseUrl: string
): Promise<string[]> {
  try {
    const origin = new URL(baseUrl).origin;

    const hrefs = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a[href]"))
        .map((a) => a.getAttribute("href"))
        .filter(Boolean)
    );

    const links: string[] = [];
    const seen = new Set<string>();

    for (const href of hrefs as string[]) {
      let pathname: string;

      if (href.startsWith("/")) {
        pathname = href;
      } else if (href.startsWith(origin)) {
        pathname = new URL(href).pathname;
      } else {
        continue; // external link or anchor
      }

      // Strip hash and query
      pathname = pathname.split("#")[0].split("?")[0];

      // Skip empty, login, or already-seen
      if (!pathname || pathname === "/" || pathname === "/login") continue;
      if (seen.has(pathname)) continue;
      seen.add(pathname);

      links.push(pathname);
    }

    return links;
  } catch {
    return [];
  }
}

/**
 * One-time setup: ensures the test organization has the crawler's
 * deterministic key pair. Call once before all crawl sessions.
 */
export async function setupKeys(
  orgId: string,
  options: CrawlOptions
): Promise<void> {
  const keys = await deriveTestKeys();
  await ensureOrganizationKeys(
    orgId,
    options.hasuraUrl,
    options.hasuraAdminSecret,
    keys.publicKeyPem,
    keys.fingerprint
  );
  console.log(`  Organization key set (fingerprint: ${keys.fingerprint})`);
}
