const { test, expect } = require('@playwright/test');
const { generateRandomEmail } = require('../utils/test-data');

test.describe('Authentication Flow', () => {
  
  test.describe('Registration', () => {
    
    test('should display registration form', async ({ page }) => {
      await page.goto('/Pages/Register.html');
      
      // Check form elements are visible
      await expect(page.locator('h3:has-text("Register")')).toBeVisible();
      await expect(page.locator('#name')).toBeVisible();
      await expect(page.locator('#surname')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password1')).toBeVisible();
      await expect(page.locator('#password2')).toBeVisible();
      await expect(page.locator('#role')).toBeVisible();
      await expect(page.locator('#registerBtn')).toBeVisible();
    });

    test('should successfully register a new mentee', async ({ page }) => {
      await page.goto('/Pages/Register.html');
      
      const email = generateRandomEmail();
      
      // Fill registration form
      await page.fill('#name', 'Test');
      await page.fill('#surname', 'User');
      await page.fill('#email', email);
      await page.fill('#password1', 'Test123!@#');
      await page.fill('#password2', 'Test123!@#');
      await page.selectOption('#role', 'mentee');
      
      // Submit form
      await page.click('#registerBtn');
      
      // Wait for navigation or success message
      await page.waitForTimeout(2000);
      
      // Should redirect to login or dashboard
      const url = page.url();
      expect(url).toMatch(/\/(Log|MenteeDashBoard)\.html/);
    });

    test('should successfully register a new mentor', async ({ page }) => {
      await page.goto('/Pages/Register.html');
      
      const email = generateRandomEmail();
      
      // Fill registration form
      await page.fill('#name', 'Test');
      await page.fill('#surname', 'Mentor');
      await page.fill('#email', email);
      await page.fill('#password1', 'Test123!@#');
      await page.fill('#password2', 'Test123!@#');
      await page.selectOption('#role', 'mentor');
      
      // Submit form
      await page.click('#registerBtn');
      
      // Wait for navigation
      await page.waitForTimeout(2000);
      
      // Should redirect to login or dashboard
      const url = page.url();
      expect(url).toMatch(/\/(Log|MentorDashBoard|Profile)\.html/);
    });

    test('should show error when passwords do not match', async ({ page }) => {
      await page.goto('/Pages/Register.html');
      
      // Fill form with mismatched passwords
      await page.fill('#name', 'Test');
      await page.fill('#surname', 'User');
      await page.fill('#email', generateRandomEmail());
      await page.fill('#password1', 'Test123!@#');
      await page.fill('#password2', 'DifferentPassword123!');
      
      // Listen for alerts or error messages
      page.on('dialog', dialog => {
        expect(dialog.message()).toContain('password');
        dialog.accept();
      });
      
      await page.click('#registerBtn');
      await page.waitForTimeout(1000);
    });

    test('should show error when email is already registered', async ({ page }) => {
      const email = generateRandomEmail();
      
      // Register first time
      await page.goto('/Pages/Register.html');
      await page.fill('#name', 'Test');
      await page.fill('#surname', 'User');
      await page.fill('#email', email);
      await page.fill('#password1', 'Test123!@#');
      await page.fill('#password2', 'Test123!@#');
      await page.selectOption('#role', 'mentee');
      await page.click('#registerBtn');
      await page.waitForTimeout(2000);
      
      // Try to register again with same email
      await page.goto('/Pages/Register.html');
      await page.fill('#name', 'Another');
      await page.fill('#surname', 'User');
      await page.fill('#email', email);
      await page.fill('#password1', 'Test123!@#');
      await page.fill('#password2', 'Test123!@#');
      await page.selectOption('#role', 'mentee');
      
      // Listen for error
      page.on('dialog', dialog => {
        expect(dialog.message()).toMatch(/email|already|exist/i);
        dialog.accept();
      });
      
      await page.click('#registerBtn');
      await page.waitForTimeout(1000);
    });

    test('should navigate to login page from registration', async ({ page }) => {
      await page.goto('/Pages/Register.html');
      
      // Click "Log In" link
      await page.click('a.btn-outline-primary:has-text("Log In")');
      
      // Should navigate to login page
      await expect(page).toHaveURL(/Log\.html/);
      await expect(page.locator('h3:has-text("Login")')).toBeVisible();
    });
  });

  test.describe('Login', () => {
    
    test('should display login form', async ({ page }) => {
      await page.goto('/Pages/Log.html');
      
      // Check form elements are visible
      await expect(page.locator('h3:has-text("Login")')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('#loginBtn')).toBeVisible();
    });

    test('should successfully login with valid credentials', async ({ page }) => {
      // First register a user
      const email = generateRandomEmail();
      const password = 'Test123!@#';
      
      await page.goto('/Pages/Register.html');
      await page.fill('#name', 'Test');
      await page.fill('#surname', 'User');
      await page.fill('#email', email);
      await page.fill('#password1', password);
      await page.fill('#password2', password);
      await page.selectOption('#role', 'mentee');
      await page.click('#registerBtn');
      await page.waitForTimeout(2000);
      
      // Now login
      await page.goto('/Pages/Log.html');
      await page.fill('#email', email);
      await page.fill('#password', password);
      await page.click('#loginBtn');
      
      // Wait for navigation
      await page.waitForTimeout(2000);
      
      // Should redirect to dashboard
      const url = page.url();
      expect(url).toMatch(/Dashboard\.html/);
      
      // Check if token is stored
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeTruthy();
    });

    test('should show error with invalid credentials', async ({ page }) => {
      await page.goto('/Pages/Log.html');
      
      // Fill with invalid credentials
      await page.fill('#email', 'nonexistent@test.com');
      await page.fill('#password', 'WrongPassword123!');
      
      // Listen for error
      page.on('dialog', dialog => {
        expect(dialog.message()).toMatch(/invalid|incorrect|wrong|failed/i);
        dialog.accept();
      });
      
      await page.click('#loginBtn');
      await page.waitForTimeout(1000);
    });

    test('should show error when email field is empty', async ({ page }) => {
      await page.goto('/Pages/Log.html');
      
      // Fill only password
      await page.fill('#password', 'Test123!@#');
      
      // Try to submit
      await page.click('#loginBtn');
      await page.waitForTimeout(500);
      
      // Should not navigate away from login page
      await expect(page).toHaveURL(/Log\.html/);
    });

    test('should show error when password field is empty', async ({ page }) => {
      await page.goto('/Pages/Log.html');
      
      // Fill only email
      await page.fill('#email', 'test@test.com');
      
      // Try to submit
      await page.click('#loginBtn');
      await page.waitForTimeout(500);
      
      // Should not navigate away from login page
      await expect(page).toHaveURL(/Log\.html/);
    });

    test('should navigate to registration page from login', async ({ page }) => {
      await page.goto('/Pages/Log.html');
      
      // Click "Register" link
      await page.click('a.btn-outline-primary:has-text("Register")');
      
      // Should navigate to registration page
      await expect(page).toHaveURL(/Register\.html/);
      await expect(page.locator('h3:has-text("Register")')).toBeVisible();
    });
  });

  test.describe('Session Persistence', () => {
    
    test('should persist login session after page reload', async ({ page }) => {
      // Register and login
      const email = generateRandomEmail();
      const password = 'Test123!@#';
      
      await page.goto('/Pages/Register.html');
      await page.fill('#name', 'Test');
      await page.fill('#surname', 'User');
      await page.fill('#email', email);
      await page.fill('#password1', password);
      await page.fill('#password2', password);
      await page.selectOption('#role', 'mentee');
      await page.click('#registerBtn');
      await page.waitForTimeout(2000);
      
      await page.goto('/Pages/Log.html');
      await page.fill('#email', email);
      await page.fill('#password', password);
      await page.click('#loginBtn');
      await page.waitForTimeout(2000);
      
      // Get token before reload
      const tokenBefore = await page.evaluate(() => localStorage.getItem('token'));
      expect(tokenBefore).toBeTruthy();
      
      // Reload page
      await page.reload();
      await page.waitForTimeout(1000);
      
      // Token should still be present
      const tokenAfter = await page.evaluate(() => localStorage.getItem('token'));
      expect(tokenAfter).toBe(tokenBefore);
    });
  });
});
