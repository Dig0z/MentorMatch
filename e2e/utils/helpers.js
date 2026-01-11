/**
 * Helper functions for E2E tests
 */

/**
 * Wait for navigation to complete
 */
async function waitForNavigation(page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Login helper function
 */
async function login(page, email, password) {
  await page.goto('/Pages/Log.html');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await waitForNavigation(page);
}

/**
 * Register helper function
 */
async function register(page, userData) {
  await page.goto('/Pages/Register.html');
  
  // Fill registration form
  await page.fill('input[name="email"], input[type="email"]', userData.email);
  await page.fill('input[name="password"], input[type="password"]', userData.password);
  await page.fill('input[name="name"]', userData.name);
  
  // Select role if available
  if (userData.role) {
    const roleSelector = `input[value="${userData.role}"], select[name="role"]`;
    await page.click(roleSelector).catch(() => {
      // If radio button doesn't exist, try select
      page.selectOption('select[name="role"]', userData.role).catch(() => {});
    });
  }
  
  await page.click('button[type="submit"]');
  await waitForNavigation(page);
}

/**
 * Logout helper function
 */
async function logout(page) {
  // Look for logout button/link
  const logoutSelectors = [
    'button:has-text("Logout")',
    'a:has-text("Logout")',
    'button:has-text("Log out")',
    'a:has-text("Log out")',
    '#logout',
    '.logout'
  ];
  
  for (const selector of logoutSelectors) {
    try {
      await page.click(selector, { timeout: 2000 });
      await waitForNavigation(page);
      return;
    } catch (e) {
      continue;
    }
  }
  
  // If no logout button found, clear storage and go to home
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto('/Pages/Home.html');
}

/**
 * Check if user is logged in
 */
async function isLoggedIn(page) {
  const token = await page.evaluate(() => localStorage.getItem('token'));
  return !!token;
}

/**
 * Get current user info from localStorage
 */
async function getCurrentUser(page) {
  return await page.evaluate(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return {
      token,
      user: user ? JSON.parse(user) : null
    };
  });
}

/**
 * Wait for API response
 */
async function waitForAPIResponse(page, urlPattern, timeout = 5000) {
  return await page.waitForResponse(
    response => response.url().includes(urlPattern) && response.status() === 200,
    { timeout }
  );
}

/**
 * Fill form helper
 */
async function fillForm(page, formData) {
  for (const [field, value] of Object.entries(formData)) {
    const selectors = [
      `input[name="${field}"]`,
      `textarea[name="${field}"]`,
      `select[name="${field}"]`,
      `#${field}`
    ];
    
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const tagName = await element.evaluate(el => el.tagName.toLowerCase());
          if (tagName === 'select') {
            await page.selectOption(selector, value);
          } else {
            await page.fill(selector, String(value));
          }
          break;
        }
      } catch (e) {
        continue;
      }
    }
  }
}

/**
 * Take screenshot with timestamp
 */
async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const path = `e2e/screenshots/${name}-${timestamp}.png`;
  await page.screenshot({ path, fullPage: true });
  return path;
}

module.exports = {
  waitForNavigation,
  login,
  register,
  logout,
  isLoggedIn,
  getCurrentUser,
  waitForAPIResponse,
  fillForm,
  takeScreenshot
};
