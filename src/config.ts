const DEFAULT_API_URL = "https://rozoviy-sad-production.up.railway.app/api";
const ENV_API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.trim();

// Requests may intentionally use a relative `/api` in some deployments.
export const API_URL: string =
  ENV_API_URL && ENV_API_URL.length > 0 ? ENV_API_URL : DEFAULT_API_URL;

const getBaseUrlFromApi = (apiUrl: string): string => {
  const url = new URL(apiUrl);
  const path = url.pathname.replace(/\/?api\/?$/, "/");
  return `${url.origin}${path === "/" ? "" : path}`;
};

// Images must resolve against the real backend origin.
// If VITE_API_URL is relative in production, fall back to the known backend host
// instead of window.location.origin to avoid broken `images/...` requests on Vercel.
export const BASE_URL: string = (() => {
  try {
    if (ENV_API_URL && /^https?:\/\//i.test(ENV_API_URL)) {
      return getBaseUrlFromApi(ENV_API_URL);
    }

    return getBaseUrlFromApi(DEFAULT_API_URL);
  } catch {
    return "https://rozoviy-sad-production.up.railway.app";
  }
})();

export const CARD_NUMBER = "4073 4200 8477 5133";

export const S3_BASE_URL = `https://${import.meta.env.VITE_S3_BUCKET_NAME}.s3.${import.meta.env.VITE_S3_REGION
  }.amazonaws.com`;
