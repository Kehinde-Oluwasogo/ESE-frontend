import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { buildApiUrl } from "../utils/api";

function RegisterUser() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: ""
  });
  const [memorableQuestion, setMemorableQuestion] = useState("");
  const [memorableAnswer, setMemorableAnswer] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const memorableQuestions = [
    "Name of pet",
    "Country of origin",
    "Mother's maiden name"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Format memorable information as JSON
    const memorableInfo = memorableQuestion && memorableAnswer 
      ? JSON.stringify({ question: memorableQuestion, answer: memorableAnswer })
      : "";

    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(buildApiUrl("/auth/users/create/"), {
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
          last_name: ""
        });
        setMemorableQuestion("");
        setMemorableAnswer("");
      } else {
        setError(data.error || 'Failed to create user account');
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      setError('Failed to create user account');
    } finally {
      setLoading(false);
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

  return (
    <div className="profile-container" style={{ maxWidth: '600px' }}>
      <div className="profile-card">
        <h2 style={{ 
          fontSize: '2.8rem', 
          marginBottom: '2rem', 
          textAlign: 'center',
          color: '#333'
        }}>
          Create User Account
        </h2>

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

        <form onSubmit={handleSubmit}>
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

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: 'white',
              background: loading ? '#ccc' : '#007bff',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating...' : 'Create User Account'}
          </button>
        </form>

        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: '#f9f9f9', 
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          <p style={{ margin: 0 }}>
            <strong>Note:</strong> This will create a regular user account. The user will be able to login and create their own bookings.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterUser;
