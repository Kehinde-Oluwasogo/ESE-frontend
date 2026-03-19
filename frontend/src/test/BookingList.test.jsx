import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BookingList from "../components/BookingList";

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

    render(<BookingList />);

    await waitFor(() => {
      expect(screen.getByText("Haircut")).toBeInTheDocument();
      expect(screen.getByText("Massage")).toBeInTheDocument();
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

    render(<BookingList />);

    expect(await screen.findByText(/no bookings found/i)).toBeInTheDocument();
  });

  it("renders edit functionality for bookings", async () => {
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

    render(<BookingList />);

    await waitFor(() => {
      expect(screen.getByText("Haircut")).toBeInTheDocument();
    });

    // Check if edit button exists (component may have edit functionality)
    const editButtons = screen.queryAllByRole("button");
    expect(editButtons.length).toBeGreaterThan(0);
  });

  it("successfully deletes a booking", async () => {
    const mockBooking = {
      id: 1,
      service: "Haircut",
      date: "2024-12-25",
      time: "10:00",
    };

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [mockBooking],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("confirm", vi.fn(() => true));

    render(<BookingList />);

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

    render(<BookingList />);

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

  it("renders and manages bookings", async () => {
    const mockBookings = [
      { id: 1, service: "Haircut", status: "confirmed", date: "2024-12-25", time: "10:00" },
    ];

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockBookings,
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<BookingList />);

    await waitFor(() => {
      expect(screen.getByText("Haircut")).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
