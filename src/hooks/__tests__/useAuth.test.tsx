import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "../useAuth";
import type { ReactNode } from "react";

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
  };
}

describe("useAuth", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts unauthenticated", () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("logs in successfully with correct credentials", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.login({ email: "admin@test.com", password: "password" });
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe("admin@test.com");
    });
  });

  it("logs out and clears state", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.login({ email: "admin@test.com", password: "password" });
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("access_token")).toBeNull();
  });

  it("restores session from localStorage", () => {
    localStorage.setItem("access_token", "mock-token");
    localStorage.setItem("token_expires", new Date(Date.now() + 3600_000).toISOString());
    localStorage.setItem(
      "user",
      JSON.stringify({ id: "1", name: "Test", email: "t@t.com", role: "ADMIN", isActive: true }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.name).toBe("Test");
  });

  it("does not restore expired token", () => {
    localStorage.setItem("access_token", "old-token");
    localStorage.setItem("token_expires", new Date(Date.now() - 1000).toISOString());
    localStorage.setItem("user", JSON.stringify({ id: "1", name: "Expired", email: "e@t.com", role: "ADMIN", isActive: true }));

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
    expect(result.current.isAuthenticated).toBe(false);
  });
});
