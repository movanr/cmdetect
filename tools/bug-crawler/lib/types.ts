export type ErrorType =
  | "console-error"
  | "console-warning"
  | "uncaught-exception"
  | "crash"
  | "network-error"
  | "http-error";

export type ErrorSource = "load" | "gremlins";

export interface CrawlError {
  url: string;
  timestamp: number;
  type: ErrorType;
  message: string;
  source: ErrorSource;
  statusCode?: number;
}

export interface CrawlResult {
  url: string;
  errors: CrawlError[];
  discoveredLinks: string[];
  loadTimeMs: number;
}

export interface UserConfig {
  email: string;
  password: string;
  role: string;
  seedRoutes: string[];
}

export interface CrawlOptions {
  gremlins: boolean;
  headless: boolean;
  maxPages: number;
  baseUrl: string;
  authServerUrl: string;
  hasuraUrl: string;
  hasuraAdminSecret: string;
  settleTimeMs: number;
}

export interface CrawlReport {
  startedAt: string;
  finishedAt: string;
  totalPages: number;
  totalErrors: number;
  totalWarnings: number;
  totalHttpErrors: number;
  results: Array<{
    role: string;
    pages: CrawlResult[];
  }>;
}
