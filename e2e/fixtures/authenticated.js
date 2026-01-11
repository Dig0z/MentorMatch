const base = require('@playwright/test');
const helpers = require('../utils/helpers');

/**
 * Custom test fixture that extends Playwright's base test
 * Provides common utilities and authenticated contexts
 */
const test = base.test.extend({
  // Helper methods available in all tests
  helpers: async ({ page }, use) => {
    await use(helpers);
  },

  // Auto-authenticated context for mentee tests
  authenticatedMenteePage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Register and login as mentee
    const { testUsers } = require('../utils/test-data');
    await helpers.register(page, testUsers.mentee);
    
    await use(page);
    
    // Cleanup
    await context.close();
  },

  // Auto-authenticated context for mentor tests
  authenticatedMentorPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Register and login as mentor
    const { testUsers } = require('../utils/test-data');
    await helpers.register(page, testUsers.mentor);
    
    await use(page);
    
    // Cleanup
    await context.close();
  },
});

const expect = base.expect;

module.exports = { test, expect };
