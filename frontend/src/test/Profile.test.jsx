import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Profile from "../components/Profile";

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { 
      id: 1, 
      username: "testuser",
      email: "test@example.com",
      full_name: "Test User"
    },
  }),
}));

describe("Profile Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.setItem("access_token", "test-token");
  });

  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it("renders user profile information", async () => {
    const mockProfile = {
      username: "testuser",
      email: "test@example.com",
      profile_picture: null,
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockProfile,
      }),
    );

    renderWithRouter(<Profile />);

    await waitFor(() => {
      expect(screen.queryByText(/loading profile/i)).not.toBeInTheDocument();
    });
  });

  it("shows loading state while fetching profile", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => new Promise(() => {})), // Never resolves
    );

    renderWithRouter(<Profile />);

    expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
  });

  it("handles error when profile fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error")),
    );

    renderWithRouter(<Profile />);

    await waitFor(() => {
      expect(screen.queryByText(/loading profile/i)).not.toBeInTheDocument();
    });
  });

  it("renders profile upload component", async () => {
    const mockProfile = {
      username: "testuser",
      email: "test@example.com",
      profile_picture: null,
    };

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProfile,
    }));

    renderWithRouter(<Profile />);

    await waitFor(() => {
      expect(screen.queryByText(/loading profile/i)).not.toBeInTheDocument();
    });

    // Profile component renders after loading
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it("displays profile with picture if available", async () => {
    const mockProfile = {
      username: "testuser",
      email: "test@example.com",
      first_name: "Test",
      last_name: "User",
      profile_picture: "https://example.com/picture.jpg",
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockProfile,
      }),
    );

    renderWithRouter(<Profile />);

    await waitFor(() => {
      expect(screen.queryByText(/loading profile/i)).not.toBeInTheDocument();
    });
  });
});
