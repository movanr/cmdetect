// Load environment variables from .env file
import 'dotenv/config';
import { resetTestDatabase } from './database';

// Global test setup
beforeAll(async () => {
  console.log('Setting up test environment...');
  
  // Initialize test database with clean data
  await resetTestDatabase();
  
  console.log('Test environment ready');
});

// Clean up after each test to ensure isolation
afterEach(async () => {
  // Reset to clean state for next test
  await resetTestDatabase();
});

// Global test teardown
afterAll(async () => {
  console.log('Test environment cleanup complete');
});

// Increase timeout for database operations
jest.setTimeout(30000);