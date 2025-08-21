import { TestUsers } from './test-data';
import { resetTestDatabase } from './database';

const AUTH_SERVER_URL = process.env.AUTH_SERVER_URL || 'http://91.98.19.187:3001';

/**
 * Set up complete test environment
 * This now simply calls resetTestDatabase which creates practitioners from TestUsers
 */
export async function setupTestUsers(): Promise<{success: boolean, results: Record<string, boolean>}> {
  console.log('Setting up complete test environment...');
  
  try {
    // Reset database which will create all practitioners from TestUsers
    await resetTestDatabase();
    
    // Mark all users as successfully set up
    const results: Record<string, boolean> = {};
    Object.keys(TestUsers).forEach(userKey => {
      results[userKey] = true;
    });
    
    console.log('✅ Test environment setup complete');
    return { success: true, results };
    
  } catch (error) {
    console.error('❌ Test environment setup failed:', error);
    
    // Mark all users as failed
    const results: Record<string, boolean> = {};
    Object.keys(TestUsers).forEach(userKey => {
      results[userKey] = false;
    });
    
    return { success: false, results };
  }
}

/**
 * Verify that test users can authenticate
 */
export async function verifyTestUsers(): Promise<{success: boolean, results: Record<string, boolean>}> {
  console.log('Verifying test users...');
  
  const results: Record<string, boolean> = {};
  let allSuccess = true;
  
  for (const [userKey, userData] of Object.entries(TestUsers)) {
    try {
      const response = await fetch(`${AUTH_SERVER_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
        }),
      });
      
      const success = response.ok;
      results[userKey] = success;
      allSuccess = allSuccess && success;
      
      if (success) {
        console.log(`✅ ${userKey} authentication verified`);
      } else {
        console.log(`❌ ${userKey} authentication failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${userKey} authentication error:`, error);
      results[userKey] = false;
      allSuccess = false;
    }
  }
  
  return { success: allSuccess, results };
}