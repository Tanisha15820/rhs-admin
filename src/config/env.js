/**
 * Centralized Vite Environment Configuration for RHS Admin Dashboard
 */

export const ENV = {
  API_BASE_URL:
    import.meta.env?.VITE_API_BASE_URL ||
    import.meta.env?.VITE_API_URL ||
    "",
  SITE_URL:
    import.meta.env?.VITE_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : ""),
  BASE_PATH: import.meta.env?.VITE_BASE_PATH || import.meta.env?.BASE_URL || "/",
};

/**
 * Resolve the normalized base API endpoint URL (always ending in `/api` without duplicates).
 * In Vite development mode (`import.meta.env.DEV`), returns `/api` so requests use Vite's
 * same-origin `/api` proxy (works seamlessly across `localhost`, `127.0.0.1`, and LAN IPs).
 */
export const getBaseApiUrl = () => {
  if (import.meta.env?.DEV) {
    return "/api";
  }

  const rawUrl = ENV.API_BASE_URL ? String(ENV.API_BASE_URL).trim() : "";
  if (!rawUrl || rawUrl === "/" || rawUrl === "/api") {
    return "/api";
  }

  let clean = rawUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

  if (
    typeof window !== "undefined" &&
    window.location?.hostname &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    clean = clean.replace(
      /^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?/i,
      `$1${window.location.hostname}$3`
    );
  }

  return `${clean}/api`;
};
