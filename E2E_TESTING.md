# End-to-End Testing with Playwright

> **Note:** E2E tests (Playwright) are separate from unit tests (Jest):
> - **Unit tests**: Run with `npm test` (Jest) - located in `BackEnd/test/`
> - **E2E tests**: Run with `npm run test:e2e` (Playwright) - located in `e2e/`

### Test Coverage

Our E2E test suite covers:

- **Authentication**: Registration, login, logout, session persistence
- **Mentor Catalog**: Browsing, filtering, searching mentors
- **Mentor Profiles**: Viewing profiles, skills, reviews
- **Session Booking**: Booking sessions, managing availability, calendar integration
- **Review System**: Writing, viewing, managing reviews

---

## Prerequisites

Before running E2E tests, ensure you have:

- **Node.js** (v22.x or higher)
- **PostgreSQL** (v15 or higher) running locally
- **Environment variables** configured in `BackEnd/.env`

---

## Installation

### 1. Install Dependencies

```bash
npm install
```

This installs Playwright and all test dependencies.

### 2. Install Playwright Browsers

```bash
npx playwright install chromium
```

For testing on multiple browsers:

```bash
npx playwright install
```

### 3. Setup Test Database

Create a test database and run migrations:

```bash
# Create test database
psql -U postgres -c "CREATE DATABASE mentormatch_test;"

# Run schema
psql -U postgres -d mentormatch_test < DataBase/Mentormatch.sql
```

### 4. Configure Environment

Create or update `BackEnd/.env` with test database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mentormatch_test
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SCHEMA=Mentormatch

JWT_SECRET=your_test_jwt_secret
SENDGRID_API_KEY=your_sendgrid_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

PORT=3000
NODE_ENV=test
```

---

## Running Tests

### Start the Application Server

Before running tests, start the application:

```bash
npm run start:test
```

This starts the server in test mode on port 3000.

### Run All Tests

```bash
npm run test:e2e
```

### Run Tests in UI Mode (Interactive)

```bash
npm run test:e2e:ui
```

UI mode provides an interactive interface to:
- Watch tests run in real-time
- Step through tests
- Inspect DOM and network activity
- Time-travel through test execution

### Run Tests in Headed Mode (See Browser)

```bash
npm run test:e2e:headed
```

### Run Tests in Debug Mode

```bash
npm run test:e2e:debug
```

Debug mode allows you to:
- Set breakpoints in your tests
- Step through test execution
- Inspect page state
- Use Playwright Inspector

### Run Specific Test Files

```bash
npx playwright test auth.spec.js
npx playwright test mentor-catalog.spec.js
```

### Run Specific Test Cases

```bash
npx playwright test -g "should successfully login"
```

### View Test Report

After tests complete:

```bash
npm run test:report
```

This opens an HTML report with detailed test results, screenshots, and traces.

---

## Test Structure

### Directory Layout

```
MentorMatch/
├── e2e/                          # E2E tests directory
│   ├── fixtures/                 # Custom test fixtures
│   │   └── authenticated.js      # Authenticated user fixtures
│   ├── utils/                    # Test utilities
│   │   ├── test-data.js         # Test data generators
│   │   └── helpers.js           # Helper functions
│   ├── auth.spec.js             # Authentication tests
│   ├── mentor-catalog.spec.js   # Mentor catalog tests
│   ├── session-booking.spec.js  # Session booking tests
│   └── reviews.spec.js          # Review system tests
├── playwright.config.js          # Playwright configuration
└── package.json                  # Scripts and dependencies
```

### Test Files

#### `e2e/auth.spec.js`
Tests for user registration, login, logout, and session management.

**Test Cases:**
- Display registration/login forms
- Successful registration (mentee/mentor)
- Password validation
- Email uniqueness
- Successful login
- Invalid credentials handling
- Session persistence

#### `e2e/mentor-catalog.spec.js`
Tests for browsing and filtering mentors.

**Test Cases:**
- Display mentor catalog
- Filter by sector/skills
- Search by name
- Display mentor cards
- Navigate to mentor profiles
- Mentor profile information
- Booking button visibility

#### `e2e/session-booking.spec.js`
Tests for the complete session booking flow.

**Test Cases:**
- Navigate to booking form
- Display available time slots
- Select date and time
- Submit booking
- View booked sessions
- Cancel sessions
- Mentor availability management
- Accept/reject session requests

#### `e2e/reviews.spec.js`
Tests for the review system.

**Test Cases:**
- Display review form
- Submit reviews with rating and comment
- Rating validation (1-5)
- View reviews on mentor profile
- Display average rating
- Sort and paginate reviews
- Edit/delete own reviews

---

## Writing Tests

### Basic Test Structure

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Feature Name', () => {
  
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/Pages/Home.html');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.goto('/Pages/SomePage.html');
    
    // Act
    await page.click('#some-button');
    
    // Assert
    await expect(page.locator('#result')).toBeVisible();
  });
});
```

### Using Helper Functions

```javascript
const { login, register } = require('./utils/helpers');
const { generateRandomEmail } = require('./utils/test-data');

test('should access protected page', async ({ page }) => {
  // Use helper to register and login
  const email = generateRandomEmail();
  await register(page, {
    email,
    password: 'Test123!@#',
    name: 'Test User',
    role: 'mentee'
  });
  
  await login(page, email, 'Test123!@#');
  
  // Now user is logged in
  await page.goto('/Pages/MenteeDashBoard.html');
  await expect(page).toHaveURL(/Dashboard/);
});
```

### Using Custom Fixtures

```javascript
const { test, expect } = require('./fixtures/authenticated');

test('should book a session', async ({ authenticatedMenteePage }) => {
  // This page is already logged in as a mentee
  await authenticatedMenteePage.goto('/Pages/CatalogoMentors.html');
  
  // Continue with test...
});
```

### Generating Test Data

```javascript
const { generateRandomEmail, testUsers, testSession } = require('./utils/test-data');

test('should create user', async ({ page }) => {
  const email = generateRandomEmail(); // Unique email
  
  // Or use predefined test data
  const userData = {
    ...testUsers.mentee,
    email: generateRandomEmail() // Override with unique email
  };
});
```

## CI/CD Integration

### GitHub Actions Workflow

E2E tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

### Workflow Steps

1. **Setup**: Install Node.js, dependencies, and Playwright browsers
2. **Database**: Start PostgreSQL service and load schema
3. **Environment**: Create test environment configuration
4. **Server**: Start application server
5. **Tests**: Run Playwright E2E tests
6. **Artifacts**: Upload test reports and screenshots

### Viewing CI Test Results

Download:
   - `playwright-report` - Full HTML report
   - `playwright-screenshots` - Screenshots from failed tests (if any)

### Local Testing Before Push

Always run tests locally before pushing:

```bash
# Run all tests
npm run test:e2e

# Fix any failures
# ...

# Commit and push
git add .
git commit -m "Your changes"
git push
```
