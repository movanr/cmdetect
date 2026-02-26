/**
 * Error handling utilities for consistent API responses
 */

import type { Context } from 'hono';

export interface ApiError {
  success: false;
  error: string;
}

export interface ApiSuccess {
  success: true;
  [key: string]: unknown;
}

export type ApiResponse = ApiSuccess | ApiError;

/**
 * Sends a standardized error response for Hasura actions
 */
export function sendActionError(c: Context, error: string): Response {
  return c.json({ success: false, error });
}

/**
 * Sends a standardized success response for Hasura actions
 */
export function sendActionSuccess(c: Context, data: Record<string, unknown>): Response {
  return c.json({ success: true, ...data });
}

/**
 * Sends a standardized HTTP error response
 */
export function sendHttpError(c: Context, statusCode: number, error: string): Response {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return c.json({ error }, statusCode as any);
}

/**
 * Sends a standardized HTTP success response
 */
export function sendHttpSuccess(c: Context, data: Record<string, unknown>): Response {
  return c.json(data);
}
