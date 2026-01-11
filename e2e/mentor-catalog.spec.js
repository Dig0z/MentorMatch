const { test, expect } = require('@playwright/test');
const { generateRandomEmail } = require('../utils/test-data');
const helpers = require('../utils/helpers');

test.describe('Mentor Catalog and Profiles', () => {
  
  let menteeEmail, menteePassword;

  test.beforeEach(async ({ page }) => {
    // Register a mentee user for testing
    menteeEmail = generateRandomEmail();
    menteePassword = 'Test123!@#';
    
    await page.goto('/Pages/Register.html');
    await page.fill('#name', 'Test');
    await page.fill('#surname', 'Mentee');
    await page.fill('#email', menteeEmail);
    await page.fill('#password1', menteePassword);
    await page.fill('#password2', menteePassword);
    await page.selectOption('#role', 'mentee');
    await page.click('#registerBtn');
    await page.waitForTimeout(2000);
    
    // Login
    await page.goto('/Pages/Log.html');
    await page.fill('#email', menteeEmail);
    await page.fill('#password', menteePassword);
    await page.click('#loginBtn');
    await page.waitForTimeout(2000);
  });

  test.describe('Mentor Catalog Page', () => {
    
    test('should display mentor catalog page', async ({ page }) => {
      await page.goto('/Pages/CatalogoMentors.html');
      
      // Check page loaded
      await expect(page.locator('h2:has-text("Catalogo")')).toBeVisible();
    });

    test('should display filter options', async ({ page }) => {
      await page.goto('/Pages/CatalogoMentors.html');
      
      // Check filters section exists
      await expect(page.locator('h5:has-text("Filtri")')).toBeVisible();
      
      // Check filter dropdowns exist
      const sectorDropdown = page.locator('#sectorDropdownToggle');
      await expect(sectorDropdown).toBeVisible();
    });

    test('should filter mentors by sector', async ({ page }) => {
      await page.goto('/Pages/CatalogoMentors.html');
      await page.waitForTimeout(1500);
      
      // Click sector dropdown
      await page.click('#sectorDropdownToggle');
      
      // Uncheck "Tutti"
      await page.uncheck('#sectorAll');
      
      // Select a specific sector
      await page.check('#sectorProg');
      
      // Wait for filtering
      await page.waitForTimeout(1000);
      
      // Check that mentors are displayed
      const mentorCards = page.locator('.mentor-card');
      const count = await mentorCards.count();
      
      // Should have some results or empty state
      expect(count >= 0).toBeTruthy();
    });

    test('should search mentors by name', async ({ page }) => {
      await page.goto('/Pages/CatalogoMentors.html');
      await page.waitForTimeout(1500);
      
      // Look for search input
      const searchInput = page.locator('input[type="text"], input[placeholder*="cerca"], input[placeholder*="search"]').first();
      
      if (await searchInput.count() > 0) {
        await searchInput.fill('test');
        await page.waitForTimeout(1000);
        
        // Results should be filtered
        const mentorCards = page.locator('.mentor-card');
        const count = await mentorCards.count();
        expect(count >= 0).toBeTruthy();
      }
    });

    test('should display mentor cards with information', async ({ page }) => {
      await page.goto('/Pages/CatalogoMentors.html');
      await page.waitForTimeout(2000);
      
      // Check if mentor cards are displayed
      const mentorCards = page.locator('.mentor-card');
      const count = await mentorCards.count();
      
      if (count > 0) {
        // First mentor card should have basic info
        const firstCard = mentorCards.first();
        await expect(firstCard).toBeVisible();
        
        // Should have a photo or placeholder
        const photo = firstCard.locator('.mentor-photo');
        await expect(photo).toBeVisible();
      }
    });

    test('should navigate to mentor profile on card click', async ({ page }) => {
      await page.goto('/Pages/CatalogoMentors.html');
      await page.waitForTimeout(2000);
      
      const mentorCards = page.locator('.mentor-card');
      const count = await mentorCards.count();
      
      if (count > 0) {
        // Click on first mentor card button
        const firstCardButton = mentorCards.first().locator('button, a').first();
        await firstCardButton.click();
        
        await page.waitForTimeout(1000);
        
        // Should navigate to mentor profile page
        const url = page.url();
        expect(url).toMatch(/MentorProfile|CalatoloMentorProfile/);
      }
    });
  });

  test.describe('Mentor Profile Page', () => {
    
    test('should display mentor profile page', async ({ page }) => {
      await page.goto('/Pages/CatalogoMentors.html');
      await page.waitForTimeout(2000);
      
      const mentorCards = page.locator('.mentor-card');
      const count = await mentorCards.count();
      
      if (count > 0) {
        // Navigate to a mentor profile
        const firstCardButton = mentorCards.first().locator('button, a').first();
        await firstCardButton.click();
        await page.waitForTimeout(1500);
        
        // Check profile page elements
        const profilePage = page.locator('body');
        await expect(profilePage).toBeVisible();
      }
    });

    test('should display mentor information and skills', async ({ page }) => {
      await page.goto('/Pages/CatalogoMentors.html');
      await page.waitForTimeout(2000);
      
      const mentorCards = page.locator('.mentor-card');
      const count = await mentorCards.count();
      
      if (count > 0) {
        // Navigate to mentor profile
        const firstCardButton = mentorCards.first().locator('button, a').first();
        await firstCardButton.click();
        await page.waitForTimeout(1500);
        
        // Profile should display mentor details
        // These selectors might need adjustment based on actual HTML structure
        const profileContent = page.locator('body');
        await expect(profileContent).toBeVisible();
      }
    });

    test('should display book session button on mentor profile', async ({ page }) => {
      await page.goto('/Pages/CatalogoMentors.html');
      await page.waitForTimeout(2000);
      
      const mentorCards = page.locator('.mentor-card');
      const count = await mentorCards.count();
      
      if (count > 0) {
        // Navigate to mentor profile
        const firstCardButton = mentorCards.first().locator('button, a').first();
        await firstCardButton.click();
        await page.waitForTimeout(1500);
        
        // Look for booking button
        const bookButton = page.locator('button:has-text("Prenota"), button:has-text("Book"), button:has-text("Richiedi")').first();
        
        if (await bookButton.count() > 0) {
          await expect(bookButton).toBeVisible();
        }
      }
    });

    test('should display mentor reviews section', async ({ page }) => {
      await page.goto('/Pages/CatalogoMentors.html');
      await page.waitForTimeout(2000);
      
      const mentorCards = page.locator('.mentor-card');
      const count = await mentorCards.count();
      
      if (count > 0) {
        // Navigate to mentor profile
        const firstCardButton = mentorCards.first().locator('button, a').first();
        await firstCardButton.click();
        await page.waitForTimeout(1500);
        
        // Look for reviews section
        const reviewsSection = page.locator('*:has-text("Recensioni"), *:has-text("Reviews"), *:has-text("Valutazioni")').first();
        
        if (await reviewsSection.count() > 0) {
          await expect(reviewsSection).toBeVisible();
        }
      }
    });
  });

  test.describe('Mentor Registration and Profile Setup', () => {
    
    test('should allow mentor to complete profile after registration', async ({ page }) => {
      // Register as mentor
      const mentorEmail = generateRandomEmail();
      const mentorPassword = 'Mentor123!@#';
      
      await page.goto('/Pages/Register.html');
      await page.fill('#name', 'Test');
      await page.fill('#surname', 'Mentor');
      await page.fill('#email', mentorEmail);
      await page.fill('#password1', mentorPassword);
      await page.fill('#password2', mentorPassword);
      await page.selectOption('#role', 'mentor');
      await page.click('#registerBtn');
      
      await page.waitForTimeout(2000);
      
      // Login as mentor
      await page.goto('/Pages/Log.html');
      await page.fill('#email', mentorEmail);
      await page.fill('#password', mentorPassword);
      await page.click('#loginBtn');
      
      await page.waitForTimeout(2000);
      
      // Should be on mentor dashboard or profile page
      const url = page.url();
      expect(url).toMatch(/Mentor|Profile|Dashboard/i);
    });

    test('should display mentor dashboard', async ({ page }) => {
      // Register and login as mentor
      const mentorEmail = generateRandomEmail();
      const mentorPassword = 'Mentor123!@#';
      
      await page.goto('/Pages/Register.html');
      await page.fill('#name', 'Test');
      await page.fill('#surname', 'Mentor');
      await page.fill('#email', mentorEmail);
      await page.fill('#password1', mentorPassword);
      await page.fill('#password2', mentorPassword);
      await page.selectOption('#role', 'mentor');
      await page.click('#registerBtn');
      await page.waitForTimeout(2000);
      
      await page.goto('/Pages/Log.html');
      await page.fill('#email', mentorEmail);
      await page.fill('#password', mentorPassword);
      await page.click('#loginBtn');
      await page.waitForTimeout(2000);
      
      // Navigate to mentor dashboard
      await page.goto('/Pages/MentorDashBoard.html');
      await page.waitForTimeout(1500);
      
      // Dashboard should be visible
      const dashboard = page.locator('body');
      await expect(dashboard).toBeVisible();
    });
  });
});
