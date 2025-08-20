// API Configuration
// Provide safe defaults in case VITE_* envs are not set in production
const ENV_API_URL = (import.meta.env.VITE_API_URL as string | undefined);

// Ensure the API URL always contains the backend global prefix '/api'
function withApiSuffix(value: string): string {
  try {
    // If absolute URL, use URL API to normalize
    if (/^https?:\/\//i.test(value)) {
      const u = new URL(value);
      // If path doesn't end with /api, append it
      if (!/\/api\/?$/i.test(u.pathname)) {
        u.pathname = `${u.pathname.replace(/\/$/, '')}/api`;
      }
      // Remove trailing slash for consistency
      return u.toString().replace(/\/$/, '');
    }
    // Relative or origin-like
    return /\/api\/?$/i.test(value)
      ? value.replace(/\/$/, '')
      : `${value.replace(/\/$/, '')}/api`;
  } catch {
    // Fallback to original value if parsing fails
    return value;
  }
}

export const API_URL: string = (ENV_API_URL && ENV_API_URL.length > 0)
  ? withApiSuffix(ENV_API_URL)
  : `${window.location.origin}/api`;

// Base site origin (without /api). Compute defensively to avoid calling .replace on undefined
export const BASE_URL: string = (() => {
  try {
    const origin = window.location.origin;
    if (!API_URL) return origin;
    // Ensure we have an absolute URL to parse
    const api = API_URL.startsWith('http') ? API_URL : `${origin}${API_URL.startsWith('/') ? '' : '/'}${API_URL}`;
    const url = new URL(api);
    // Strip trailing '/api' segment if present
    const path = url.pathname.replace(/\/?api\/?$/, '/');
    return `${url.origin}${path === '/' ? '' : path}`;
  } catch {
    return window.location.origin;
  }
})();

export const CARD_NUMBER = "2345 2344 2445 5432";

export const S3_BASE_URL = `https://${import.meta.env.VITE_S3_BUCKET_NAME}.s3.${import.meta.env.VITE_S3_REGION
  }.amazonaws.com`;
