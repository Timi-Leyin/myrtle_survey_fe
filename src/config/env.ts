const sanitizeUrl = (url: string) => url.replace(/\/+$/, "");

const rawApiBaseUrl = "https://myrtlesurveybe-production-5e42.up.railway.app";

if (!rawApiBaseUrl) {
  console.warn(
    "[config/env] VITE_API_URL is not defined. Falling back to window.location.origin (or http://localhost:3000 in SSR). " +
      "Please create a .env file and set VITE_API_URL to your backend host."
  );
}

export const API_BASE_URL = sanitizeUrl(rawApiBaseUrl);


export const API_DOCS_URL = ""
