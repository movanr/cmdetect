/**
 * Authentication endpoint handlers
 */

import type { Context } from 'hono';
import { DatabaseService } from './database.js';
import { validateRoleData } from './validation.js';
import { sendHttpError, sendHttpSuccess } from './errors.js';
import { auth } from './auth.js';

export class AuthEndpoints {
  constructor(private db: DatabaseService) {}

  /**
   * Handles role switching requests
   */
  async switchRole(c: Context): Promise<Response> {
    const { role } = await c.req.json();

    // Validate role data
    const roleValidation = validateRoleData(role);
    if (!roleValidation.valid) {
      return sendHttpError(c, 400, roleValidation.error!);
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
    if (!userRoles.includes(role)) {
      return sendHttpError(c, 403, `You don't have permission to switch to role: ${role}`);
    }

    // Update user's active role in database
    await this.db.updateUserActiveRole(user.id, role);

    console.log(`User ${user.email} switched to role: ${role}`);

    return sendHttpSuccess(c, {
      success: true,
      activeRole: role,
      availableRoles: userRoles,
      message: "Role switched successfully. Please refresh your session to get a new token."
    });
  }
}
