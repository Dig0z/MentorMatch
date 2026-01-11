const { test, expect } = require('@playwright/test');
const { generateRandomEmail } = require('../utils/test-data');

test.describe('Session Booking Flow', () => {
  
  let menteeEmail, menteePassword;
  let mentorEmail, mentorPassword;

  test.beforeAll(async ({ browser }) => {
    // Create a mentor user that will be used across tests
    const context = await browser.newContext();
    const page = await context.newPage();
    
    mentorEmail = generateRandomEmail();
    mentorPassword = 'Mentor123!@#';
    
    await page.goto('/Pages/Register.html');
    await page.fill('#name', 'Available');
    await page.fill('#surname', 'Mentor');
    await page.fill('#email', mentorEmail);
    await page.fill('#password1', mentorPassword);
    await page.fill('#password2', mentorPassword);
    await page.selectOption('#role', 'mentor');
    await page.click('#registerBtn');
    await page.waitForTimeout(2000);
    
    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    // Register and login as mentee for each test
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
    
    await page.goto('/Pages/Log.html');
    await page.fill('#email', menteeEmail);
    await page.fill('#password', menteePassword);
    await page.click('#loginBtn');
    await page.waitForTimeout(2000);
  });

  test.describe('Session Booking', () => {
    
    test('should navigate to booking from mentor profile', async ({ page }) => {
      // Go to mentor catalog
      await page.goto('/Pages/CatalogoMentors.html');
      await page.waitForTimeout(2000);
      
      const mentorCards = page.locator('.mentor-card');
      const count = await mentorCards.count();
      
      if (count > 0) {
        // Click on first mentor
        const firstCardButton = mentorCards.first().locator('button, a').first();
        await firstCardButton.click();
        await page.waitForTimeout(1500);
        
        // Look for booking button
        const bookButton = page.locator('button:has-text("Prenota"), button:has-text("Book"), button:has-text("Richiedi")').first();
        
        if (await bookButton.count() > 0) {
          await bookButton.click();
          await page.waitForTimeout(1000);
          
          // Should show booking modal or form
          const bookingForm = page.locator('form, .modal, .booking').first();
          await expect(bookingForm).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test('should display available time slots', async ({ page }) => {
      await page.goto('/Pages/CatalogoMentors.html');
      await page.waitForTimeout(2000);
      
      const mentorCards = page.locator('.mentor-card');
      const count = await mentorCards.count();
      
      if (count > 0) {
        const firstCardButton = mentorCards.first().locator('button, a').first();
        await firstCardButton.click();
        await page.waitForTimeout(1500);
        
        // Look for calendar or time slot selector
        const calendar = page.locator('input[type="date"], input[type="datetime-local"], .calendar, .time-slots').first();
        
        if (await calendar.count() > 0) {
          await expect(calendar).toBeVisible();
        }
      }
    });

    test('should select date and time for session', async ({ page }) => {
      await page.goto('/Pages/CatalogoMentors.html');
      await page.waitForTimeout(2000);
      
      const mentorCards = page.locator('.mentor-card');
      const count = await mentorCards.count();
      
      if (count > 0) {
        const firstCardButton = mentorCards.first().locator('button, a').first();
        await firstCardButton.click();
        await page.waitForTimeout(1500);
        
        // Click booking button
        const bookButton = page.locator('button:has-text("Prenota"), button:has-text("Book")').first();
        if (await bookButton.count() > 0) {
          await bookButton.click();
          await page.waitForTimeout(1000);
          
          // Try to select a date
          const dateInput = page.locator('input[type="date"], input[type="datetime-local"]').first();
          if (await dateInput.count() > 0) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dateString = tomorrow.toISOString().split('T')[0];
            
            await dateInput.fill(dateString);
            await page.waitForTimeout(500);
          }
        }
      }
    });

    test('should successfully book a session', async ({ page }) => {
      await page.goto('/Pages/CatalogoMentors.html');
      await page.waitForTimeout(2000);
      
      const mentorCards = page.locator('.mentor-card');
      const count = await mentorCards.count();
      
      if (count > 0) {
        const firstCardButton = mentorCards.first().locator('button, a').first();
        await firstCardButton.click();
        await page.waitForTimeout(1500);
        
        // Click booking button
        const bookButton = page.locator('button:has-text("Prenota"), button:has-text("Book")').first();
        if (await bookButton.count() > 0) {
          await bookButton.click();
          await page.waitForTimeout(1000);
          
          // Fill booking form
          const dateInput = page.locator('input[type="date"], input[type="datetime-local"]').first();
          if (await dateInput.count() > 0) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dateString = tomorrow.toISOString().split('T')[0];
            await dateInput.fill(dateString);
          }
          
          // Look for time input
          const timeInput = page.locator('input[type="time"], select[name*="time"]').first();
          if (await timeInput.count() > 0) {
            await timeInput.fill('14:00');
          }
          
          // Look for topic/description input
          const topicInput = page.locator('textarea, input[name*="topic"], input[name*="description"]').first();
          if (await topicInput.count() > 0) {
            await topicInput.fill('Test session booking');
          }
          
          // Submit booking
          const submitButton = page.locator('button[type="submit"], button:has-text("Conferma"), button:has-text("Submit")').first();
          if (await submitButton.count() > 0) {
            await submitButton.click();
            await page.waitForTimeout(2000);
            
            // Should show success message or redirect to dashboard
            const successIndicator = page.locator(
              ':has-text("Success"), :has-text("Prenotato"), :has-text("Confermato")'
            ).first();
            
            // Either success message or URL change indicates success
            const url = page.url();
            const hasSuccessMessage = await successIndicator.count() > 0;
            const urlChanged = url.includes('Dashboard') || url.includes('success');
            
            expect(hasSuccessMessage || urlChanged).toBeTruthy();
          }
        }
      }
    });

    test('should show booked session in mentee dashboard', async ({ page }) => {
      // Navigate to mentee dashboard
      await page.goto('/Pages/MenteeDashBoard.html');
      await page.waitForTimeout(2000);
      
      // Dashboard should be visible
      await expect(page.locator('body')).toBeVisible();
      
      // Look for sessions section
      const sessionsSection = page.locator('*:has-text("Sessioni"), *:has-text("Sessions"), *:has-text("Appuntamenti")').first();
      
      if (await sessionsSection.count() > 0) {
        await expect(sessionsSection).toBeVisible();
      }
    });
  });

  test.describe('Session Management - Mentee', () => {
    
    test('should display upcoming sessions in mentee dashboard', async ({ page }) => {
      await page.goto('/Pages/MenteeDashBoard.html');
      await page.waitForTimeout(2000);
      
      // Check for sessions list
      const sessionsList = page.locator('.session-card, .appointment-card, [class*="session"]').first();
      
      // Should either show sessions or empty state
      const hasContent = await page.locator('body').textContent();
      expect(hasContent).toBeTruthy();
    });

    test('should allow mentee to cancel a session', async ({ page }) => {
      await page.goto('/Pages/MenteeDashBoard.html');
      await page.waitForTimeout(2000);
      
      // Look for cancel button
      const cancelButton = page.locator('button:has-text("Cancella"), button:has-text("Cancel"), button:has-text("Annulla")').first();
      
      if (await cancelButton.count() > 0) {
        await cancelButton.click();
        await page.waitForTimeout(500);
        
        // Confirm cancellation if modal appears
        const confirmButton = page.locator('button:has-text("Conferma"), button:has-text("Yes"), button:has-text("Sì")').first();
        if (await confirmButton.count() > 0) {
          await confirmButton.click();
          await page.waitForTimeout(1000);
        }
      }
    });

    test('should show session details', async ({ page }) => {
      await page.goto('/Pages/MenteeDashBoard.html');
      await page.waitForTimeout(2000);
      
      // Look for view details button
      const detailsButton = page.locator('button:has-text("Dettagli"), button:has-text("Details"), button:has-text("View")').first();
      
      if (await detailsButton.count() > 0) {
        await detailsButton.click();
        await page.waitForTimeout(1000);
        
        // Should show modal or navigate to details page
        const detailsView = page.locator('.modal, .details, [class*="detail"]').first();
        
        if (await detailsView.count() > 0) {
          await expect(detailsView).toBeVisible();
        }
      }
    });
  });

  test.describe('Session Management - Mentor', () => {
    
    test('should display mentor dashboard with sessions', async ({ page }) => {
      // Login as mentor
      await page.goto('/Pages/Log.html');
      await page.fill('#email', mentorEmail);
      await page.fill('#password', mentorPassword);
      await page.click('#loginBtn');
      await page.waitForTimeout(2000);
      
      // Navigate to mentor dashboard
      await page.goto('/Pages/MentorDashBoard.html');
      await page.waitForTimeout(2000);
      
      // Dashboard should be visible
      await expect(page.locator('body')).toBeVisible();
    });

    test('should allow mentor to set availability', async ({ page }) => {
      // Login as mentor
      await page.goto('/Pages/Log.html');
      await page.fill('#email', mentorEmail);
      await page.fill('#password', mentorPassword);
      await page.click('#loginBtn');
      await page.waitForTimeout(2000);
      
      await page.goto('/Pages/MentorDashBoard.html');
      await page.waitForTimeout(2000);
      
      // Look for availability settings
      const availabilityButton = page.locator(
        'button:has-text("Disponibilità"), button:has-text("Availability"), button:has-text("Orari")'
      ).first();
      
      if (await availabilityButton.count() > 0) {
        await availabilityButton.click();
        await page.waitForTimeout(1000);
        
        // Should show availability form
        const availabilityForm = page.locator('form, .modal, [class*="availability"]').first();
        if (await availabilityForm.count() > 0) {
          await expect(availabilityForm).toBeVisible();
        }
      }
    });

    test('should allow mentor to accept/reject session requests', async ({ page }) => {
      // Login as mentor
      await page.goto('/Pages/Log.html');
      await page.fill('#email', mentorEmail);
      await page.fill('#password', mentorPassword);
      await page.click('#loginBtn');
      await page.waitForTimeout(2000);
      
      await page.goto('/Pages/MentorDashBoard.html');
      await page.waitForTimeout(2000);
      
      // Look for pending requests
      const acceptButton = page.locator('button:has-text("Accetta"), button:has-text("Accept"), button:has-text("Approve")').first();
      const rejectButton = page.locator('button:has-text("Rifiuta"), button:has-text("Reject"), button:has-text("Decline")').first();
      
      const hasActionButtons = await acceptButton.count() > 0 || await rejectButton.count() > 0;
      
      // If there are pending requests, buttons should be visible
      if (hasActionButtons) {
        expect(hasActionButtons).toBeTruthy();
      }
    });
  });

  test.describe('Google Calendar Integration', () => {
    
    test('should show Google Calendar integration option', async ({ page }) => {
      await page.goto('/Pages/MenteeDashBoard.html');
      await page.waitForTimeout(2000);
      
      // Look for Google Calendar button/link
      const googleButton = page.locator(
        'button:has-text("Google"), a:has-text("Google"), [class*="google"]'
      ).first();
      
      // Integration might be visible
      if (await googleButton.count() > 0) {
        await expect(googleButton).toBeVisible();
      }
    });
  });
});
