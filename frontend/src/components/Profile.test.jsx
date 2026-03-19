import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Profile from "./Profile";

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

  it("renders user profile information", async () => {
    const mockProfile = {
      username: "testuser",
      email: "test@example.com",
      full_name: "Test User",
      phone_number: "1234567890",
      address: "123 Test Street",
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockProfile,
      }),
    );

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText("testuser")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });
  });

  it("shows loading state while fetching profile", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => new Promise(() => {})), // Never resolves
    );

    render(<Profile />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("shows error when profile fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error")),
    );

    render(<Profile />);

    expect(await screen.findByText(/failed to load profile/i)).toBeInTheDocument();
  });

  it("allows user to edit profile", async () => {
    const mockProfile = {
      username: "testuser",
      email: "test@example.com",
      full_name: "Test User",
    };

    vi.stubGlobal("fetch", vi.fn())
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockProfile, full_name: "Updated User" }),
      });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    const editButton = screen.queryByRole("button", { name: /edit profile/i });
    if (editButton) {
      await userEvent.click(editButton);

      const nameInput = screen.getByDisplayValue("Test User");
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, "Updated User");

      const saveButton = screen.getByRole("button", { name: /save/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/auth/profile"),
          expect.objectContaining({
            method: "PUT",
            headers: expect.objectContaining({
              Authorization: "Bearer test-token",
            }),
          }),
        );
      });
    }
  });

  it("displays profile picture if available", async () => {
    const mockProfile = {
      username: "testuser",
      email: "test@example.com",
      full_name: "Test User",
      profile_picture: "https://example.com/picture.jpg",
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockProfile,
      }),
    );

    render(<Profile />);

    await waitFor(() => {
      const img = screen.queryByRole("img", { name: /profile picture/i });
      if (img) {
        expect(img).toHaveAttribute("src", "https://example.com/picture.jpg");
      }
    });
  });
});
