import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/v1";

interface ApiError {
  code: number;
  message: string;
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem("access_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
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
      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token_expires");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
        return new Promise<T>(() => {}); // never resolves — page is redirecting
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
