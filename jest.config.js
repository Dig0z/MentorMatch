module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test match patterns - only match files in BackEnd/test directory
  testMatch: [
    '**/BackEnd/test/**/*.test.js',
    '**/BackEnd/test/**/*.spec.js'
  ],
  
  // Explicitly ignore e2e directory
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/',
    '/playwright-report/',
    '/test-results/'
  ],
  
  // Coverage settings (optional)
  collectCoverageFrom: [
    'BackEnd/src/**/*.js',
    '!BackEnd/src/**/*.test.js',
    '!BackEnd/src/**/*.spec.js'
  ],
  
  // Verbose output
  verbose: true
};
