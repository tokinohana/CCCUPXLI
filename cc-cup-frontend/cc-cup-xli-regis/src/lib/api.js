/**
 * API client for the CC Cup XLI Django/DRF backend.
 * One place for the host: VITE_API_BASE_URL.
 */

export const API_BASE_URL = (
  import.meta.env["VITE_API_BASE_URL"] ?? "https://api.cccup.id/api/regis"
).replace(/\/+$/, "");

const REFRESH_STORAGE_KEY = "cccup.refresh";

// Access token lives in memory only; refresh token is persisted.
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setRefreshToken(token) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(REFRESH_STORAGE_KEY, token);
  else window.localStorage.removeItem(REFRESH_STORAGE_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_STORAGE_KEY);
}

export function clearTokens() {
  setAccessToken(null);
  setRefreshToken(null);
}

export class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }

  get fieldErrors() {
    if (this.data && typeof this.data === "object" && !Array.isArray(this.data)) {
      return this.data;
    }
    return {};
  }
}

async function parseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractMessage(data, fallback) {
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    if ("detail" in data && typeof data.detail === "string") return data.detail;
    if ("non_field_errors" in data && Array.isArray(data.non_field_errors)) {
      return data.non_field_errors.join(" ");
    }
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const val = data[firstKey];
      if (Array.isArray(val)) return `${firstKey}: ${val.join(" ")}`;
      if (typeof val === "string") return `${firstKey}: ${val}`;
    }
  }
  return fallback;
}

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    clearTokens();
    return false;
  }

  const data = await response.json();
  if (!data.access) return false;
  setAccessToken(data.access);
  // Refresh tokens rotate — always store the new one.
  if (data.refresh) setRefreshToken(data.refresh);
  return true;
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, auth = true, multipart = false } = options;

  const send = async () => {
    const headers = {};
    if (!multipart && body !== undefined) headers["Content-Type"] = "application/json";
    if (auth && accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
    const payload =
      body === undefined ? null : multipart ? body : JSON.stringify(body);
    return fetch(`${API_BASE_URL}${path}`, { method, headers, body: payload });
  };

  let response = await send();

  // One silent refresh + one retry on 401.
  if (response.status === 401 && auth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) response = await send();
  }

  const data = await parseBody(response);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      extractMessage(data, `Request failed (${response.status})`),
      data
    );
  }

  return data;
}