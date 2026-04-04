import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { CrawlReport, CrawlResult } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function printReport(report: CrawlReport) {
  const { totalPages, totalErrors, totalWarnings, totalHttpErrors } = report;

  console.log("\n" + "=".repeat(60));
  console.log("  CMDetect Bug Crawler Report");
  console.log("=".repeat(60));
  console.log(
    `  Crawled: ${totalPages} pages | Errors: ${totalErrors} | Warnings: ${totalWarnings} | HTTP errors: ${totalHttpErrors}`
  );
  console.log(
    `  Duration: ${new Date(report.startedAt).toLocaleTimeString()} — ${new Date(report.finishedAt).toLocaleTimeString()}`
  );
  console.log("");

  for (const roleResult of report.results) {
    const pagesWithIssues = roleResult.pages.filter(
      (p) => p.errors.length > 0
    );
    const cleanPages = roleResult.pages.filter((p) => p.errors.length === 0);

    console.log(`--- ${roleResult.role} (${roleResult.pages.length} pages) ---`);

    if (pagesWithIssues.length === 0) {
      console.log("  All pages clean!");
    } else {
      for (const page of pagesWithIssues) {
        const errors = page.errors.filter(
          (e) =>
            e.type === "console-error" ||
            e.type === "uncaught-exception" ||
            e.type === "crash"
        );
        const warnings = page.errors.filter(
          (e) => e.type === "console-warning"
        );
        const httpErrors = page.errors.filter(
          (e) => e.type === "http-error" || e.type === "network-error"
        );

        const parts: string[] = [];
        if (errors.length > 0) parts.push(`${errors.length} errors`);
        if (warnings.length > 0) parts.push(`${warnings.length} warnings`);
        if (httpErrors.length > 0)
          parts.push(`${httpErrors.length} network issues`);

        const path = new URL(page.url).pathname;
        console.log(`\n  ${path} (${parts.join(", ")})`);

        for (const err of page.errors) {
          const prefix = getPrefix(err.type, err.statusCode);
          const sourceTag = err.source === "gremlins" ? " [gremlins]" : "";
          const msg =
            err.message.length > 120
              ? err.message.slice(0, 120) + "..."
              : err.message;
          console.log(`    ${prefix}${sourceTag} ${msg}`);
        }
      }
    }

    if (cleanPages.length > 0) {
      const paths = cleanPages
        .map((p) => new URL(p.url).pathname)
        .join(", ");
      console.log(`\n  Clean (${cleanPages.length}): ${paths}`);
    }
    console.log("");
  }

  console.log("=".repeat(60));
}

function getPrefix(
  type: string,
  statusCode?: number
): string {
  switch (type) {
    case "console-error":
      return "[ERROR]";
    case "console-warning":
      return "[WARN]";
    case "uncaught-exception":
      return "[EXCEPTION]";
    case "crash":
      return "[CRASH]";
    case "http-error":
      return `[HTTP ${statusCode}]`;
    case "network-error":
      return "[NET FAIL]";
    default:
      return `[${type}]`;
  }
}

export function saveJsonReport(report: CrawlReport) {
  const reportPath = join(__dirname, "..", "report.json");
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`JSON report saved to: ${reportPath}`);
}

export function buildReport(
  results: Array<{ role: string; pages: CrawlResult[] }>,
  startedAt: Date,
  finishedAt: Date
): CrawlReport {
  let totalPages = 0;
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalHttpErrors = 0;

  for (const roleResult of results) {
    totalPages += roleResult.pages.length;
    for (const page of roleResult.pages) {
      for (const err of page.errors) {
        if (
          err.type === "console-error" ||
          err.type === "uncaught-exception" ||
          err.type === "crash"
        ) {
          totalErrors++;
        } else if (err.type === "console-warning") {
          totalWarnings++;
        } else {
          totalHttpErrors++;
        }
      }
    }
  }

  return {
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    totalPages,
    totalErrors,
    totalWarnings,
    totalHttpErrors,
    results,
  };
}
