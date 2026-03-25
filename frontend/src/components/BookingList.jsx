import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { buildApiUrl } from "../utils/api";

function BookingList() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingBooking, setEditingBooking] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [availableTimesEdit, setAvailableTimesEdit] = useState([]);
  const [loadingTimesEdit, setLoadingTimesEdit] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  // Fetch available times when editing and date/service changes
  useEffect(() => {
    if (editingBooking && editFormData.booking_date && editFormData.service) {
      fetchAvailableTimesEditMode();
    } else {
      setAvailableTimesEdit([]);
    }
  }, [editFormData.booking_date, editFormData.service, editingBooking]);

  function fetchBookings() {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    
    fetch(buildApiUrl("/bookings/"), {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to load bookings");
        setLoading(false);
      });
  }

  function deleteBooking(id) {
    if (!confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    const token = localStorage.getItem("access_token");

    fetch(buildApiUrl(`/bookings/${id}/`), {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(() => {
        setBookings(bookings.filter((booking) => booking.id !== id));
      })
      .catch((error) => {
        setError("Failed to delete booking");
      });
  }

  function updateBookingStatus(id, newStatus) {
    const token = localStorage.getItem("access_token");
    
    fetch(buildApiUrl(`/bookings/${id}/`), {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((response) => response.json())
      .then((updatedBooking) => {
        setBookings(
          bookings.map((booking) =>
            booking.id === id ? updatedBooking : booking
          )
        );
      })
      .catch((error) => {
        setError("Failed to update booking status");
      });
  }

  function fetchAvailableTimesEditMode() {
    setLoadingTimesEdit(true);
    const token = localStorage.getItem("access_token");
    
    fetch(buildApiUrl(`/bookings/available_slots/?date=${editFormData.booking_date}&service=${encodeURIComponent(editFormData.service)}`), {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setAvailableTimesEdit(data.slots.filter(slot => slot.available));
      })
      .catch((error) => {
        console.error("Error fetching available times:", error);
        setAvailableTimesEdit([]);
      })
      .finally(() => {
        setLoadingTimesEdit(false);
      });
  }

  function startEditing(booking) {
    setEditingBooking(booking.id);
    setEditFormData({
      full_name: booking.full_name,
      email: booking.email,
      service: booking.service,
      booking_date: booking.booking_date,
      booking_time: booking.booking_time,
      notes: booking.notes || ""
    });
  }

  function cancelEditing() {
    setEditingBooking(null);
    setEditFormData({});
    setAvailableTimesEdit([]);
    setError("");
  }

  function saveEdit(id) {
    const token = localStorage.getItem("access_token");

    fetch(buildApiUrl(`/bookings/${id}/`), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(editFormData),
    })
      .then((response) => response.json())
      .then((updatedBooking) => {
        setBookings(
          bookings.map((booking) =>
            booking.id === id ? updatedBooking : booking
          )
        );
        setEditingBooking(null);
        setEditFormData({});
        setError("");
      })
      .catch((error) => {
        setError("Failed to update booking");
      });
  }

  const serviceOptions = [
    "Haircut",
    "Hair Coloring",
    "Massage",
    "Facial",
    "Manicure",
    "Pedicure",
    "Spa Package",
    "Consultation"
  ];

  function getStatusBadgeClass(status) {
    const classes = {
      pending: "status-badge status-pending",
      confirmed: "status-badge status-confirmed",
      cancelled: "status-badge status-cancelled",
      completed: "status-badge status-completed",
    };
    return classes[status] || "status-badge";
  }

  function formatDate(dateString) {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString + "T00:00:00Z");
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid Date";
    }
  }

  function formatTime(timeString) {
    if (!timeString) return "N/A";
    try {
      const [hours, minutes] = timeString.split(":");
      const date = new Date(2000, 0, 1, parseInt(hours), parseInt(minutes));
      if (isNaN(date.getTime())) return "Invalid Time";
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return "Invalid Time";
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  return (
    <div className="booking-list-container">
      <div className="booking-list-header">
        <h2>Bookings</h2>
        <div className="filter-buttons">
          <button
            className={`btn ${filter === "all" ? "btn__primary" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({bookings.length})
          </button>
          <button
            className={`btn ${filter === "pending" ? "btn__primary" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending ({bookings.filter((b) => b.status === "pending").length})
          </button>
          <button
            className={`btn ${filter === "confirmed" ? "btn__primary" : ""}`}
            onClick={() => setFilter("confirmed")}
          >
            Confirmed ({bookings.filter((b) => b.status === "confirmed").length})
          </button>
          <button
            className={`btn ${filter === "completed" ? "btn__primary" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completed ({bookings.filter((b) => b.status === "completed").length})
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {filteredBookings.length === 0 ? (
        <p className="no-bookings">No bookings found.</p>
      ) : (
        <div className="bookings-grid">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              {editingBooking === booking.id ? (
                // Edit Mode
                <div className="booking-edit-form">
                  <h3>Edit Booking</h3>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      className="input input__lg"
                      value={editFormData.full_name}
                      onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      className="input input__lg"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Service</label>
                    <select
                      className="input input__lg"
                      value={editFormData.service}
                      onChange={(e) => setEditFormData({...editFormData, service: e.target.value})}
                    >
                      {serviceOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        className="input input__lg"
                        value={editFormData.booking_date}
                        onChange={(e) => setEditFormData({...editFormData, booking_date: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="form-group">
                      <label>Time</label>
                      <select
                        className="input input__lg"
                        value={editFormData.booking_time}
                        onChange={(e) => setEditFormData({...editFormData, booking_time: e.target.value})}
                        disabled={!editFormData.booking_date || !editFormData.service || loadingTimesEdit}
                      >
                        <option value="">
                          {loadingTimesEdit ? "Loading available times..." : "Select a time"}
                        </option>
                        {availableTimesEdit.map((slot) => (
                          <option key={slot.time} value={slot.time}>
                            {slot.display_time}
                          </option>
                        ))}
                      </select>
                      {editFormData.booking_date && editFormData.service && !loadingTimesEdit && availableTimesEdit.length === 0 && (
                        <small className="text-muted">No available times for this date and service.</small>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      className="input input__lg"
                      rows="3"
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                    />
                  </div>
                  {booking.status !== 'pending' && !user?.is_superuser && (
                    <p className="edit-warning">⚠️ Editing this booking will reset its status to "pending"</p>
                  )}
                  <div className="booking-actions">
                    <button
                      className="btn btn__primary"
                      onClick={() => saveEdit(booking.id)}
                    >
                      Save Changes
                    </button>
                    <button
                      className="btn"
                      onClick={cancelEditing}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
              <div className="booking-header">
                <h3>{booking.full_name}</h3>
                <span className={getStatusBadgeClass(booking.status)}>
                  {booking.status}
                </span>
              </div>

              <div className="booking-details">
                {booking.username && (
                  <p>
                    <strong>User:</strong> {booking.username}
                  </p>
                )}
                <p>
                  <strong>Service:</strong> {booking.service}
                </p>
                <p>
                  <strong>Email:</strong> {booking.email}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(booking.booking_date)}
                </p>
                <p>
                  <strong>Time:</strong> {formatTime(booking.booking_time)}
                </p>
                {booking.notes && (
                  <p>
                    <strong>Notes:</strong> {booking.notes}
                  </p>
                )}
              </div>

              <div className="booking-actions">
                {user?.is_superuser && (
                  <select
                    value={booking.status}
                    onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                )}
                <button
                  className="btn btn__primary"
                  onClick={() => startEditing(booking)}
                >
                  Edit
                </button>
                <button
                  className="btn btn__danger"
                  onClick={() => deleteBooking(booking.id)}
                >
                  Delete
                </button>
              </div>
              </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingList;
