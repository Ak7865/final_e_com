/** Production fallback — override via NEXT_PUBLIC_APP_URL or NEXTAUTH_URL in env */
export const PRODUCTION_SITE_URL = "https://final-e-com.vercel.app";

export function getSiteUrl() {
  return (
    process.env.AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    PRODUCTION_SITE_URL
  ).replace(/\/$/, "");
}

export const GOOGLE_CALLBACK_PATH = "/api/auth/callback/google";

export function getGoogleCallbackUrl() {
  return `${getSiteUrl()}${GOOGLE_CALLBACK_PATH}`;
}
