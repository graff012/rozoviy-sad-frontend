// API Configuration
// Provide safe defaults in case VITE_* envs are not set in production
const ENV_API_URL = (import.meta.env.VITE_API_URL as string | undefined);
export const API_URL: string = (ENV_API_URL && ENV_API_URL.length > 0)
  ? ENV_API_URL
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

export const CARD_NUMBER = "4073 4200 8477 5133";

export const S3_BASE_URL = `https://${import.meta.env.VITE_S3_BUCKET_NAME}.s3.${import.meta.env.VITE_S3_REGION
  }.amazonaws.com`;
