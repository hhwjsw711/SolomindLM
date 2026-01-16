/**
 * Auth utility for getting user ID in service files
 * 
 * This is a temporary solution that reads from localStorage.
 * The AuthContext stores user in React state, but service files
 * can't use React hooks. We need to sync the user to localStorage
 * when it changes in AuthContext.
 */

export interface StoredUser {
  id: string;
  email: string;
}

const USER_STORAGE_KEY = 'solomind_auth_user';

/**
 * Get the current user ID from localStorage
 * Returns null if not authenticated
 */
export function getUserId(): string | null {
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (!storedUser) return null;
    
    const user: StoredUser = JSON.parse(storedUser);
    return user.id || null;
  } catch (error) {
    console.error('Error reading user from localStorage:', error);
    return null;
  }
}

/**
 * Get the full user object from localStorage
 * Returns null if not authenticated
 */
export function getUser(): StoredUser | null {
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (!storedUser) return null;
    
    return JSON.parse(storedUser);
  } catch (error) {
    console.error('Error reading user from localStorage:', error);
    return null;
  }
}

/**
 * Store user in localStorage (called by AuthContext)
 * @internal - Should only be called by AuthContext
 */
export function setStoredUser(user: StoredUser | null): void {
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error storing user in localStorage:', error);
  }
}
