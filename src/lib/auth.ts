/**
 * @deprecated This file is deprecated. Use '@/lib/api/auth' instead.
 *
 * Legacy authentication utilities - kept for backward compatibility only.
 * All new code should import from '@/lib/api/auth'.
 */

// Re-export from new structure
export {
  type User,
  setToken,
  getToken,
  clearToken,
  parseJwt,
  isTokenExpired,
} from './api/auth';
