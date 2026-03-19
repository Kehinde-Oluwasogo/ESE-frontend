import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Login from "./Login";

describe("Login", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("submits credentials and stores tokens on success", async () => {
    const onLogin = vi.fn();
    const onSwitchToRegister = vi.fn();
    const onSwitchToForgotPassword = vi.fn();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ access: "access-123", refresh: "refresh-123" }),
      }),
    );

    render(
      <Login
        onLogin={onLogin}
        onSwitchToRegister={onSwitchToRegister}
        onSwitchToForgotPassword={onSwitchToForgotPassword}
      />,
    );

    await userEvent.type(screen.getByLabelText(/username/i), "demo-user");
    await userEvent.type(screen.getByLabelText(/^password$/i), "secret-pass");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        "/api/auth/token/",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
      expect(localStorage.getItem("access_token")).toBe("access-123");
      expect(localStorage.getItem("refresh_token")).toBe("refresh-123");
      expect(onLogin).toHaveBeenCalledWith({
        access: "access-123",
        refresh: "refresh-123",
      });
    });
  });

  it("shows an error when credentials are invalid", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({}),
      }),
    );

    render(
      <Login
        onLogin={vi.fn()}
        onSwitchToRegister={vi.fn()}
        onSwitchToForgotPassword={vi.fn()}
      />,
    );

    await userEvent.type(screen.getByLabelText(/username/i), "demo-user");
    await userEvent.type(screen.getByLabelText(/^password$/i), "wrong-pass");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
