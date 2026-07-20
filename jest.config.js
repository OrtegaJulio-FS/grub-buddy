module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/setup-env.js'],
  globalSetup: '<rootDir>/tests/globalSetup.js',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  testTimeout: 15000,
  // Tests share one Postgres test database and reset it with TRUNCATE in
  // beforeEach - running files in parallel would race against each other.
  maxWorkers: 1,
};
