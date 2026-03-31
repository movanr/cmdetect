/**
 * Provision a new test practice with organization, users, and demo cases.
 *
 * Usage:
 *   npx tsx scripts/provision-practice.ts "Praxis Dr. Müller" email1@example.com email2@example.com email3@example.com
 *
 * Creates:
 *   - Organization with given name
 *   - First email as org_admin + physician
 *   - Remaining emails as physician
 *   - All users get password: TestPassword123!
 *
 * Then run ./scripts/seed-demo-cases.sh <org_id> to add demo cases.
 */

import { betterAuth } from "better-auth";
import { roles } from "@cmdetect/config";
import dotenv from "dotenv";
import { resolve } from "path";
import { Pool } from "pg";
import { execSync } from "child_process";

dotenv.config({ path: resolve(__dirname, "../.env") });

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

const DEFAULT_PASSWORD = "TestPassword123!";

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error("Usage: npx tsx scripts/provision-practice.ts <practice-name> <email1> [email2] [email3] ...");
    console.error('Example: npx tsx scripts/provision-practice.ts "Praxis Dr. Müller" mueller@praxis.de mfa1@praxis.de');
    process.exit(1);
  }

  const practiceName = args[0];
  const emails = args.slice(1);

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
    console.log(`\n👥 Creating ${emails.length} user(s)...`);

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const isFirst = i === 0;
      const userRoles = isFirst
        ? [roles.ORG_ADMIN, roles.PHYSICIAN]
        : [roles.PHYSICIAN];
      const name = isFirst
        ? `Admin ${practiceName}`
        : `Behandler ${i + 1}`;

      console.log(`\n   📧 ${email} (${isFirst ? "Admin + Arzt" : "Arzt"})`);

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
      execSync(`./scripts/seed-demo-cases.sh ${orgId}`, {
        stdio: "inherit",
        cwd: resolve(__dirname, ".."),
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
    emails.forEach((email, i) => {
      console.log(`   ${i === 0 ? "👑" : "👤"} ${email} — ${i === 0 ? "Admin + Arzt" : "Arzt"}`);
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
