import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import BookingForm from "./BookingForm";
import BookingList from "./BookingList";

function Booking() {
  const { user } = useAuth();
  const isAdmin = user?.is_superuser;
  const [activeTab, setActiveTab] = useState(isAdmin ? "view" : "create");
  const [refreshList, setRefreshList] = useState(0);

  function handleBookingCreated(newBooking) {
    setActiveTab("view");
    setRefreshList(prev => prev + 1);
  }

  return (
    <div className="booking-container">
      <div className="booking-tabs">
        {!isAdmin && (
          <button
            className={`tab-button ${activeTab === "create" ? "active" : ""}`}
            onClick={() => setActiveTab("create")}
          >
            Create Booking
          </button>
        )}
        <button
          className={`tab-button ${activeTab === "view" ? "active" : ""}`}
          onClick={() => setActiveTab("view")}
        >
          View Bookings
        </button>
      </div>

      <div className="booking-content">
        {activeTab === "create" && !isAdmin ? (
          <BookingForm onBookingCreated={handleBookingCreated} />
        ) : (
          <BookingList key={refreshList} />
        )}
      </div>
    </div>
  );
}

export default Booking;
