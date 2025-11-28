const rawApiBaseUrl = import.meta.env.VITE_API_URL?.trim();

if (!rawApiBaseUrl) {
  throw new Error(
    "Missing VITE_API_URL environment variable. Please define it in your .env file."
  );
}

const sanitizeUrl = (url: string) => url.replace(/\/+$/, "");

export const API_BASE_URL = sanitizeUrl(rawApiBaseUrl);

export const API_DOCS_URL = sanitizeUrl(
  import.meta.env.VITE_API_DOCS_URL?.trim() || `${API_BASE_URL}/docs`
);


