import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Register from "./Register";

describe("Register Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders registration form with all fields", () => {
    render(<Register onRegister={vi.fn()} onSwitchToLogin={vi.fn()} />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  it("successfully registers a new user with valid data", async () => {
    const onRegister = vi.fn();
    const onSwitchToLogin = vi.fn();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ 
          id: 1, 
          username: "newuser", 
          email: "newuser@test.com" 
        }),
      }),
    );

    render(<Register onRegister={onRegister} onSwitchToLogin={onSwitchToLogin} />);

    await userEvent.type(screen.getByLabelText(/username/i), "newuser");
    await userEvent.type(screen.getByLabelText(/email/i), "newuser@test.com");
    await userEvent.type(screen.getByLabelText(/full name/i), "New User");
    await userEvent.type(screen.getByLabelText(/^password$/i), "SecurePass123!");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "SecurePass123!");
    
    await userEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/auth/register/",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
      expect(onRegister).toHaveBeenCalled();
    });
  });

  it("shows error when passwords do not match", async () => {
    render(<Register onRegister={vi.fn()} onSwitchToLogin={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/username/i), "testuser");
    await userEvent.type(screen.getByLabelText(/email/i), "test@test.com");
    await userEvent.type(screen.getByLabelText(/full name/i), "Test User");
    await userEvent.type(screen.getByLabelText(/^password$/i), "Password123!");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "DifferentPass123!");
    
    await userEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it("shows error when username already exists", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ 
          username: ["A user with that username already exists."] 
        }),
      }),
    );

    render(<Register onRegister={vi.fn()} onSwitchToLogin={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/username/i), "existinguser");
    await userEvent.type(screen.getByLabelText(/email/i), "test@test.com");
    await userEvent.type(screen.getByLabelText(/full name/i), "Test User");
    await userEvent.type(screen.getByLabelText(/^password$/i), "Password123!");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "Password123!");
    
    await userEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText(/username already exists/i)).toBeInTheDocument();
  });

  it("validates email format", async () => {
    render(<Register onRegister={vi.fn()} onSwitchToLogin={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/email/i), "invalid-email");
    await userEvent.tab(); // Blur the field

    expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
  });

  it("switches to login form when link is clicked", async () => {
    const onSwitchToLogin = vi.fn();
    render(<Register onRegister={vi.fn()} onSwitchToLogin={onSwitchToLogin} />);

    const loginLink = screen.getByText(/already have an account/i);
    await userEvent.click(loginLink);

    expect(onSwitchToLogin).toHaveBeenCalled();
  });
});
