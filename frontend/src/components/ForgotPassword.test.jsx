import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ForgotPassword from "./ForgotPassword";

describe("ForgotPassword Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders forgot password form", () => {
    render(<ForgotPassword onBack={vi.fn()} />);

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

    render(<ForgotPassword onBack={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
    await userEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/auth/password-reset/",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email: "user@example.com" }),
        }),
      );
    });

    expect(await screen.findByText(/reset link sent/i)).toBeInTheDocument();
  });

  it("shows error when email is not found", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ detail: "Email not found" }),
      }),
    );

    render(<ForgotPassword onBack={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/email/i), "nonexistent@example.com");
    await userEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(await screen.findByText(/email not found/i)).toBeInTheDocument();
  });

  it("validates email format before submission", async () => {
    render(<ForgotPassword onBack={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/email/i), "invalid-email");
    await userEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(screen.queryByText(/reset link sent/i)).not.toBeInTheDocument();
  });

  it("calls onBack when back button is clicked", async () => {
    const onBack = vi.fn();
    render(<ForgotPassword onBack={onBack} />);

    const backButton = screen.getByText(/back to login/i);
    await userEvent.click(backButton);

    expect(onBack).toHaveBeenCalled();
  });
});
