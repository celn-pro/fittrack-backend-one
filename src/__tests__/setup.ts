// Test setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.RAPIDAPI_KEY = 'test-api-key';
process.env.CACHE_TTL_EXERCISES = '1000';
process.env.CACHE_TTL_RECOMMENDATIONS = '1000';
process.env.CACHE_TTL_USER_METRICS = '1000';
