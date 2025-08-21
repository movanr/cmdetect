import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";
import { sendEmail } from "./email";
import dotenv from "dotenv";

dotenv.config();

// Type definition for user metadata structure
// Expected metadata structure:
// {
//   roles: ['org_admin', 'physician'],
//   organizationId: 'uuid',
//   practitionerId: 'uuid' // optional
// }
interface UserMetadata {
  roles?: string[];
  organizationId?: string;
  practitionerId?: string;
}

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL!,
  }),

  // Better Auth session secret (separate from JWT signing key)
  secret: process.env.BETTER_AUTH_SECRET!,

  // Plugins
  plugins: [
    // JWT Configuration for Hasura with custom claims
    jwt({
      jwt: {
        issuer: "cmdetect-auth-server",
        audience: "hasura",
        expirationTime: "8h", // Longer session for healthcare workflow
        definePayload: ({ user }) => {
          // Parse user metadata for roles and organization info
          let metadata: UserMetadata = {};
          try {
            metadata = user.metadata
              ? JSON.parse(user.metadata as string)
              : {};
          } catch {
            metadata = {};
          }

          // Validate roles array and apply hierarchy
          const roleHierarchy = ["org_admin", "physician", "receptionist"];
          const userRoles =
            metadata.roles?.filter((role) => roleHierarchy.includes(role)) ||
            [];

          if (userRoles.length > 0 && metadata?.organizationId) {
            // User has valid metadata with roles
            const defaultRole =
              roleHierarchy.find((role) => userRoles.includes(role)) ||
              userRoles[0];

            const claims: Record<string, any> = {
              "x-hasura-default-role": defaultRole,
              "x-hasura-allowed-roles": userRoles,
              "x-hasura-user-id": user.id,
              "x-hasura-organization-id": metadata.organizationId,
            };

            // Only add practitioner-id if it exists
            if (metadata.practitionerId) {
              claims["x-hasura-practitioner-id"] = metadata.practitionerId;
            }

            return {
              ...user,
              "https://hasura.io/jwt/claims": claims,
            };
          } else {
            // User exists but no valid metadata - limited access
            return {
              ...user,
              "https://hasura.io/jwt/claims": {
                "x-hasura-default-role": "unverified",
                "x-hasura-allowed-roles": ["unverified"],
                "x-hasura-user-id": user.id,
              },
            };
          }
        },
      },
    }),
  ],

  // Email verification configuration
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "E-Mail-Adresse bestätigen - CMDetect",
        html: `
          <h2>E-Mail-Adresse bestätigen</h2>
          <p>Hallo ${user.name || user.email},</p>
          <p>Bitte klicken Sie auf den unten stehenden Link, um Ihre E-Mail-Adresse zu bestätigen und Ihr CMDetect-Konto zu aktivieren:</p>
          <p><a href="${url}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">E-Mail bestätigen</a></p>
          <p>Falls der Link nicht funktioniert, kopieren Sie diese URL und fügen Sie sie in Ihren Browser ein:</p>
          <p>${url}</p>
          <p>Dieser Bestätigungslink läuft in 24 Stunden ab.</p>
          <p>Falls Sie dieses Konto nicht erstellt haben, ignorieren Sie diese E-Mail.</p>
          <hr>
          <small>Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.</small>
        `,
        text: `Hallo ${user.name || user.email},

Bitte bestätigen Sie Ihre E-Mail-Adresse, indem Sie auf diesen Link klicken: ${url}

Dieser Link läuft in 24 Stunden ab.

Falls Sie dieses Konto nicht erstellt haben, ignorieren Sie diese E-Mail.`,
      });
    },
    sendOnSignUp: false, // Manual verification - admin creates accounts first
    autoSignInAfterVerification: true, // Smooth workflow after verification
    expiresIn: 86400, // 24 hours - more reasonable for business workflow
  },


  // Authentication providers
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // Required for multi-tenant security
  },

  // User metadata support for roles and organization info
  user: {
    additionalFields: {
      metadata: {
        type: "string",
        required: false,
      },
    },
  },
});
