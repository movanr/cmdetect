import dotenv from "dotenv";
import { Pool } from "pg";
import { betterAuth } from "better-auth";
import { roles } from "@cmdetect/config";

dotenv.config();

// Create a minimal Better Auth instance for testing
const testAuth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL!,
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disabled for testing
  },
});

// Initialize database pool for metadata operations
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

// Test organizations from your data
const TEST_ORGANIZATIONS = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Test Medical Practice 1",
    city: "Test City 1",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Test Medical Practice 2",
    city: "Test City 2",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Manual Test Medical Practice",
    city: "Test City 3",
  },
];

interface TestUser {
  email: string;
  password: string;
  name: string;
  roles: string[];
  defaultRole?: string;
  organizationId: string | null;
}

const TEST_USERS: TestUser[] = [
  // Organization 1 users
  {
    email: "admin1@test.com",
    password: "testPassword123!",
    name: "Test Admin One",
    roles: [roles.ORG_ADMIN],
    organizationId: TEST_ORGANIZATIONS[0].id,
  },
  {
    email: "doctor1@test.com",
    password: "testPassword123!",
    name: "Dr. Test Doctor One",
    roles: [roles.PHYSICIAN],
    organizationId: TEST_ORGANIZATIONS[0].id,
  },
  {
    email: "reception1@test.com",
    password: "testPassword123!",
    name: "Test Reception One",
    roles: [roles.RECEPTIONIST],
    organizationId: TEST_ORGANIZATIONS[0].id,
  },

  // Organization 2 users
  {
    email: "admin2@test.com",
    password: "testPassword123!",
    name: "Test Admin Two",
    roles: [roles.ORG_ADMIN],
    organizationId: TEST_ORGANIZATIONS[1].id,
  },
  {
    email: "doctor2@test.com",
    password: "testPassword123!",
    name: "Dr. Test Doctor Two",
    roles: [roles.PHYSICIAN, roles.RECEPTIONIST], // Multi-role example
    defaultRole: roles.PHYSICIAN,
    organizationId: TEST_ORGANIZATIONS[1].id,
  },

  // Organization 3 users - Manual Testing
  {
    email: "admin@test.com",
    password: "TestPassword123!",
    name: "Admin Manual",
    roles: [roles.PHYSICIAN, roles.ORG_ADMIN], // Multi-role: physician + admin
    organizationId: TEST_ORGANIZATIONS[2].id,
  },
  {
    email: "physician@test.com",
    password: "TestPassword123!",
    name: "Dr. Physician Manual",
    roles: [roles.PHYSICIAN, roles.RECEPTIONIST], // Multi-role user for testing
    defaultRole: roles.PHYSICIAN,
    organizationId: TEST_ORGANIZATIONS[2].id,
  },
  {
    email: "receptionist@test.com",
    password: "TestPassword123!",
    name: "Reception Manual",
    roles: [roles.RECEPTIONIST],
    organizationId: TEST_ORGANIZATIONS[2].id,
  },

  // Unverified user (no organization)
  {
    email: "unverified@test.com",
    password: "TestPassword123!",
    name: "Test Unverified",
    roles: [],
    organizationId: null,
  },
];

