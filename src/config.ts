// API Configuration
// Provide safe defaults in case VITE_* envs are not set in production
const ENV_API_URL = (import.meta.env.VITE_API_URL as string | undefined);
export const API_URL: string = ENV_API_URL && ENV_API_URL.length > 0
  ? ENV_API_URL
  : `${window.location.origin}/api`;

// Base site origin (without /api). Defensive in case API_URL is like .../api or ...api
export const BASE_URL: string = API_URL.replace('/api', '').replace('api', '');

export const CARD_NUMBER = "2345 2344 2445 5432";

export const S3_BASE_URL = `https://${import.meta.env.VITE_S3_BUCKET_NAME}.s3.${import.meta.env.VITE_S3_REGION
  }.amazonaws.com`;
