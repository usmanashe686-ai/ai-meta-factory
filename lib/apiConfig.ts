// lib/apiConfig.ts
// Centralized API configuration – uses environment variables with NO localhost fallback.

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// If you need separate URLs for different services, add them here:
export const BUILD_SERVICE_URL = process.env.NEXT_PUBLIC_BUILD_SERVICE_URL;
export const FLASK_URL = process.env.NEXT_PUBLIC_FLASK_URL;
export const REAL_TIME_URL = process.env.NEXT_PUBLIC_REAL_TIME_URL;
export const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL; // if you have this secret

// Optional: throw an error if required variables are missing in production
if (process.env.NODE_ENV === 'production') {
  if (!API_BASE_URL) throw new Error('NEXT_PUBLIC_API_URL is not defined');
  if (!BUILD_SERVICE_URL) throw new Error('NEXT_PUBLIC_BUILD_SERVICE_URL is not defined');
  // Add checks for other required URLs as needed
}
