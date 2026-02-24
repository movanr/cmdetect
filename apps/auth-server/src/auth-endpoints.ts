/**
 * Authentication endpoint handlers
 */

import type { Context } from 'hono';
import { DatabaseService } from './database.js';
import { toValidatedRole, toOrganizationUserId } from './validation.js';
import { sendHttpError, sendHttpSuccess } from './errors.js';
import { auth } from './auth.js';

export class AuthEndpoints {
  constructor(private db: DatabaseService) {}

  /**
   * Handles role switching requests
   */
  async switchRole(c: Context): Promise<Response> {
    const { role } = await c.req.json();

    const validatedRole = toValidatedRole(role);
    if (!validatedRole) {
      return sendHttpError(c, 400, "Invalid role");
    }

    // Get current session using Better Auth
    const sessionResult = await auth.api.getSession({
      headers: c.req.raw.headers
    });

    if (!sessionResult || !sessionResult.user) {
      return sendHttpError(c, 401, "Invalid session");
    }

    const user = sessionResult.user;
    const userRoles = (user.roles as string[]) || [];

    // Validate that user has the requested role
    if (!userRoles.includes(validatedRole)) {
      return sendHttpError(c, 403, `You don't have permission to switch to role: ${validatedRole}`);
    }

    // Update user's active role in database
    await this.db.updateUserActiveRole(toOrganizationUserId(user.id), validatedRole);

    console.log(`User ${user.email} switched to role: ${validatedRole}`);

    return sendHttpSuccess(c, {
      success: true,
      activeRole: validatedRole,
      availableRoles: userRoles,
      message: "Role switched successfully. Please refresh your session to get a new token."
    });
  }
}
