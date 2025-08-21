import jwt from 'jsonwebtoken';
import { UserJWTPayload } from './types';

/**
 * Verifies and decodes a user JWT token from Authorization header
 * Returns the decoded payload for role validation
 */
export function verifyUserJWT(authHeader: string): UserJWTPayload {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid authorization header format. Expected: Bearer <token>');
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix
  const privateKey = process.env.JWT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('JWT_PRIVATE_KEY environment variable is required');
  }

  try {
    // Note: For proper JWT verification, we should use the public key
    // but since we only have the private key, we'll use it for verification
    // In production, consider adding JWT_PUBLIC_KEY for verification
    const decoded = jwt.verify(token, privateKey, { 
      algorithms: ['RS256'],
      issuer: 'cmdetect-auth-server'
    }) as UserJWTPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error(`Invalid JWT token: ${error.message}`);
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('JWT token has expired');
    }
    throw new Error(`JWT verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates that user belongs to the specified organization
 */
export function validateOrganizationAccess(
  payload: UserJWTPayload, 
  requestedOrgId: string
): boolean {
  const userOrgId = payload['https://hasura.io/jwt/claims']['x-hasura-organization-id'];
  return userOrgId === requestedOrgId;
}

/**
 * Gets user roles from JWT payload
 */
export function getUserRoles(payload: UserJWTPayload): string[] {
  return payload['https://hasura.io/jwt/claims']['x-hasura-allowed-roles'];
}

/**
 * Checks if user has a specific role
 */
export function hasRole(payload: UserJWTPayload, role: string): boolean {
  const userRoles = getUserRoles(payload);
  return userRoles.includes(role);
}