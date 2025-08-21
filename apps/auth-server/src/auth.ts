import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";
import { sendEmail } from "./email";
import { v4 as uuidv4 } from 'uuid';
import dotenv from "dotenv";

dotenv.config();

// Better Auth user will now have these fields directly instead of JSON metadata

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL!,
  }),

  // Better Auth session secret (separate from JWT signing key)
  secret: process.env.BETTER_AUTH_SECRET!,

  // Configure Better Auth to use UUIDs instead of default string IDs
  advanced: {
    database: {
      generateId: () => uuidv4(),
      // Disable automatic ID generation to let PostgreSQL handle UUIDs
      useNumberId: false,
    },
  },

  // Plugins
  plugins: [
    // JWT Configuration for Hasura with custom claims
    jwt({
      jwt: {
        issuer: "cmdetect-auth-server",
        audience: "hasura",
        expirationTime: "8h", // Longer session for healthcare workflow
        definePayload: ({ user }) => {
          // Validate roles array and apply hierarchy
          const roleHierarchy = ["org_admin", "physician", "receptionist"];
          const userRoles = (user.roles as string[]) || [];
          const validRoles = userRoles.filter((role) => roleHierarchy.includes(role));

          if (validRoles.length > 0 && user.organizationId) {
            // User has valid roles and organization
            const defaultRole =
              roleHierarchy.find((role) => validRoles.includes(role)) ||
              validRoles[0];

            const claims: Record<string, any> = {
              "x-hasura-default-role": defaultRole,
              "x-hasura-allowed-roles": validRoles,
              "x-hasura-user-id": user.id,
              "x-hasura-organization-id": user.organizationId,
            };

            return {
              ...user,
              "https://hasura.io/jwt/claims": claims,
            };
          } else {
            // User exists but no valid roles/organization - limited access
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

  // Extended user schema with healthcare-specific fields
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: false,
      },
      lastName: {
        type: "string",
        required: false,
      },
      roles: {
        type: "string[]",
        required: false,
      },
      organizationId: {
        type: "string", // Better Auth handles UUID as string
        required: false,
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
      },
      deletedAt: {
        type: "date",
        required: false,
      },
    },
  },
});
