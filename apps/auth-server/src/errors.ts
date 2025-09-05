/**
 * Error handling utilities for consistent API responses
 */

import { Response } from 'express';

export interface ApiError {
  success: false;
  error: string;
}

export interface ApiSuccess<T = any> {
  success: true;
  [key: string]: any;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

/**
 * Sends a standardized error response for Hasura actions
 */
export function sendActionError(res: Response, error: string): void {
  res.json({
    success: false,
    error,
  });
}

/**
 * Sends a standardized success response for Hasura actions
 */
export function sendActionSuccess(res: Response, data: Record<string, any>): void {
  res.json({
    success: true,
    ...data,
  });
}

/**
 * Sends a standardized HTTP error response
 */
export function sendHttpError(res: Response, statusCode: number, error: string): void {
  res.status(statusCode).json({
    error,
  });
}

/**
 * Sends a standardized HTTP success response
 */
export function sendHttpSuccess(res: Response, data: Record<string, any>): void {
  res.json(data);
}

/**
 * Generic error handler for async route handlers
 */
export function handleAsyncError(
  handler: (req: any, res: any) => Promise<void>,
  errorMessage: string = "Internal server error"
): (req: any, res: any) => Promise<void> {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error(`Error in ${handler.name}:`, error);
      if (res.headersSent) {
        return;
      }

      // Check if this is a Hasura action (based on request structure)
      if (req.body && req.body.input) {
        sendActionError(res, errorMessage);
      } else {
        sendHttpError(res, 500, errorMessage);
      }
    }
  };
}