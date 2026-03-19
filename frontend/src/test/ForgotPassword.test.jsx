import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ForgotPassword from "../components/ForgotPassword";

describe("ForgotPassword Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders forgot password form", () => {
    render(<ForgotPassword onBackToLogin={vi.fn()} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
  });

  it("successfully sends password reset email", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: "Password reset email sent" }),
      }),
    );

    render(<ForgotPassword onBackToLogin={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
    await userEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/auth/password-reset/request/",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email: "user@example.com" }),
        }),
      );
    });

    expect(await screen.findByText(/reset.*sent|email sent/i)).toBeInTheDocument();
  });

  it("shows error when email is not found", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: "Email not found" }),
      }),
    );

    render(<ForgotPassword onBackToLogin={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/email/i), "nonexistent@example.com");
    await userEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(await screen.findByText(/not found/i)).toBeInTheDocument();
  });

  it("validates email format before submission", async () => {
    render(<ForgotPassword onBackToLogin={vi.fn()} />);

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
  });

  it("calls onBackToLogin when back button is clicked", async () => {
    const onBackToLogin = vi.fn();
    render(<ForgotPassword onBackToLogin={onBackToLogin} />);

    const backButton = screen.getByText(/back to login/i);
    await userEvent.click(backButton);

    expect(onBackToLogin).toHaveBeenCalled();
  });
});
