import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import { Pool } from 'pg';
import { betterAuth } from 'better-auth';

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

// Test user configuration
const TEST_USER = {
  email: 'admin@test.com',
  password: 'TestPassword123!',
  name: 'Test Admin',
  roles: ['org_admin'],
  organizationId: randomUUID(),
  practitionerId: randomUUID(),
};

async function createSingleTestUser() {
  try {
    console.log('🌱 Creating single test user with Better Auth...');
    console.log(`📧 Email: ${TEST_USER.email}`);
    console.log(`📋 Organization ID: ${TEST_USER.organizationId}`);

    // Step 1: Create user via Better Auth API
    console.log('\n1️⃣ Creating user via Better Auth signup...');
    
    const signupResult = await testAuth.api.signUpEmail({
      body: {
        email: TEST_USER.email,
        password: TEST_USER.password,
        name: TEST_USER.name,
      },
    });

    if (!signupResult || !signupResult.user) {
      throw new Error('Failed to create user - no user returned from signup');
    }

    console.log(`✅ User created with ID: ${signupResult.user.id}`);

    // Step 2: Update user metadata via database
    console.log('\n2️⃣ Setting user metadata and email verification...');
    
    const metadata = {
      roles: TEST_USER.roles,
      organizationId: TEST_USER.organizationId,
      practitionerId: TEST_USER.practitionerId,
    };

    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE "user" SET metadata = $1, "emailVerified" = $2 WHERE id = $3',
        [JSON.stringify(metadata), true, signupResult.user.id]
      );
      console.log('✅ Metadata and email verification updated');
    } finally {
      client.release();
    }

    // Step 3: Test login to verify everything works
    console.log('\n3️⃣ Testing login with created user...');
    
    const loginResult = await testAuth.api.signInEmail({
      body: {
        email: TEST_USER.email,
        password: TEST_USER.password,
      },
    });

    if (loginResult && loginResult.user) {
      console.log('✅ Login successful!');
      console.log(`   User ID: ${loginResult.user.id}`);
      console.log(`   Email verified: ${loginResult.user.emailVerified}`);
      
      // Parse and display metadata
      let userMetadata = {};
      try {
        const rawMetadata = (loginResult.user as any).metadata;
        userMetadata = rawMetadata ? JSON.parse(rawMetadata) : {};
      } catch (e) {
        console.log('⚠️  Could not parse user metadata');
      }
      console.log(`   Metadata: ${JSON.stringify(userMetadata, null, 2)}`);
    } else {
      console.log('❌ Login failed');
    }

    console.log('\n🎉 Test user creation completed successfully!');
    console.log('\n📋 Test User Summary:');
    console.log('====================');
    console.log(`📧 Email: ${TEST_USER.email}`);
    console.log(`🔑 Password: ${TEST_USER.password}`);
    console.log(`👤 Name: ${TEST_USER.name}`);
    console.log(`🎭 Roles: [${TEST_USER.roles.join(', ')}]`);
    console.log(`🏢 Organization ID: ${TEST_USER.organizationId}`);
    console.log(`🩺 Practitioner ID: ${TEST_USER.practitionerId}`);

  } catch (error: any) {
    console.error('❌ Error creating test user:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

async function cleanupTestUser() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 Cleaning up test user...');
    
    // First delete related records in order
    await client.query('DELETE FROM "session" WHERE "userId" IN (SELECT id FROM "user" WHERE email = $1)', [TEST_USER.email]);
    console.log('✅ Deleted user sessions');
    
    await client.query('DELETE FROM "account" WHERE "userId" IN (SELECT id FROM "user" WHERE email = $1)', [TEST_USER.email]);
    console.log('✅ Deleted user accounts');
    
    // Then delete the user
    const result = await client.query(
      'DELETE FROM "user" WHERE email = $1 RETURNING email',
      [TEST_USER.email]
    );
    
    if (result.rows.length > 0) {
      console.log(`✅ Deleted test user: ${result.rows[0].email}`);
    } else {
      console.log('⚠️  Test user not found');
    }
    
  } catch (error) {
    console.error('❌ Error cleaning up test user:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run based on command line argument
const command = process.argv[2];

if (command === 'cleanup') {
  cleanupTestUser().catch(console.error);
} else {
  createSingleTestUser().catch(console.error);
}