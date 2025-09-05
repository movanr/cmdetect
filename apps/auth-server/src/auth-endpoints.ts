/**
 * Authentication endpoint handlers
 */

import { Request, Response } from 'express';
import { DatabaseService } from './database';
import { validateRoleData } from './validation';
import { sendHttpError, sendHttpSuccess } from './errors';
import { auth } from './auth';

export class AuthEndpoints {
  constructor(private db: DatabaseService) {}

  /**
   * Handles role switching requests
   */
  async switchRole(req: Request, res: Response): Promise<void> {
    const { role } = req.body;

    // Validate role data
    const roleValidation = validateRoleData(role);
    if (!roleValidation.valid) {
      return sendHttpError(res, 400, roleValidation.error!);
    }

    // Get current session using Better Auth
    const sessionResult = await auth.api.getSession({
      headers: new Headers(req.headers as HeadersInit)
    });

    if (!sessionResult || !sessionResult.user) {
      return sendHttpError(res, 401, "Invalid session");
    }

    const user = sessionResult.user;
    const userRoles = (user.roles as string[]) || [];

    // Validate that user has the requested role
    if (!userRoles.includes(role)) {
      return sendHttpError(res, 403, `You don't have permission to switch to role: ${role}`);
    }

    // Update user's active role in database
    await this.db.updateUserActiveRole(user.id, role);

    console.log(`User ${user.email} switched to role: ${role}`);

    sendHttpSuccess(res, {
      success: true,
      activeRole: role,
      availableRoles: userRoles,
      message: "Role switched successfully. Please refresh your session to get a new token."
    });
  }
}