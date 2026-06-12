import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type {
  Ticket,
  AuthTokens,
  CreateTicketPayload,
  RedeemResponse,
  ScannerResult,
  TicketListParams,
} from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// Token storage helpers
// ─────────────────────────────────────────────────────────────────────────────
const TOKEN_KEY = "ticketing_access";
const REFRESH_KEY = "ticketing_refresh";

export const tokenStore = {
  getAccess: (): string | null => localStorage.getItem(TOKEN_KEY),
  getRefresh: (): string | null => localStorage.getItem(REFRESH_KEY),
  setTokens: ({ access, refresh }: AuthTokens) => {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
  isAuthenticated: (): boolean => !!localStorage.getItem(TOKEN_KEY),
};

// ─────────────────────────────────────────────────────────────────────────────
// Axios instance
// ─────────────────────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: "/api/ticketing",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT access token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccess();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─────────────────────────────────────────────────────────────────────────────
// Auto-refresh on 401
// ─────────────────────────────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh on 401 and if we haven't retried yet
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = tokenStore.getRefresh();
    if (!refreshToken) {
      tokenStore.clear();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until refresh completes
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<AuthTokens>(
        "/api/ticketing/auth/refresh/",
        { refresh: refreshToken }
      );
      tokenStore.setTokens(data);
      processQueue(null, data.access);
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as Error, null);
      tokenStore.clear();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Auth service
// ─────────────────────────────────────────────────────────────────────────────
export const authService = {
  login: async (email: string, password: string): Promise<AuthTokens> => {
    const { data } = await api.post<AuthTokens>("/auth/login/", {
      email,
      password,
    });
    tokenStore.setTokens(data);
    return data;
  },

  refresh: async (): Promise<AuthTokens> => {
    const refreshToken = tokenStore.getRefresh();
    if (!refreshToken) throw new Error("No refresh token");
    const { data } = await api.post<AuthTokens>("/auth/refresh/", {
      refresh: refreshToken,
    });
    tokenStore.setTokens(data);
    return data;
  },

  logout: () => {
    tokenStore.clear();
    window.location.href = "/login";
  },

  isAuthenticated: (): boolean => tokenStore.isAuthenticated(),
};

// ─────────────────────────────────────────────────────────────────────────────
// Ticket service
// ─────────────────────────────────────────────────────────────────────────────
export const apiService = {
  // List tickets with optional filters
  getTickets: async (params?: TicketListParams): Promise<Ticket[]> => {
    const { data } = await api.get<Ticket[]>("/tickets/", { params });
    return data;
  },

  // Get single ticket detail
  getTicket: async (ticketId: string): Promise<Ticket> => {
    const { data } = await api.get<Ticket>(`/tickets/${ticketId}/`);
    return data;
  },

  // Create a new ticket
  createTicket: async (payload: CreateTicketPayload): Promise<Ticket> => {
    const { data } = await api.post<Ticket>("/tickets/", payload);
    return data;
  },

  // Update ticket status (mark paid / void)
  updateTicketStatus: async (
    ticketId: string,
    status: "paid" | "pending" | "voided"
  ): Promise<Ticket> => {
    const { data } = await api.patch<Ticket>(`/tickets/${ticketId}/`, {
      status,
    });
    return data;
  },

  // Check NIK uniqueness
  verifyNIK: async (nik: string): Promise<{ exists: boolean }> => {
    const { data } = await api.get<{ exists: boolean }>(
      "/tickets/verify-nik/",
      { params: { nik } }
    );
    return data;
  },

  // Redeem (gate scan) — concurrency-safe
  redeemTicket: async (
    ticketId: string,
    terminal: string
  ): Promise<RedeemResponse> => {
    try {
      const { data } = await api.post<RedeemResponse>(
        `/tickets/${ticketId}/redeem/`,
        { terminal }
      );
      return data;
    } catch (err) {
      const axiosErr = err as AxiosError<RedeemResponse>;
      // Backend returns 404 for invalid, 409 for already redeemed, 403 for unpaid
      if (axiosErr.response?.data) {
        return axiosErr.response.data;
      }
      return { success: false, error: "NETWORK_ERROR" };
    }
  },

  // Scan by QR code (UUID is embedded in the QR)
  scanTicket: async (
    decodedQr: string,
    terminal: string = "GATE-1"
  ): Promise<ScannerResult> => {
    return apiService.redeemTicket(decodedQr, terminal);
  },

  // Export CSV — triggers browser download
  exportTickets: async (params?: TicketListParams): Promise<void> => {
    const { data } = await api.get("/tickets/export/", {
      params,
      responseType: "blob",
    });
    // Create a temporary download link
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "tickets_export.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default api;
