import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { buildApiUrl } from "../utils/api";

function AdminManagement() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('create'); // 'create', 'list', 'logs'
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Form state for creating admin
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    can_revoke_admins: true
  });
  const [memorableQuestion, setMemorableQuestion] = useState("");
  const [memorableAnswer, setMemorableAnswer] = useState("");

  const memorableQuestions = [
    "Name of pet",
    "Country of origin",
    "Mother's maiden name"
  ];

  // Check if user is superuser
  useEffect(() => {
    if (!user?.is_superuser) {
      setError("Access denied. Only super users can access this page.");
      setLoading(false);
    } else {
      fetchAdmins();
      fetchActivityLogs();
    }
  }, [user]);

  const fetchAdmins = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(buildApiUrl("/auth/admin/list/"), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch admins');
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      setError('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(buildApiUrl("/auth/admin/activity-logs/?limit=100"), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActivityLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Format memorable information as JSON
    const memorableInfo = memorableQuestion && memorableAnswer 
      ? JSON.stringify({ question: memorableQuestion, answer: memorableAnswer })
      : "";

    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(buildApiUrl("/auth/admin/create/"), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          memorable_information: memorableInfo
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setFormData({
          username: "",
          email: "",
          password: "",
          first_name: "",
          last_name: "",
          can_revoke_admins: true
        });
        setMemorableQuestion("");
        setMemorableAnswer("");
        fetchAdmins();
        fetchActivityLogs();
      } else {
        setError(data.error || 'Failed to create admin');
      }
    } catch (error) {
      console.error('Failed to create admin:', error);
      setError('Failed to create admin');
    }
  };

  const handleRevokeAdmin = async (userId, username) => {
    if (!confirm(`Are you sure you want to revoke admin privileges from ${username}?`)) {
      return;
    }

    setError("");
    setSuccess("");

    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(buildApiUrl("/auth/admin/revoke/"), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        fetchAdmins();
        fetchActivityLogs();
      } else {
        setError(data.error || 'Failed to revoke admin privileges');
      }
    } catch (error) {
      console.error('Failed to revoke admin:', error);
      setError('Failed to revoke admin privileges');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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
          Admin Management
        </h2>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem',
          borderBottom: '2px solid #e0e0e0'
        }}>
          <button
            onClick={() => setActiveTab('create')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'create' ? '#007bff' : 'transparent',
              color: activeTab === 'create' ? 'white' : '#333',
              border: 'none',
              borderBottom: activeTab === 'create' ? '3px solid #0056b3' : 'none',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: activeTab === 'create' ? 'bold' : 'normal'
            }}
          >
            Create Admin
          </button>
          <button
            onClick={() => setActiveTab('list')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'list' ? '#007bff' : 'transparent',
              color: activeTab === 'list' ? 'white' : '#333',
              border: 'none',
              borderBottom: activeTab === 'list' ? '3px solid #0056b3' : 'none',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: activeTab === 'list' ? 'bold' : 'normal'
            }}
          >
            Admin List ({admins.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'logs' ? '#007bff' : 'transparent',
              color: activeTab === 'logs' ? 'white' : '#333',
              border: 'none',
              borderBottom: activeTab === 'logs' ? '3px solid #0056b3' : 'none',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: activeTab === 'logs' ? 'bold' : 'normal'
            }}
          >
            Activity Logs
          </button>
        </div>

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

        {/* Create Admin Tab */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateAdmin}>
            <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Create New Admin User</h3>
            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
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
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
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
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
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
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
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
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
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
              <label htmlFor="memorable_question">Security Question (Optional)</label>
              <select
                id="memorable_question"
                value={memorableQuestion}
                onChange={(e) => {
                  setMemorableQuestion(e.target.value);
                  if (!e.target.value) setMemorableAnswer("");
                }}
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
                <option value="">Select a question...</option>
                {memorableQuestions.map((question) => (
                  <option key={question} value={question}>
                    {question}
                  </option>
                ))}
              </select>
            </div>

            {memorableQuestion && (
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="memorable_answer">Answer</label>
                <input
                  type="text"
                  id="memorable_answer"
                  value={memorableAnswer}
                  onChange={(e) => setMemorableAnswer(e.target.value)}
                  placeholder="Your answer"
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    fontSize: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
            )}

            <div className="form-group" style={{ 
              marginBottom: '1.5rem',
              padding: '1rem',
              background: '#f0f8ff',
              border: '1px solid #b3d9ff',
              borderRadius: '4px'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                fontSize: '1rem'
              }}>
                <input
                  type="checkbox"
                  name="can_revoke_admins"
                  checked={formData.can_revoke_admins}
                  onChange={handleInputChange}
                  style={{
                    width: '20px',
                    height: '20px',
                    marginRight: '1rem',
                    cursor: 'pointer'
                  }}
                />
                <span>
                  <strong>Can Revoke Admin Privileges</strong>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.3rem' }}>
                    Allow this admin to revoke privileges from other admins
                  </div>
                </span>
              </label>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
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
              Create Admin User
            </button>
          </form>
        )}

        {/* Admin List Tab */}
        {activeTab === 'list' && (
          <div>
            <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Admin Users</h3>
            
            {admins.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>No admin users found.</p>
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
                      <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Joined</th>
                      <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Last Login</th>
                      <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Permissions</th>
                      <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '1rem' }}>
                          <strong>{admin.username}</strong>
                          {admin.id === user.id && <span style={{ color: '#007bff', marginLeft: '0.5rem' }}>(You)</span>}
                        </td>
                        <td style={{ padding: '1rem' }}>{admin.full_name || '-'}</td>
                        <td style={{ padding: '1rem' }}>{admin.email}</td>
                        <td style={{ padding: '1rem' }}>{formatDate(admin.date_joined)}</td>
                        <td style={{ padding: '1rem' }}>{admin.last_login ? formatDate(admin.last_login) : 'Never'}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <span style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            backgroundColor: admin.can_revoke_admins ? '#d4edda' : '#f8d7da',
                            color: admin.can_revoke_admins ? '#155724' : '#721c24',
                            border: admin.can_revoke_admins ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
                          }}>
                            {admin.can_revoke_admins ? '✓ Can Revoke' : '✗ Cannot Revoke'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          {admin.id !== user.id && user?.can_revoke_admins && (
                            <button
                              onClick={() => handleRevokeAdmin(admin.id, admin.username)}
                              style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.9rem',
                                color: 'white',
                                background: '#dc3545',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Revoke Admin
                            </button>
                          )}
                          {admin.id !== user.id && !user?.can_revoke_admins && (
                            <span style={{ fontSize: '0.85rem', color: '#999' }}>No permission</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Activity Logs Tab */}
        {activeTab === 'logs' && (
          <div>
            <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Admin Activity Logs</h3>
            
            {activityLogs.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>No activity logs found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: '0.9rem'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ padding: '0.8rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Timestamp</th>
                      <th style={{ padding: '0.8rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Admin</th>
                      <th style={{ padding: '0.8rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Action</th>
                      <th style={{ padding: '0.8rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Target</th>
                      <th style={{ padding: '0.8rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Description</th>
                      <th style={{ padding: '0.8rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '0.8rem', fontSize: '0.85rem' }}>{formatDate(log.timestamp)}</td>
                        <td style={{ padding: '0.8rem' }}>
                          <strong>{log.admin_username}</strong>
                          {log.admin_full_name && (
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>{log.admin_full_name}</div>
                          )}
                        </td>
                        <td style={{ padding: '0.8rem' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '3px',
                            fontSize: '0.85rem',
                            backgroundColor: log.action === 'CREATE_ADMIN' ? '#d4edda' : 
                                           log.action === 'REVOKE_ADMIN' ? '#f8d7da' : '#d1ecf1',
                            color: log.action === 'CREATE_ADMIN' ? '#155724' : 
                                   log.action === 'REVOKE_ADMIN' ? '#721c24' : '#0c5460'
                          }}>
                            {log.action_display}
                          </span>
                        </td>
                        <td style={{ padding: '0.8rem' }}>{log.target_username || '-'}</td>
                        <td style={{ padding: '0.8rem', fontSize: '0.9rem' }}>{log.description}</td>
                        <td style={{ padding: '0.8rem', fontSize: '0.85rem', color: '#666' }}>{log.ip_address || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminManagement;
