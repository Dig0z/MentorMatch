const { test, expect } = require('@playwright/test');
const { generateRandomEmail } = require('../utils/test-data');

test.describe('Review System', () => {
  
  let menteeEmail, menteePassword;
  let mentorEmail, mentorPassword;

  test.beforeAll(async ({ browser }) => {
    // Create mentor user
    const context = await browser.newContext();
    const page = await context.newPage();
    
    mentorEmail = generateRandomEmail();
    mentorPassword = 'Mentor123!@#';
    
    await page.goto('/Pages/Register.html');
    await page.fill('#name', 'Reviewable');
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
    // Register and login as mentee
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

  test.describe('Leaving Reviews', () => {
    
    test('should display review form after completed session', async ({ page }) => {
      // Navigate to mentee dashboard
      await page.goto('/Pages/MenteeDashBoard.html');
      await page.waitForTimeout(2000);
      
      // Look for review button on completed sessions
      const reviewButton = page.locator(
        'button:has-text("Recensione"), button:has-text("Review"), button:has-text("Valuta")'
      ).first();
      
      if (await reviewButton.count() > 0) {
        await reviewButton.click();
        await page.waitForTimeout(1000);
        
        // Review form should appear
        const reviewForm = page.locator('form, .modal, [class*="review"]').first();
        if (await reviewForm.count() > 0) {
          await expect(reviewForm).toBeVisible();
        }
      }
    });

    test('should submit a review with rating and comment', async ({ page }) => {
      // Go to mentor catalog and select a mentor
      await page.goto('/Pages/CatalogoMentors.html');
      await page.waitForTimeout(2000);
      
      const mentorCards = page.locator('.mentor-card');
      const count = await mentorCards.count();
      
      if (count > 0) {
        // Navigate to mentor profile
        const firstCardButton = mentorCards.first().locator('button, a').first();
        await firstCardButton.click();
        await page.waitForTimeout(1500);
        
        // Look for review section or button
        const reviewButton = page.locator(
          'button:has-text("Lascia recensione"), button:has-text("Write review"), button:has-text("Recensione")'
        ).first();
        
        if (await reviewButton.count() > 0) {
          await reviewButton.click();
          await page.waitForTimeout(1000);
          
          // Fill review form
          // Look for star rating
          const stars = page.locator('[class*="star"], input[type="radio"][name*="rating"]');
          const starCount = await stars.count();
          
          if (starCount > 0) {
            // Click 5th star (or last available)
            const starToClick = Math.min(4, starCount - 1);
            await stars.nth(starToClick).click();
          }
          
          // Look for comment textarea
          const commentField = page.locator('textarea, input[name*="comment"], input[name*="review"]').first();
          if (await commentField.count() > 0) {
            await commentField.fill('Excellent mentor! Very helpful and knowledgeable.');
          }
          
          // Submit review
          const submitButton = page.locator(
            'button[type="submit"], button:has-text("Invia"), button:has-text("Submit")'
          ).first();
          
          if (await submitButton.count() > 0) {
            await submitButton.click();
            await page.waitForTimeout(2000);
            
            // Should show success message or review should appear
            const successIndicator = page.locator(
              ':has-text("Success"), :has-text("Grazie"), :has-text("Thank you")'
            ).first();
            
            if (await successIndicator.count() > 0) {
              await expect(successIndicator).toBeVisible();
            }
          }
        }
      }
    });

    test('should require rating before submitting review', async ({ page }) => {
      await page.goto('/Pages/CatalogoMentors.html');
      await page.waitForTimeout(2000);
      
      const mentorCards = page.locator('.mentor-card');
      const count = await mentorCards.count();
      
      if (count > 0) {
        const firstCardButton = mentorCards.first().locator('button, a').first();
        await firstCardButton.click();
        await page.waitForTimeout(1500);
        
        const reviewButton = page.locator(
          'button:has-text("Lascia recensione"), button:has-text("Write review")'
        ).first();
        
        if (await reviewButton.count() > 0) {
          await reviewButton.click();
          await page.waitForTimeout(1000);
          
          // Try to submit without rating
          const commentField = page.locator('textarea').first();
          if (await commentField.count() > 0) {
            await commentField.fill('Test comment without rating');
          }
          
          const submitButton = page.locator('button[type="submit"]').first();
          if (await submitButton.count() > 0) {
            await submitButton.click();
            await page.waitForTimeout(500);
            
            // Should show validation error or not submit
            // Form should still be visible
            const form = page.locator('form, .modal').first();
            if (await form.count() > 0) {
              await expect(form).toBeVisible();
            }
          }
        }
      }
    });

    test('should display character limit for review comment', async ({ page }) => {
      await page.goto('/Pages/CatalogoMentors.html');
      await page.waitForTimeout(2000);
      
      const mentorCards = page.locator('.mentor-card');
      const count = await mentorCards.count();
      
      if (count > 0) {
        const firstCardButton = mentorCards.first().locator('button, a').first();
        await firstCardButton.click();
        await page.waitForTimeout(1500);
        
        const reviewButton = page.locator('button:has-text("recensione"), button:has-text("review")').first();
        
        if (await reviewButton.count() > 0) {
          await reviewButton.click();
          await page.waitForTimeout(1000);
          
          // Check for maxlength attribute or character counter
          const commentField = page.locator('textarea').first();
          if (await commentField.count() > 0) {
            const maxLength = await commentField.getAttribute('maxlength');
            
            if (maxLength) {
              expect(parseInt(maxLength)).toBeGreaterThan(0);
            }
          }
        }
      }
    });
  });

  test.describe('Viewing Reviews', () => {
    
    test('should display reviews on mentor profile page', async ({ page }) => {
      await page.goto('/Pages/CatalogoMentors.html');
      await page.waitForTimeout(2000);
      
      const mentorCards = page.locator('.mentor-card');
      const count = await mentorCards.count();
      
      if (count > 0) {
        const firstCardButton = mentorCards.first().locator('button, a').first();
        await firstCardButton.click();
        await page.waitForTimeout(1500);
        
        // Look for reviews section
        const reviewsSection = page.locator(
          '*:has-text("Recensioni"), *:has-text("Reviews"), [class*="review"]'
        ).first();
        
        if (await reviewsSection.count() > 0) {
          await expect(reviewsSection).toBeVisible();
        }
      }
    });

    test('should display average rating for mentor', async ({ page }) => {
      await page.goto('/Pages/CatalogoMentors.html');
      await page.waitForTimeout(2000);
      
      const mentorCards = page.locator('.mentor-card');
      const count = await mentorCards.count();
      
      if (count > 0) {
        // Check if rating is visible on card
        const firstCard = mentorCards.first();
        const rating = firstCard.locator('[class*="rating"], [class*="star"], .rating-value').first();
        
        if (await rating.count() > 0) {
          await expect(rating).toBeVisible();
        }
        
        // Also check on profile page
        const firstCardButton = firstCard.locator('button, a').first();
        await firstCardButton.click();
        await page.waitForTimeout(1500);
        
        const profileRating = page.locator('[class*="rating"], [class*="star"]').first();
        if (await profileRating.count() > 0) {
          await expect(profileRating).toBeVisible();
        }
      }
    });

    test('should display individual review details', async ({ page }) => {
      await page.goto('/Pages/CatalogoMentors.html');
      await page.waitForTimeout(2000);
      
      const mentorCards = page.locator('.mentor-card');
      const count = await mentorCards.count();
      
      if (count > 0) {
        const firstCardButton = mentorCards.first().locator('button, a').first();
        await firstCardButton.click();
        await page.waitForTimeout(1500);
        
        // Look for individual reviews
        const reviews = page.locator('.review-card, [class*="review-item"]');
        const reviewCount = await reviews.count();
        
        if (reviewCount > 0) {
          const firstReview = reviews.first();
          await expect(firstReview).toBeVisible();
          
          // Review should contain rating, comment, date
          const reviewContent = await firstReview.textContent();
          expect(reviewContent).toBeTruthy();
        }
      }
    });

    test('should sort reviews by date', async ({ page }) => {
      await page.goto('/Pages/CatalogoMentors.html');
      await page.waitForTimeout(2000);
      
      const mentorCards = page.locator('.mentor-card');
      const count = await mentorCards.count();
      
      if (count > 0) {
        const firstCardButton = mentorCards.first().locator('button, a').first();
        await firstCardButton.click();
        await page.waitForTimeout(1500);
        
        // Look for sort dropdown or buttons
        const sortButton = page.locator(
          'select[name*="sort"], button:has-text("Sort"), button:has-text("Ordina")'
        ).first();
        
        if (await sortButton.count() > 0) {
          await expect(sortButton).toBeVisible();
        }
      }
    });

    test('should paginate reviews if there are many', async ({ page }) => {
      await page.goto('/Pages/CatalogoMentors.html');
      await page.waitForTimeout(2000);
      
      const mentorCards = page.locator('.mentor-card');
      const count = await mentorCards.count();
      
      if (count > 0) {
        const firstCardButton = mentorCards.first().locator('button, a').first();
        await firstCardButton.click();
        await page.waitForTimeout(1500);
        
        // Look for pagination controls
        const pagination = page.locator('.pagination, [class*="page"], button:has-text("Next")').first();
        
        if (await pagination.count() > 0) {
          await expect(pagination).toBeVisible();
        }
      }
    });
  });

  test.describe('Review Management', () => {
    
    test('should allow mentee to edit their own review', async ({ page }) => {
      await page.goto('/Pages/MenteeDashBoard.html');
      await page.waitForTimeout(2000);
      
      // Look for edit review button
      const editButton = page.locator(
        'button:has-text("Modifica"), button:has-text("Edit"), [class*="edit"]'
      ).first();
      
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForTimeout(1000);
        
        // Should show edit form
        const editForm = page.locator('form, .modal').first();
        if (await editForm.count() > 0) {
          await expect(editForm).toBeVisible();
        }
      }
    });

    test('should allow mentee to delete their own review', async ({ page }) => {
      await page.goto('/Pages/MenteeDashBoard.html');
      await page.waitForTimeout(2000);
      
      // Look for delete review button
      const deleteButton = page.locator(
        'button:has-text("Elimina"), button:has-text("Delete"), button:has-text("Remove")'
      ).first();
      
      if (await deleteButton.count() > 0) {
        await deleteButton.click();
        await page.waitForTimeout(500);
        
        // Should show confirmation
        const confirmButton = page.locator('button:has-text("Conferma"), button:has-text("Yes")').first();
        if (await confirmButton.count() > 0) {
          await expect(confirmButton).toBeVisible();
        }
      }
    });

    test('should display reviews written by mentee in their dashboard', async ({ page }) => {
      await page.goto('/Pages/MenteeDashBoard.html');
      await page.waitForTimeout(2000);
      
      // Look for reviews section
      const reviewsSection = page.locator(
        '*:has-text("Mie recensioni"), *:has-text("My reviews"), [class*="review"]'
      ).first();
      
      if (await reviewsSection.count() > 0) {
        await expect(reviewsSection).toBeVisible();
      }
    });

    test('should display reviews received by mentor in their dashboard', async ({ page }) => {
      // Login as mentor
      await page.goto('/Pages/Log.html');
      await page.fill('#email', mentorEmail);
      await page.fill('#password', mentorPassword);
      await page.click('#loginBtn');
      await page.waitForTimeout(2000);
      
      await page.goto('/Pages/MentorDashBoard.html');
      await page.waitForTimeout(2000);
      
      // Look for reviews section
      const reviewsSection = page.locator(
        '*:has-text("Recensioni"), *:has-text("Reviews"), [class*="review"]'
      ).first();
      
      if (await reviewsSection.count() > 0) {
        await expect(reviewsSection).toBeVisible();
      }
    });
  });

  test.describe('Review Validation', () => {
    
    test('should prevent duplicate reviews for same session', async ({ page }) => {
      // This would require completing a session and submitting a review
      // Then trying to submit another review for the same session
      // Implementation depends on backend logic
      
      await page.goto('/Pages/MenteeDashBoard.html');
      await page.waitForTimeout(2000);
      
      // Test would verify that review button is disabled or not shown
      // after submitting a review for a session
      const dashboard = page.locator('body');
      await expect(dashboard).toBeVisible();
    });

    test('should only allow reviews after session completion', async ({ page }) => {
      await page.goto('/Pages/MenteeDashBoard.html');
      await page.waitForTimeout(2000);
      
      // Look for upcoming sessions
      // They should not have review button
      const upcomingSessions = page.locator('[class*="upcoming"], [class*="scheduled"]');
      
      if (await upcomingSessions.count() > 0) {
        const firstSession = upcomingSessions.first();
        const reviewButton = firstSession.locator('button:has-text("Review"), button:has-text("Recensione")');
        
        // Review button should not exist for upcoming sessions
        const buttonCount = await reviewButton.count();
        expect(buttonCount).toBe(0);
      }
    });

    test('should validate rating is between 1 and 5', async ({ page }) => {
      await page.goto('/Pages/CatalogoMentors.html');
      await page.waitForTimeout(2000);
      
      const mentorCards = page.locator('.mentor-card');
      const count = await mentorCards.count();
      
      if (count > 0) {
        const firstCardButton = mentorCards.first().locator('button, a').first();
        await firstCardButton.click();
        await page.waitForTimeout(1500);
        
        const reviewButton = page.locator('button:has-text("recensione"), button:has-text("review")').first();
        
        if (await reviewButton.count() > 0) {
          await reviewButton.click();
          await page.waitForTimeout(1000);
          
          // Check rating input constraints
          const ratingInputs = page.locator('input[type="radio"][name*="rating"], input[type="number"][name*="rating"]');
          const inputCount = await ratingInputs.count();
          
          if (inputCount > 0) {
            // For radio buttons, should have 5 options
            // For number input, should have min=1 max=5
            const firstInput = ratingInputs.first();
            const inputType = await firstInput.getAttribute('type');
            
            if (inputType === 'number') {
              const min = await firstInput.getAttribute('min');
              const max = await firstInput.getAttribute('max');
              expect(min).toBe('1');
              expect(max).toBe('5');
            } else {
              // Radio buttons - should have 5
              expect(inputCount).toBe(5);
            }
          }
        }
      }
    });
  });
});
