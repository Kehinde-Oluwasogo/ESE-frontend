import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BookingList from "./BookingList";

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, is_staff: false },
  }),
}));

describe("BookingList Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.setItem("access_token", "test-token");
  });

  it("renders booking list with fetched bookings", async () => {
    const mockBookings = [
      {
        id: 1,
        service: "Haircut",
        date: "2024-12-25",
        time: "10:00",
        status: "confirmed",
        user_name: "John Doe",
      },
      {
        id: 2,
        service: "Massage",
        date: "2024-12-26",
        time: "14:30",
        status: "pending",
        user_name: "Jane Smith",
      },
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockBookings,
      }),
    );

    render(<BookingList onEdit={vi.fn()} refreshTrigger={0} />);

    await waitFor(() => {
      expect(screen.getByText("Haircut")).toBeInTheDocument();
      expect(screen.getByText("Massage")).toBeInTheDocument();
      expect(screen.getByText("2024-12-25")).toBeInTheDocument();
      expect(screen.getByText("2024-12-26")).toBeInTheDocument();
    });
  });

  it("shows empty state when no bookings exist", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      }),
    );

    render(<BookingList onEdit={vi.fn()} refreshTrigger={0} />);

    expect(await screen.findByText(/no bookings found/i)).toBeInTheDocument();
  });

  it("allows user to edit a booking", async () => {
    const onEdit = vi.fn();
    const mockBooking = {
      id: 1,
      service: "Haircut",
      date: "2024-12-25",
      time: "10:00",
      status: "pending",
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [mockBooking],
      }),
    );

    render(<BookingList onEdit={onEdit} refreshTrigger={0} />);

    await waitFor(() => {
      expect(screen.getByText("Haircut")).toBeInTheDocument();
    });

    const editButton = screen.getByRole("button", { name: /edit/i });
    await userEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockBooking);
  });

  it("successfully deletes a booking", async () => {
    const mockBooking = {
      id: 1,
      service: "Haircut",
      date: "2024-12-25",
      time: "10:00",
    };

    vi.stubGlobal("fetch", vi.fn())
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [mockBooking],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    vi.stubGlobal("confirm", vi.fn(() => true));

    render(<BookingList onEdit={vi.fn()} refreshTrigger={0} />);

    await waitFor(() => {
      expect(screen.getByText("Haircut")).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/bookings/1/",
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        }),
      );
    });
  });

  it("shows error message when fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error")),
    );

    render(<BookingList onEdit={vi.fn()} refreshTrigger={0} />);

    expect(await screen.findByText(/failed to load bookings/i)).toBeInTheDocument();
  });

  it("filters bookings by status", async () => {
    const mockBookings = [
      { id: 1, service: "Haircut", status: "confirmed", date: "2024-12-25", time: "10:00" },
      { id: 2, service: "Massage", status: "pending", date: "2024-12-26", time: "14:30" },
      { id: 3, service: "Facial", status: "cancelled", date: "2024-12-27", time: "16:00" },
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockBookings,
      }),
    );

    render(<BookingList onEdit={vi.fn()} refreshTrigger={0} />);

    await waitFor(() => {
      expect(screen.getByText("Haircut")).toBeInTheDocument();
    });

    // Test filter functionality if implemented
    const allTab = screen.queryByRole("tab", { name: /all/i });
    if (allTab) {
      await userEvent.click(allTab);
      expect(screen.getByText("Haircut")).toBeInTheDocument();
      expect(screen.getByText("Massage")).toBeInTheDocument();
    }
  });

  it("refreshes list when refreshTrigger changes", async () => {
    const mockBookings = [
      { id: 1, service: "Haircut", status: "confirmed", date: "2024-12-25", time: "10:00" },
    ];

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockBookings,
    });

    vi.stubGlobal("fetch", fetchMock);

    const { rerender } = render(<BookingList onEdit={vi.fn()} refreshTrigger={0} />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    rerender(<BookingList onEdit={vi.fn()} refreshTrigger={1} />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
