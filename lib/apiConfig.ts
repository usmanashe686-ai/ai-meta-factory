// ============================================================================
// AI Meta Factory – Central API Configuration
// This file provides a single source of truth for all API endpoints.
// It prevents accidental localhost usage in production builds.
// ============================================================================

// Core API endpoints from environment variables
export const API_CONFIG = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "",
  FLASK_URL: process.env.NEXT_PUBLIC_FLASK_URL || "",
  BUILD_SERVICE_URL: process.env.NEXT_PUBLIC_BUILD_SERVICE_URL || "",
  REAL_TIME_URL: process.env.NEXT_PUBLIC_REAL_TIME_URL || ""
};

// Default base API used by AI-related services
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_FLASK_URL ||
  "";

// Helper getters for services
export const BUILD_SERVICE_URL =
  process.env.NEXT_PUBLIC_BUILD_SERVICE_URL || "";

export const AI_API_URL =
  process.env.NEXT_PUBLIC_FLASK_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "";

export const REALTIME_URL =
  process.env.NEXT_PUBLIC_REAL_TIME_URL || "";

// -----------------------------------------------------------------------------
// Safety check: warn if localhost appears in configuration
// -----------------------------------------------------------------------------
if (typeof window !== "undefined") {
  const urls = Object.values(API_CONFIG);

  urls.forEach((url) => {
    if (url && url.includes("localhost")) {
      console.warn(
        "⚠️ Warning: localhost detected in API configuration. Replace with production URL."
      );
    }
  });
}
