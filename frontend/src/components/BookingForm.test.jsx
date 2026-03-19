import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BookingForm from "./BookingForm";

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: {
      full_name: "Jane Tester",
      email: "jane@example.com",
    },
  }),
}));

describe("BookingForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.setItem("access_token", "token-123");
  });

  it("creates a booking and calls onBookingCreated", async () => {
    const onBookingCreated = vi.fn();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1, status: "pending" }),
      }),
    );

    render(<BookingForm onBookingCreated={onBookingCreated} />);

    expect(screen.getByLabelText(/full name/i)).toHaveValue("Jane Tester");
    expect(screen.getByLabelText(/email/i)).toHaveValue("jane@example.com");

    await userEvent.selectOptions(screen.getByLabelText(/service/i), "Massage");
    await userEvent.type(screen.getByLabelText(/date/i), "2099-12-31");
    await userEvent.type(screen.getByLabelText(/time/i), "10:30");
    await userEvent.type(screen.getByLabelText(/additional notes/i), "Please be on time.");
    await userEvent.click(screen.getByRole("button", { name: /book appointment/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/bookings/",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer token-123",
          },
        }),
      );
      expect(onBookingCreated).toHaveBeenCalledWith({ id: 1, status: "pending" });
    });

    expect(await screen.findByText(/booking created successfully/i)).toBeInTheDocument();
  });

  it("shows an error when booking creation fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({}),
      }),
    );

    render(<BookingForm onBookingCreated={vi.fn()} />);

    await userEvent.selectOptions(screen.getByLabelText(/service/i), "Massage");
    await userEvent.type(screen.getByLabelText(/date/i), "2099-12-31");
    await userEvent.type(screen.getByLabelText(/time/i), "10:30");
    await userEvent.click(screen.getByRole("button", { name: /book appointment/i }));

    expect(await screen.findByText(/failed to create booking/i)).toBeInTheDocument();
  });
});
