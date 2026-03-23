import { useState } from "react";
import { buildApiUrl } from "../utils/api";

function Login({ onLogin, onSwitchToRegister, onSwitchToForgotPassword }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    fetch(buildApiUrl("/auth/token/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.toLowerCase(), password }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Invalid credentials");
        }
        return response.json();
      })
      .then((data) => {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        onLogin(data);
        setUsername("");
        setPassword("");
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
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            className="input input__lg"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="input input__lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button 
          type="submit" 
          className="btn btn__primary btn__lg"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="auth-switch" style={{ marginTop: "1rem" }}>
          <button 
            type="button" 
            className="link-button"
            onClick={onSwitchToForgotPassword}
          >
            Forgot Password?
          </button>
        </p>

        <p className="auth-switch">
          Don't have an account?{" "}
          <button 
            type="button" 
            className="link-button"
            onClick={onSwitchToRegister}
          >
            Register
          </button>
        </p>
      </form>
    </div>
  );
}

export default Login;
