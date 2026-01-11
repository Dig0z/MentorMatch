/**
 * Test data generators and fixtures for E2E tests
 */

const generateRandomEmail = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `test-${timestamp}-${random}@mentormatch.test`;
};

const generateRandomUsername = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `testuser_${timestamp}_${random}`;
};

/**
 * Test user data
 */
const testUsers = {
  mentee: {
    email: generateRandomEmail(),
    password: 'Test123!@#',
    name: 'Test Mentee',
    role: 'mentee'
  },
  mentor: {
    email: generateRandomEmail(),
    password: 'Test123!@#',
    name: 'Test Mentor',
    role: 'mentor',
    skills: ['JavaScript', 'React', 'Node.js'],
    bio: 'Experienced software developer with 10+ years in web development',
    hourlyRate: 50
  },
  admin: {
    email: 'admin@mentormatch.test',
    password: 'Admin123!@#',
    role: 'admin'
  }
};

/**
 * Test session data
 */
const testSession = {
  title: 'JavaScript Fundamentals',
  description: 'Learn the basics of JavaScript programming',
  duration: 60,
  price: 50
};

/**
 * Test review data
 */
const testReview = {
  rating: 5,
  comment: 'Excellent mentor! Very helpful and knowledgeable.'
};

module.exports = {
  generateRandomEmail,
  generateRandomUsername,
  testUsers,
  testSession,
  testReview
};
