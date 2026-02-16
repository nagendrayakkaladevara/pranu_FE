import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/v1";

interface ApiError {
  code: number;
  message: string;
}

class ApiClient {
  private isRefreshing = false;
  private refreshQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
  }> = [];

  private getToken(): string | null {
    return localStorage.getItem("access_token");
  }

  private clearTokens(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_expires");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }

  private async attemptRefresh(): Promise<string> {
    if (this.isRefreshing) {
      // Queue subsequent 401 requests while refreshing
      return new Promise((resolve, reject) => {
        this.refreshQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      this.isRefreshing = false;
      throw new Error("No refresh token");
    }

    try {
      const response = await fetch(`${API_BASE}/auth/refresh-tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Refresh failed");
      }

      const data = await response.json();
      const newAccessToken = data.tokens.access.token;

      localStorage.setItem("access_token", newAccessToken);
      localStorage.setItem("token_expires", data.tokens.access.expires);
      localStorage.setItem("refresh_token", data.tokens.refresh.token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Resolve queued requests
      this.refreshQueue.forEach(({ resolve }) => resolve(newAccessToken));
      this.refreshQueue = [];

      return newAccessToken;
    } catch (error) {
      this.refreshQueue.forEach(({ reject }) => reject(error));
      this.refreshQueue = [];
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false,
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 && !isRetry) {
        try {
          const newToken = await this.attemptRefresh();
          // Retry original request with new token
          const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
          return this.request<T>(
            endpoint,
            { ...options, headers: retryHeaders },
            true,
          );
        } catch {
          this.clearTokens();
          toast.error("Session expired. Please log in again.");
          window.location.href = "/login";
          return new Promise<T>(() => { }); // page is redirecting
        }
      }

      if (response.status === 401) {
        this.clearTokens();
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
        return new Promise<T>(() => { }); // page is redirecting
      }

      const error: ApiError = await response.json().catch(() => ({
        code: response.status,
        message: response.statusText,
      }));
      throw new Error(error.message);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  get<T>(endpoint: string, signal?: AbortSignal) {
    return this.request<T>(endpoint, { signal });
  }

  post<T>(endpoint: string, body: unknown, signal?: AbortSignal) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      signal,
    });
  }

  patch<T>(endpoint: string, body: unknown, signal?: AbortSignal) {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
      signal,
    });
  }

  delete<T>(endpoint: string, signal?: AbortSignal) {
    return this.request<T>(endpoint, { method: "DELETE", signal });
  }
}

export const api = new ApiClient();
