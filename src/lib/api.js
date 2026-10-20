/**
 * API configuration helper for LeaveFlow frontend
 * Connects frontend to backend via environment variable VITE_API_URL
 *
 * In local development:
 *   VITE_API_URL=http://localhost:5000 (or leave empty to use Vite proxy)
 *
 * In production hosting (Vercel, Netlify, Render, Railway, AWS):
 *   VITE_API_URL=https://your-backend-api.com
 */
const rawBaseUrl = import.meta.env.VITE_API_URL || "";

// Normalize base URL (strip trailing slashes)
export const API_BASE_URL = rawBaseUrl.trim().replace(/\/+$/, "");

/**
 * Builds the full URL for any API endpoint using VITE_API_URL
 * @param {string} endpoint - API path, e.g. "/api/leaves"
 * @returns {string} - Full URL or relative path
 */
export const apiUrl = (endpoint) => {
  if (!API_BASE_URL) return endpoint;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${path}`;
};

export default {
  API_BASE_URL,
  apiUrl,
};