async function seedAllTestUsers() {
  try {
    console.log("🌱 Creating all test users with Better Auth...");
    console.log("📋 Test Organizations:");
    TEST_ORGANIZATIONS.forEach((org) => {
      console.log(`   - ${org.name} (${org.id})`);
    });

    // Check if any users already exist
    let client = await pool.connect();
    try {
      const existingUsers = await client.query(
        'SELECT email FROM "user" WHERE email = ANY($1)',
        [TEST_USERS.map((u) => u.email)]
      );

      if (existingUsers.rows.length > 0) {
        console.log("⚠️  Some test users already exist:");
        existingUsers.rows.forEach((row) => console.log(`   - ${row.email}`));
        console.log("❌ Please run cleanup first: npm run seed:all:cleanup");
        return;
      }
    } finally {
      client.release();
    }

    // Step 1: Create organizations first
    console.log("\n🏢 Creating test organizations...");
    client = await pool.connect();
    try {
      for (const org of TEST_ORGANIZATIONS) {
        await client.query(
          `INSERT INTO organization (id, name, city, created_at, updated_at) 
           VALUES ($1, $2, $3, NOW(), NOW())
           ON CONFLICT (id) DO NOTHING`,
          [org.id, org.name, org.city]
        );
        console.log(`   ✅ Organization created: ${org.name}`);
      }
    } finally {
      client.release();
    }

    // Step 2: Create test users
    console.log("\n👥 Creating test users...");
    const createdUsers: (TestUser & { userId: string })[] = [];

    for (const userData of TEST_USERS) {
      try {
        console.log(`\n📧 Creating user: ${userData.email}`);

        // Step 1: Create user via Better Auth API
        const signupResult = await testAuth.api.signUpEmail({
          body: {
            email: userData.email,
            password: userData.password,
            name: userData.name,
          },
        });

        if (!signupResult || !signupResult.user) {
          console.log(
            `❌ Failed to create ${userData.email} - no user returned`
          );
          continue;
        }

        console.log(`   ✅ User created with ID: ${signupResult.user.id}`);

        // Step 2: Update user with additional fields directly in the user table
        const updateClient = await pool.connect();
        try {
          // Update the user table columns directly instead of using metadata
          await updateClient.query(
            `UPDATE "user"
             SET "emailVerified" = $1,
                 roles = $2,
                 "organizationId" = $3,
                 "isActive" = $4
             WHERE id = $5`,
            [
              true, // emailVerified
              JSON.stringify(userData.roles), // roles as JSON array
              userData.organizationId, // organizationId
              true, // isActive
              signupResult.user.id,
            ]
          );
          console.log(`   ✅ User fields updated for ${userData.email}`);
        } finally {
          updateClient.release();
        }

        createdUsers.push({
          ...userData,
          userId: signupResult.user.id,
        });
      } catch (error: any) {
        console.log(`❌ Error creating ${userData.email}: ${error.message}`);
      }
    }

    // Test login for one user to verify everything works
    if (createdUsers.length > 0) {
      console.log("\n🧪 Testing login with first created user...");
      const testUser = createdUsers[0];

      try {
        const loginResult = await testAuth.api.signInEmail({
          body: {
            email: testUser.email,
            password: testUser.password,
          },
        });

        if (loginResult && loginResult.user) {
          console.log(`✅ Login test successful for ${testUser.email}`);
        } else {
          console.log(`❌ Login test failed for ${testUser.email}`);
        }
      } catch (error: any) {
        console.log(`❌ Login test error: ${error.message}`);
      }
    }

    console.log("\n🎉 Test user seeding completed successfully!");
    console.log("\n📋 Test Account Summary:");
    console.log("=======================");
    console.log(
      `Created ${createdUsers.length} out of ${TEST_USERS.length} users\n`
    );

    TEST_USERS.forEach((user) => {
      const wasCreated = createdUsers.some((cu) => cu.email === user.email);
      const status = wasCreated ? "✅" : "❌";
      const orgName =
        TEST_ORGANIZATIONS.find((org) => org.id === user.organizationId)
          ?.name || "No Organization";

      console.log(`${status} ${user.email}`);
      console.log(`   🔑 Password: ${user.password}`);
      console.log(`   👤 Name: ${user.name}`);
      console.log(`   🎭 Roles: [${user.roles.join(", ") || "unverified"}]`);
      console.log(`   🏥 Organization: ${orgName}`);
      if (user.organizationId) {
        console.log(`   🆔 Organization ID: ${user.organizationId}`);
      }
      if (user.defaultRole) {
        console.log(`   🎯 Default Role: ${user.defaultRole}`);
      }
      console.log("");
    });

    console.log(
      "💡 You can now use these accounts to test the authentication system"
    );
    console.log("💡 All accounts are pre-verified and ready to use");
  } catch (error) {
    console.error("❌ Error seeding test users:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

async function cleanupAllTestUsers() {
  const client = await pool.connect();

  try {
    console.log("🧹 Cleaning up all test users...");

    // Delete related records in order
    await client.query(
      'DELETE FROM "session" WHERE "userId" IN (SELECT id FROM "user" WHERE email = ANY($1))',
      [TEST_USERS.map((u) => u.email)]
    );
    console.log("✅ Deleted user sessions");

    await client.query(
      'DELETE FROM "account" WHERE "userId" IN (SELECT id FROM "user" WHERE email = ANY($1))',
      [TEST_USERS.map((u) => u.email)]
    );
    console.log("✅ Deleted user accounts");

    // Then delete the users
    const result = await client.query(
      'DELETE FROM "user" WHERE email = ANY($1) RETURNING email',
      [TEST_USERS.map((u) => u.email)]
    );

    console.log(`✅ Deleted ${result.rows.length} test users`);
    result.rows.forEach((row) => console.log(`   - ${row.email}`));

    if (result.rows.length === 0) {
      console.log("⚠️  No test users found to delete");
    }

    // Also clean up test organizations
    const orgResult = await client.query(
      "DELETE FROM organization WHERE id = ANY($1) RETURNING name",
      [TEST_ORGANIZATIONS.map((org) => org.id)]
    );

    console.log(`✅ Deleted ${orgResult.rows.length} test organizations`);
    orgResult.rows.forEach((row) => console.log(`   - ${row.name}`));
  } catch (error) {
    console.error("❌ Error cleaning up test users:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run based on command line argument
const command = process.argv[2];

if (command === "cleanup") {
  cleanupAllTestUsers().catch(console.error);
} else {
  seedAllTestUsers().catch(console.error);
}
