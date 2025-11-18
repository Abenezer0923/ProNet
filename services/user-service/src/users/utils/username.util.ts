/**
 * Username utility functions
 * Generates and validates usernames following LinkedIn-style conventions
 */

/**
 * Generate a username from first and last name
 * Format: firstname-lastname or firstname-lastname-{random}
 */
export function generateUsername(firstName: string, lastName: string): string {
  // Clean and normalize names
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Base username
  let username = `${cleanFirst}-${cleanLast}`;
  
  // Ensure it's not too long
  if (username.length > 25) {
    username = username.substring(0, 25);
  }
  
  return username;
}

/**
 * Generate a unique username by adding random suffix
 */
export function generateUniqueUsername(
  firstName: string,
  lastName: string,
  existingUsernames: string[] = [],
): string {
  let username = generateUsername(firstName, lastName);
  
  // If username exists, add random numbers
  if (existingUsernames.includes(username)) {
    const random = Math.floor(Math.random() * 9999);
    username = `${username}-${random}`;
  }
  
  return username;
}

/**
 * Validate username format
 * Rules:
 * - 3-30 characters
 * - Alphanumeric, hyphens, underscores only
 * - Must start with letter or number
 * - Cannot end with hyphen or underscore
 */
export function validateUsername(username: string): {
  valid: boolean;
  error?: string;
} {
  if (!username) {
    return { valid: false, error: 'Username is required' };
  }
  
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  
  if (username.length > 30) {
    return { valid: false, error: 'Username must be at most 30 characters' };
  }
  
  // Check format
  const usernameRegex = /^[a-z0-9][a-z0-9_-]*[a-z0-9]$/i;
  if (!usernameRegex.test(username)) {
    return {
      valid: false,
      error: 'Username can only contain letters, numbers, hyphens, and underscores',
    };
  }
  
  // Reserved usernames
  const reserved = [
    'admin',
    'api',
    'www',
    'app',
    'help',
    'support',
    'settings',
    'profile',
    'login',
    'register',
    'signup',
    'signin',
    'signout',
    'logout',
    'dashboard',
    'feed',
    'notifications',
    'messages',
    'search',
    'explore',
    'discover',
  ];
  
  if (reserved.includes(username.toLowerCase())) {
    return { valid: false, error: 'This username is reserved' };
  }
  
  return { valid: true };
}

/**
 * Normalize username for comparison (case-insensitive)
 */
export function normalizeUsername(username: string): string {
  return username.toLowerCase().trim();
}
