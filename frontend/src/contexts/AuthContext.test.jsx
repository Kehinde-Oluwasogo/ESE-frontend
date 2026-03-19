import { renderHook, act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";

describe("AuthContext", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("provides initial auth state", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("logs in user and stores tokens", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            access: "access-token", 
            refresh: "refresh-token" 
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            id: 1, 
            username: "testuser",
            email: "test@example.com"
          }),
        }),
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login("testuser", "password");
    });

    expect(localStorage.getItem("access_token")).toBe("access-token");
    expect(localStorage.getItem("refresh_token")).toBe("refresh-token");
    
    await waitFor(() => {
      expect(result.current.user).toEqual(
        expect.objectContaining({
          username: "testuser",
          email: "test@example.com",
        }),
      );
    });
  });

  it("logs out user and clears tokens", async () => {
    localStorage.setItem("access_token", "test-token");
    localStorage.setItem("refresh_token", "refresh-token");

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // Set user first
    act(() => {
      result.current.setUser({ id: 1, username: "testuser" });
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
  });

  it("registers new user successfully", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ 
          id: 1, 
          username: "newuser",
          email: "new@example.com",
          message: "Registration successful"
        }),
      }),
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    let response;
    await act(async () => {
      response = await result.current.register({
        username: "newuser",
        email: "new@example.com",
        password: "password123",
        full_name: "New User",
      });
    });

    expect(response.ok).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/register"),
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("handles login failure gracefully", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ detail: "Invalid credentials" }),
      }),
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await expect(
      act(async () => {
        await result.current.login("wronguser", "wrongpass");
      })
    ).rejects.toThrow();

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("access_token")).toBeNull();
  });

  it("loads user from token on mount if token exists", async () => {
    localStorage.setItem("access_token", "existing-token");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ 
          id: 1, 
          username: "existinguser",
          email: "existing@example.com"
        }),
      }),
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(
        expect.objectContaining({
          username: "existinguser",
        }),
      );
    });
  });

  it("handles token refresh when access token expires", async () => {
    localStorage.setItem("refresh_token", "refresh-token");

    vi.stubGlobal("fetch", vi.fn())
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access: "new-access-token" }),
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.refreshToken();
    });

    expect(localStorage.getItem("access_token")).toBe("new-access-token");
  });
});
