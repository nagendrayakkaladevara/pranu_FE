import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import type { AuthState, LoginCredentials, User, LoginResponse } from "@/types/auth";
import { api } from "@/lib/api";
import { AuthContext } from "./authContextDef";
import { toast } from "sonner";

function clearAllTokens() {
  localStorage.removeItem("user");
  localStorage.removeItem("access_token");
  localStorage.removeItem("token_expires");
  localStorage.removeItem("refresh_token");
}

function loadStoredUser(): AuthState {
  const storedUser = localStorage.getItem("user");
  const storedToken = localStorage.getItem("access_token");
  const tokenExpiry = localStorage.getItem("token_expires");

  if (storedUser && storedToken && tokenExpiry) {
    const isExpired = new Date(tokenExpiry) <= new Date();
    if (!isExpired) {
      return {
        user: JSON.parse(storedUser) as User,
        isAuthenticated: true,
        isLoading: false,
      };
    }
    // Access token expired — clear storage
    clearAllTokens();
  }

  return { user: null, isAuthenticated: false, isLoading: false };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadStoredUser);

  const warnedRef = useRef(false);
  const refreshingRef = useRef(false);

  // Check token expiry periodically, warn 2 min before, attempt refresh 5 min before
  useEffect(() => {
    const interval = setInterval(() => {
      const tokenExpiry = localStorage.getItem("token_expires");
      if (!tokenExpiry) return;

      const msLeft = new Date(tokenExpiry).getTime() - Date.now();

      if (msLeft <= 0) {
        clearAllTokens();
        setState({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // Attempt silent refresh 5 minutes before expiry
      if (msLeft <= 5 * 60_000 && !refreshingRef.current) {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) return;
        refreshingRef.current = true;
        api.post<LoginResponse>("/auth/refresh-tokens", {
          refreshToken,
        })
          .then((data) => {
            localStorage.setItem("access_token", data.tokens.access.token);
            localStorage.setItem("token_expires", data.tokens.access.expires);
            localStorage.setItem("refresh_token", data.tokens.refresh.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            warnedRef.current = false;
          })
          .catch(() => {
            // Refresh failed — warning will show at 2 min mark
          })
          .finally(() => {
            refreshingRef.current = false;
          });
      }

      // Warn 2 minutes before expiry
      if (msLeft <= 2 * 60_000 && !warnedRef.current) {
        warnedRef.current = true;
        toast.warning("Your session expires soon. Please save your work.", {
          duration: 10_000,
        });
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Sync logout/login across browser tabs via storage events
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "access_token") {
        if (!e.newValue) {
          // Token removed in another tab → log out here
          setState({ user: null, isAuthenticated: false, isLoading: false });
        } else {
          // Token set in another tab → reload user
          setState(loadStoredUser());
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const data = await api.post<LoginResponse>("/auth/login", credentials);

      // Persist to localStorage
      localStorage.setItem("access_token", data.tokens.access.token);
      localStorage.setItem("token_expires", data.tokens.access.expires);
      localStorage.setItem("refresh_token", data.tokens.refresh.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setState({ user: data.user, isAuthenticated: true, isLoading: false });
      return data.user;
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      // Best-effort server-side token revocation
      api.post("/auth/logout", { refreshToken }).catch(() => {});
    }
    clearAllTokens();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
