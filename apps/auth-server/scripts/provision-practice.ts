/**
 * Provision a new test practice with organization, users, and demo cases.
 *
 * Usage:
 *   npx tsx scripts/provision-practice.ts "Praxis Dr. Müller" \
 *     --admin admin@praxis.de \
 *     --physician arzt@praxis.de \
 *     --assistant mfa@praxis.de \
 *     --receptionist rezeption@praxis.de
 *
 * Roles:
 *   --admin        org_admin + physician
 *   --physician    physician
 *   --assistant    assistant
 *   --receptionist receptionist
 *
 * All users get password: TestPassword123!
 * Demo cases (BEISPIEL-001/002) are seeded automatically.
 */

import { betterAuth } from "better-auth";
import { roles } from "@cmdetect/config";
import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../../.env") });

const connectionString = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST || "localhost"}:${process.env.POSTGRES_PORT || 5432}/${process.env.POSTGRES_DB}`;

const auth = betterAuth({
  database: new Pool({ connectionString }),
  secret: process.env.BETTER_AUTH_SECRET ?? "",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
});

const pool = new Pool({ connectionString });

const DEFAULT_PASSWORD = "Testpraxis1!";

const ROLE_FLAGS: Record<string, { roles: string[]; label: string }> = {
  "--admin": { roles: [roles.ORG_ADMIN, roles.PHYSICIAN], label: "Admin + Physician" },
  "--physician": { roles: [roles.PHYSICIAN], label: "Physician" },
  "--assistant": { roles: [roles.ASSISTANT], label: "Assistant" },
  "--receptionist": { roles: [roles.RECEPTIONIST], label: "Receptionist" },
};

interface UserSpec {
  email: string;
  userRoles: string[];
  label: string;
}

function parseArgs(args: string[]): { practiceName: string; users: UserSpec[] } {
  if (args.length < 3 || !args[1].startsWith("--")) {
    console.error("Usage: npx tsx scripts/provision-practice.ts <practice-name> --admin email [--physician email] [--assistant email] [--receptionist email]");
    console.error("\nRoles:");
    console.error("  --admin        org_admin + physician");
    console.error("  --physician    physician");
    console.error("  --assistant    assistant");
    console.error("  --receptionist receptionist");
    console.error('\nExample: npx tsx scripts/provision-practice.ts "Praxis Dr. Müller" --admin mueller@praxis.de --assistant mfa1@praxis.de');
    process.exit(1);
  }

  const practiceName = args[0];
  const users: UserSpec[] = [];

  for (let i = 1; i < args.length; i += 2) {
    const flag = args[i];
    const email = args[i + 1];

    if (!ROLE_FLAGS[flag]) {
      console.error(`Unknown flag: ${flag}. Use --admin, --physician, --assistant, or --receptionist`);
      process.exit(1);
    }
    if (!email || email.startsWith("--")) {
      console.error(`Missing email after ${flag}`);
      process.exit(1);
    }

    users.push({
      email,
      userRoles: ROLE_FLAGS[flag].roles,
      label: ROLE_FLAGS[flag].label,
    });
  }

  if (!users.some((u) => u.userRoles.includes(roles.ORG_ADMIN))) {
    console.error("Error: At least one --admin user is required.");
    process.exit(1);
  }

  return { practiceName, users };
}

async function main() {
  const { practiceName, users } = parseArgs(process.argv.slice(2));

  try {
    // 1. Create organization
    console.log(`\n🏢 Creating organization: ${practiceName}`);
    const orgResult = await pool.query(
      `INSERT INTO organization (id, name, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, NOW(), NOW())
       RETURNING id, name`,
      [practiceName]
    );
    const orgId = orgResult.rows[0].id;
    console.log(`   ✅ Organization created: ${orgId}`);

    // 2. Create users
    console.log(`\n👥 Creating ${users.length} user(s)...`);

    for (const { email, userRoles, label } of users) {
      const name = email.split("@")[0];

      console.log(`\n   📧 ${email} (${label})`);

      // Create via Better Auth API (handles password hashing)
      const result = await auth.api.signUpEmail({
        body: { email, password: DEFAULT_PASSWORD, name },
      });

      if (!result?.user) {
        console.log(`   ❌ Failed to create ${email}`);
        continue;
      }

      // Set roles and organization
      await pool.query(
        `UPDATE "user"
         SET "emailVerified" = true,
             roles = $1,
             "organizationId" = $2,
             "isActive" = true
         WHERE id = $3`,
        [JSON.stringify(userRoles), orgId, result.user.id]
      );

      console.log(`   ✅ Created: ${result.user.id}`);
    }

    // 3. Seed demo cases
    console.log("\n📋 Seeding demo cases...");
    try {
      const repoRoot = resolve(__dirname, "../../..");
      execSync(`./scripts/seed-demo-cases.sh ${orgId}`, {
        stdio: "inherit",
        cwd: repoRoot,
      });
    } catch {
      console.log("   ⚠️  Demo case seeding failed (run manually: ./scripts/seed-demo-cases.sh " + orgId + ")");
    }

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("✅ Practice provisioned successfully!");
    console.log("=".repeat(50));
    console.log(`\n🏢 ${practiceName}`);
    console.log(`🆔 Organization ID: ${orgId}`);
    console.log(`🔑 Password (all users): ${DEFAULT_PASSWORD}`);
    console.log("\n👥 Users:");
    users.forEach(({ email, label }) => {
      console.log(`   👤 ${email} — ${label}`);
    });
    console.log("\n💡 Users should change their password after first login.");
    console.log("💡 The admin user needs to set up the encryption key on first login.");
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
