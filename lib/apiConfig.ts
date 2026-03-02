// Central API configuration (Production Safe)

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
