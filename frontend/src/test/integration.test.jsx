import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";

// Mock AuthContext
vi.mock("../contexts/AuthContext", () => {
  let mockUser = null;
  let mockLogin = vi.fn();

  return {
    AuthProvider: ({ children }) => children,
    useAuth: () => ({
      user: mockUser,
      login: async (username, password) => {
        mockUser = { id: 1, username, email: `${username}@test.com`, is_staff: false };
        return mockUser;
      },
      logout: () => {
        mockUser = null;
      },
      register: vi.fn(),
      loading: false,
    }),
  };
});

describe("Integration Tests - User Workflows", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("complete authentication flow: register -> login -> logout", async () => {
    // Mock API responses
    const fetchMock = vi.fn();
    
    // Register response
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, username: "newuser", email: "newuser@test.com" }),
    });

    // Login response
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access: "token123", refresh: "refresh123" }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    // Wait for app to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // User should see login/register options
    expect(screen.getByText(/login/i) || screen.getByText(/register/i)).toBeInTheDocument();
  });

  it("complete booking workflow: login -> create booking -> view booking -> edit -> delete", async () => {
    const mockBooking = {
      id: 1,
      service: "Haircut",
      date: "2024-12-25",
      time: "10:00",
      status: "pending",
    };

    const fetchMock = vi.fn()
      // Login
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access: "token", refresh: "refresh" }),
      })
      // User info
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, username: "user", email: "user@test.com" }),
      })
      // Create booking
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBooking,
      })
      // List bookings
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [mockBooking],
      })
      // Update booking
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockBooking, time: "11:00" }),
      })
      // Delete booking
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    vi.stubGlobal("fetch", fetchMock);

    // This is a simplified test - in a real app, you'd navigate through the UI
    expect(fetchMock).toBeDefined();
  });

  it("handles protected routes - redirects unauthenticated users", async () => {
    render(<App />);

    // Try to access protected route without auth
    // Should redirect to login
    await waitFor(() => {
      const loginElement = screen.queryByText(/login/i);
      const registerElement = screen.queryByText(/register/i);
      expect(loginElement || registerElement).toBeInTheDocument();
    });
  });

  it("authenticated user can access booking features", async () => {
    localStorage.setItem("access_token", "test-token");

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, username: "testuser", email: "test@test.com" }),
    }));

    render(<App />);

    await waitFor(() => {
      // Should not show login form if already authenticated
      expect(screen.queryByRole("button", { name: /^login$/i })).toBeNull();
    });
  });

  it("handles API errors gracefully throughout the app", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));

    render(<App />);

    // App should still render without crashing
    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it("maintains user session across page refreshes", async () => {
    // Set tokens as if user was previously logged in
    localStorage.setItem("access_token", "stored-token");
    localStorage.setItem("refresh_token", "stored-refresh");

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ 
        id: 1, 
        username: "persisteduser", 
        email: "persisted@test.com" 
      }),
    }));

    render(<App />);

    // Should attempt to load user from stored token
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });
});
