#!/usr/bin/env tsx
/**
 * CMDetect Bug Crawler
 *
 * Playwright-based crawler that visits every page, listens for errors,
 * and optionally stress-tests with gremlins.js.
 *
 * Usage:
 *   npx tsx crawl.ts                  # headless crawl
 *   npx tsx crawl.ts --headed         # watch the browser
 *   npx tsx crawl.ts --gremlins       # add random interaction testing
 *   npx tsx crawl.ts --max-pages 50   # limit pages per role
 */

import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { CrawlOptions, UserConfig, CrawlResult } from "./lib/types.js";
import { checkAuthServer } from "./lib/auth.js";
import { crawlAsUser, setupKeys } from "./lib/crawler.js";
import { getSeedRoutes } from "./lib/routes.js";
import { buildReport, printReport, saveJsonReport } from "./lib/reporter.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const hasFlag = (flag: string) => args.includes(flag);
const getFlagValue = (flag: string, defaultVal: string) => {
  const idx = args.indexOf(flag);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : defaultVal;
};

// ---------------------------------------------------------------------------
// Load env from repo root
// ---------------------------------------------------------------------------

function loadEnv() {
  const repoRoot = resolve(__dirname, "../..");
  try {
    const envFile = readFileSync(resolve(repoRoot, ".env"), "utf-8");
    for (const line of envFile.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx < 0) continue;
      const key = trimmed.slice(0, eqIdx);
      const value = trimmed.slice(eqIdx + 1).replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // No .env file — rely on env vars
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  loadEnv();

  const options: CrawlOptions = {
    gremlins: hasFlag("--gremlins"),
    headless: !hasFlag("--headed"),
    maxPages: parseInt(getFlagValue("--max-pages", "100"), 10),
    baseUrl: process.env.CRAWLER_BASE_URL || "http://localhost:3000",
    authServerUrl: process.env.AUTH_SERVER_URL || "http://localhost:3001",
    hasuraUrl: process.env.HASURA_API_URL || "http://localhost:8080",
    hasuraAdminSecret:
      process.env.HASURA_GRAPHQL_ADMIN_SECRET || "myadminsecretkey",
    settleTimeMs: parseInt(getFlagValue("--settle", "2000"), 10),
  };

  console.log("CMDetect Bug Crawler");
  console.log("=".repeat(40));
  console.log(`  Base URL:   ${options.baseUrl}`);
  console.log(`  Auth:       ${options.authServerUrl}`);
  console.log(`  Hasura:     ${options.hasuraUrl}`);
  console.log(`  Headless:   ${options.headless}`);
  console.log(`  Gremlins:   ${options.gremlins}`);
  console.log(`  Max pages:  ${options.maxPages}/role`);

  // Health checks
  console.log("\nPreflight checks...");

  const authOk = await checkAuthServer(options.authServerUrl);
  if (!authOk) {
    console.error(
      `  Auth server not reachable at ${options.authServerUrl}` +
        "\n  Run: docker compose up -d"
    );
    process.exit(1);
  }
  console.log("  Auth server: OK");

  try {
    const hasuraResp = await fetch(`${options.hasuraUrl}/healthz`);
    if (!hasuraResp.ok) throw new Error();
    console.log("  Hasura:      OK");
  } catch {
    console.error(
      `  Hasura not reachable at ${options.hasuraUrl}` +
        "\n  Run: docker compose up -d"
    );
    process.exit(1);
  }

  // Test org ID (org1 from test-utils)
  const testOrgId = "11111111-1111-1111-1111-111111111111";

  // Key setup
  console.log("\nSetting up encryption keys...");
  try {
    await setupKeys(testOrgId, options);
  } catch (err) {
    console.error(
      `  Key setup failed: ${err instanceof Error ? err.message : err}` +
        "\n  Ensure test users are seeded: pnpm --filter @cmdetect/auth-server seed:users"
    );
    process.exit(1);
  }

  // Define crawl users
  const users: UserConfig[] = [
    {
      email: "admin1@test.com",
      password: "testPassword123!",
      role: "org_admin",
      seedRoutes: getSeedRoutes("org_admin"),
    },
    {
      email: "doctor1@test.com",
      password: "testPassword123!",
      role: "physician",
      seedRoutes: getSeedRoutes("physician"),
    },
    {
      email: "reception1@test.com",
      password: "testPassword123!",
      role: "receptionist",
      seedRoutes: getSeedRoutes("receptionist"),
    },
  ];

  // Launch browser
  const browser = await chromium.launch({ headless: options.headless });

  const startedAt = new Date();
  const allResults: Array<{ role: string; pages: CrawlResult[] }> = [];

  // Crawl as each role sequentially
  for (const user of users) {
    console.log(`\nCrawling as ${user.role}...`);
    try {
      const pages = await crawlAsUser(browser, user, options);
      allResults.push({ role: user.role, pages });
    } catch (err) {
      console.error(
        `  Crawl failed for ${user.role}: ${err instanceof Error ? err.message : err}`
      );
      allResults.push({ role: user.role, pages: [] });
    }
  }

  const finishedAt = new Date();
  await browser.close();

  // Report
  const report = buildReport(allResults, startedAt, finishedAt);
  printReport(report);
  saveJsonReport(report);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
