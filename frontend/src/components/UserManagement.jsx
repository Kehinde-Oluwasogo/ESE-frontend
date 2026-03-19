import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { buildApiUrl } from "../utils/api";

function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Booking form state
  const [bookingData, setBookingData] = useState({
    booking_date: "",
    booking_time: "",
    service: "",
    notes: ""
  });

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

  useEffect(() => {
    if (!user?.is_superuser) {
      setError("Access denied. Only super users can access this page.");
      setLoading(false);
    } else {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(buildApiUrl("/auth/users/list/"), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = (selectedUserId) => {
    const userToBook = users.find(u => u.id === selectedUserId);
    setSelectedUser(userToBook);
    setShowBookingForm(true);
    setError("");
    setSuccess("");
  };

  const handleChangePassword = (selectedUserId) => {
    const userToChange = users.find(u => u.id === selectedUserId);
    setSelectedUser(userToChange);
    setShowPasswordModal(true);
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  };

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(buildApiUrl("/auth/users/change-password/"), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          new_password: newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setShowPasswordModal(false);
        setSelectedUser(null);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      setError('Failed to change password');
    }
  };

  const handleSendResetLink = async (selectedUserId) => {
    const userToReset = users.find(u => u.id === selectedUserId);
    
    if (!confirm(`Send password reset link to ${userToReset.username} (${userToReset.email})?`)) {
      return;
    }

    setError("");
    setSuccess("");

    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(buildApiUrl("/auth/users/send-reset-link/"), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedUserId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
      } else {
        setError(data.error || 'Failed to send reset link');
      }
    } catch (error) {
      console.error('Failed to send reset link:', error);
      setError('Failed to send reset link');
    }
  };

  const handleToggleRestrict = async (selectedUserId) => {
    const userToToggle = users.find(u => u.id === selectedUserId);
    const action = userToToggle.is_active ? 'restrict' : 'unrestrict';
    
    if (!confirm(`Are you sure you want to ${action} ${userToToggle.username}?`)) {
      return;
    }

    setError("");
    setSuccess("");

    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(buildApiUrl("/auth/users/toggle-active/"), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedUserId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        // Update the user in the local state
        setUsers(users.map(u => 
          u.id === selectedUserId 
            ? { ...u, is_active: data.is_active }
            : u
        ));
      } else {
        setError(data.error || 'Failed to toggle user restriction');
      }
    } catch (error) {
      console.error('Failed to toggle user restriction:', error);
      setError('Failed to toggle user restriction');
    }
  };

  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(buildApiUrl("/bookings/"), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: selectedUser.full_name || selectedUser.username,
          email: selectedUser.email,
          service: bookingData.service,
          booking_date: bookingData.booking_date,
          booking_time: bookingData.booking_time,
          notes: bookingData.notes,
          status: "pending",
          user_id: selectedUser.id
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Booking created successfully for ${selectedUser.username}!`);
        setBookingData({
          booking_date: "",
          booking_time: "",
          service: "",
          notes: ""
        });
        setShowBookingForm(false);
        setSelectedUser(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Failed to create booking:', error);
      setError('Failed to create booking');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatMemorableInfo = (memorableInfo) => {
    if (!memorableInfo) return '-';
    try {
      const parsed = JSON.parse(memorableInfo);
      return `${parsed.question}`;
    } catch {
      // Fallback for non-JSON format
      return memorableInfo || '-';
    }
  };

  if (!user?.is_superuser) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <h2>Access Denied</h2>
          <p style={{ color: 'red' }}>Only super users can access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <p style={{ textAlign: 'center', color: '#666' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container" style={{ maxWidth: '1000px' }}>
      <div className="profile-card">
        <h2 style={{ 
          fontSize: '2.8rem', 
          marginBottom: '2rem', 
          textAlign: 'center',
          color: '#333'
        }}>
          User Management
        </h2>

        {/* Messages */}
        {error && (
          <div className="error-message" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message" style={{ marginBottom: '1.5rem' }}>
            {success}
          </div>
        )}

        {/* Password Change Modal */}
        {showPasswordModal && selectedUser && (
          <div style={{ 
            marginBottom: '2rem', 
            padding: '2rem', 
            background: '#fff9e6',
            border: '2px solid #ffc107',
            borderRadius: '8px'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>
              Change Password for: <strong>{selectedUser.username}</strong>
            </h3>
            <form onSubmit={handleSubmitPasswordChange}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="new_password">New Password *</label>
                <input
                  type="password"
                  id="new_password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    fontSize: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
                <small style={{ color: '#666', fontSize: '0.85rem' }}>
                  Minimum 8 characters
                </small>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="confirm_password">Confirm Password *</label>
                <input
                  type="password"
                  id="confirm_password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    fontSize: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '1rem',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: 'white',
                    background: '#ffc107',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedUser(null);
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#333',
                    background: '#f0f0f0',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Booking Form */}
        {showBookingForm && selectedUser && (
          <div style={{ 
            marginBottom: '2rem', 
            padding: '2rem', 
            background: '#f0f8ff',
            border: '2px solid #007bff',
            borderRadius: '8px'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>
              Create Booking for: <strong>{selectedUser.username}</strong>
            </h3>
            <form onSubmit={handleSubmitBooking}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="booking_date">Date *</label>
                <input
                  type="date"
                  id="booking_date"
                  name="booking_date"
                  value={bookingData.booking_date}
                  onChange={handleBookingInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    fontSize: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="booking_time">Time *</label>
                <input
                  type="time"
                  id="booking_time"
                  name="booking_time"
                  value={bookingData.booking_time}
                  onChange={handleBookingInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    fontSize: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="service">Service *</label>
                <select
                  id="service"
                  name="service"
                  value={bookingData.service}
                  onChange={handleBookingInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    fontSize: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Select a service...</option>
                  {serviceOptions.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={bookingData.notes}
                  onChange={handleBookingInputChange}
                  rows="3"
                  placeholder="Additional notes..."
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    fontSize: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '1rem',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: 'white',
                    background: '#28a745',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Create Booking
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingForm(false);
                    setSelectedUser(null);
                    setBookingData({ booking_date: "", booking_time: "", service: "", notes: "" });
                  }}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#333',
                    background: '#f0f0f0',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* User List */}
        <div>
          <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>
            Regular Users ({users.length})
          </h3>
          
          {users.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>No users found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '0.95rem'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Username</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Name</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Email</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Memorable Info</th>
                    <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem) => (
                    <tr key={userItem.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '1rem' }}>
                        <strong>{userItem.username}</strong>
                      </td>
                      <td style={{ padding: '1rem' }}>{userItem.full_name || '-'}</td>
                      <td style={{ padding: '1rem' }}>{userItem.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.3rem 0.8rem',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          color: 'white',
                          background: userItem.is_active ? '#28a745' : '#dc3545'
                        }}>
                          {userItem.is_active ? 'Active' : 'Restricted'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#666' }}>
                        {formatMemorableInfo(userItem.memorable_information)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleCreateBooking(userItem.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              fontSize: '0.9rem',
                              color: 'white',
                              background: '#007bff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Create Booking
                          </button>
                          <button
                            onClick={() => handleSendResetLink(userItem.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              fontSize: '0.9rem',
                              color: 'white',
                              background: '#17a2b8',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Send Reset Link
                          </button>
                          <button
                            onClick={() => handleChangePassword(userItem.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              fontSize: '0.9rem',
                              color: 'white',
                              background: '#ffc107',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Change Password
                          </button>
                          <button
                            onClick={() => handleToggleRestrict(userItem.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              fontSize: '0.9rem',
                              color: 'white',
                              background: userItem.is_active ? '#dc3545' : '#28a745',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            {userItem.is_active ? 'Restrict' : 'Unrestrict'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
