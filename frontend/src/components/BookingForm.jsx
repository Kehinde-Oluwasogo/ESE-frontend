import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { buildApiUrl } from "../utils/api";

function BookingForm({ onBookingCreated }) {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto-populate name and email from logged-in user
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const serviceOptions = [
    "Haircut",
    "Hair Coloring",
    "Massage",
    "Facial",
    "Manicure",
    "Pedicure",
    "Spa Treatment",
    "Consultation",
    "Other"
  ];

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const bookingData = {
      full_name: fullName,
      email,
      service,
      booking_date: bookingDate,
      booking_time: bookingTime,
      notes,
      status: "pending"
    };

    const token = localStorage.getItem("access_token");

    fetch(buildApiUrl("/bookings/"), {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(bookingData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to create booking");
        }
        return response.json();
      })
      .then((data) => {
        setSuccess(true);
        setFullName("");
        setEmail("");
        setService("");
        setBookingDate("");
        setBookingTime("");
        setNotes("");
        if (onBookingCreated) {
          onBookingCreated(data);
        }
        setTimeout(() => setSuccess(false), 3000);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <div className="booking-form-container">
      <form onSubmit={handleSubmit} className="booking-form">
        <h2>Book an Appointment</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Booking created successfully!</div>}
        
        <div className="form-group">
          <label htmlFor="fullName">Full Name *</label>
          <input
            type="text"
            id="fullName"
            className="input input__lg"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            className="input input__lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="service">Service *</label>
          <select
            id="service"
            className="input input__lg"
            value={service}
            onChange={(e) => setService(e.target.value)}
            required
          >
            <option value="">Select a service</option>
            {serviceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="bookingDate">Date *</label>
            <input
              type="date"
              id="bookingDate"
              className="input input__lg"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bookingTime">Time *</label>
            <input
              type="time"
              id="bookingTime"
              className="input input__lg"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Additional Notes (optional)</label>
          <textarea
            id="notes"
            className="input input__lg"
            rows="4"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special requests or information..."
          />
        </div>

        <button 
          type="submit" 
          className="btn btn__primary btn__lg"
          disabled={loading}
        >
          {loading ? "Booking..." : "Book Appointment"}
        </button>
      </form>
    </div>
  );
}

export default BookingForm;
