import { useState, useEffect } from "react";
import { buildApiUrl } from "../utils/api";

function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // Countdown timer effect
  useEffect(() => {
    if (secondsRemaining > 0) {
      const timer = setTimeout(() => {
        setSecondsRemaining(secondsRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (rateLimited && secondsRemaining === 0) {
      setRateLimited(false);
      setError("");
    }
  }, [secondsRemaining, rateLimited]);

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    fetch(buildApiUrl("/auth/password-reset/request/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.toLowerCase() }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            // Check if rate limited
            if (data.rate_limited) {
              setRateLimited(true);
              setSecondsRemaining(data.seconds_remaining);
              throw new Error(data.error || "Too many attempts");
            }
            throw new Error(data.email?.[0] || data.error || "Failed to send reset email");
          });
        }
        return response.json();
      })
      .then((data) => {
        setSuccess(data.message || "Password reset email sent! Please check your inbox.");
        setEmail("");
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Forgot Password</h2>
        <p style={{ color: "#666", marginBottom: "1.5rem" }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {rateLimited && secondsRemaining > 0 && (
          <div className="rate-limit-banner" style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "4px",
            padding: "12px 16px",
            marginBottom: "1rem",
            textAlign: "center"
          }}>
            <strong style={{ color: "#856404", fontSize: "1.1em" }}>⏱️ Too Many Attempts</strong>
            <p style={{ margin: "8px 0 0 0", color: "#856404" }}>
              Please wait <strong style={{ fontSize: "1.3em", color: "#d39e00" }}>{formatTime(secondsRemaining)}</strong> before trying again.
            </p>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.9em", color: "#856404" }}>
              Maximum 3 requests per 10 minutes
            </p>
          </div>
        )}

        {error && !rateLimited && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            className="input input__lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="your.email@example.com"
            disabled={rateLimited && secondsRemaining > 0}
          />
        </div>

        <button 
          type="submit" 
          className="btn btn__primary btn__lg"
          disabled={loading || (rateLimited && secondsRemaining > 0)}
        >
          {loading ? "Sending..." : rateLimited && secondsRemaining > 0 ? "Please Wait..." : "Send Reset Link"}
        </button>

        <p className="auth-switch">
          Remember your password?{" "}
          <button 
            type="button" 
            className="link-button"
            onClick={onBackToLogin}
          >
            Back to Login
          </button>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;