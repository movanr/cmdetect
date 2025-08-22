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

// NOTE: Not cleaning after each test to preserve auth users for subsequent tests
// Tests should be designed to be independent without requiring full database reset

// Global test teardown
afterAll(async () => {
  console.log('Test environment cleanup complete');
});

// Increase timeout for database operations
jest.setTimeout(30000);