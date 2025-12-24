import { API_CONFIG } from "@/lib/constants";
import { authClient } from "./auth";

export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
};

export type PaginatedData<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, string>;

  constructor(code: string, message: string, status: number, details?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
};

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
    this.defaultTimeout = API_CONFIG.timeout;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {}, timeout = this.defaultTimeout } = options;

    const url = `${this.baseUrl}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Get cookies from Better Auth for Expo compatibility
      const cookies = (await import("./auth")).authClient.getCookie();
      console.log(`[API ${method}] ${endpoint}`);
      console.log(`[API ${method}] Cookies:`, cookies || "none");

      // Build headers with cookies for React Native/Expo
      const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...headers,
      };

      // Manually add cookies for Expo (credentials: "include" doesn't work in RN)
      if (cookies) {
        requestHeaders["Cookie"] = cookies;
      }

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        credentials: "omit", // Use "omit" when manually setting cookies (Expo best practice)
      });

      clearTimeout(timeoutId);

      const data = await response.json() as ApiResponse<T>;

      if (!response.ok || !data.success) {
        const error = !data.success ? data.error : { code: "UNKNOWN", message: "An error occurred" };
        throw new ApiError(
          error.code,
          error.message,
          response.status,
          error.details
        );
      }

      return data.data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new ApiError("TIMEOUT", "Request timed out", 408);
        }
        throw new ApiError("NETWORK_ERROR", error.message, 0);
      }

      throw new ApiError("UNKNOWN", "An unknown error occurred", 0);
    }
  }

  async get<T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  async put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  async delete<T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }

  // Raw fetch for file uploads (no JSON handling)
  async uploadRaw(endpoint: string, body: BodyInit, headers: Record<string, string> = {}): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;

    // Get cookies from Better Auth for Expo compatibility
    const cookies = (await import("./auth")).authClient.getCookie();
    const requestHeaders: Record<string, string> = { ...headers };

    // Manually add cookies for Expo
    if (cookies) {
      requestHeaders["Cookie"] = cookies;
    }

    const response = await fetch(url, {
      method: "PUT",
      headers: requestHeaders,
      body,
      credentials: "omit", // Use "omit" when manually setting cookies (Expo best practice)
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: { code: "UNKNOWN", message: "Upload failed" } }));
      throw new ApiError(
        data.error?.code || "UPLOAD_ERROR",
        data.error?.message || "Upload failed",
        response.status
      );
    }

    return response;
  }
}

export const apiClient = new ApiClient();
