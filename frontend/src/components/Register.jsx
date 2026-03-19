import { useState } from "react";
import { buildApiUrl } from "../utils/api";

function Register({ onRegister, onSwitchToLogin }) {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [memorableQuestion, setMemorableQuestion] = useState("");
  const [memorableAnswer, setMemorableAnswer] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const memorableQuestions = [
    "Name of pet",
    "Country of origin",
    "Mother's maiden name"
  ];

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    // Format memorable information as JSON
    const memorableInfo = memorableQuestion && memorableAnswer 
      ? JSON.stringify({ question: memorableQuestion, answer: memorableAnswer })
      : "";

    fetch(buildApiUrl("/auth/register/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, first_name: firstName, last_name: lastName, email, memorable_information: memorableInfo, password }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.username?.[0] || data.email?.[0] || "Registration failed");
          });
        }
        return response.json();
      })
      .then((data) => {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        onRegister(data);
        setUsername("");
        setFirstName("");
        setLastName("");
        setEmail("");
        setMemorableQuestion("");
        setMemorableAnswer("");
        setPassword("");
        setConfirmPassword("");
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
        <h2>Register</h2>
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
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            className="input input__lg"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            autoComplete="given-name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            className="input input__lg"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            autoComplete="family-name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="input input__lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="memorableQuestion">Security Question (Optional)</label>
          <select
            id="memorableQuestion"
            className="input input__lg"
            value={memorableQuestion}
            onChange={(e) => {
              setMemorableQuestion(e.target.value);
              if (!e.target.value) setMemorableAnswer("");
            }}
            autoComplete="off"
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
          <div className="form-group">
            <label htmlFor="memorableAnswer">Answer</label>
            <input
              type="text"
              id="memorableAnswer"
              className="input input__lg"
              value={memorableAnswer}
              onChange={(e) => setMemorableAnswer(e.target.value)}
              placeholder="Your answer"
              autoComplete="off"
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="input input__lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            className="input input__lg"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <button 
          type="submit" 
          className="btn btn__primary btn__lg"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="auth-switch">
          Already have an account?{" "}
          <button 
            type="button" 
            className="link-button"
            onClick={onSwitchToLogin}
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
}

export default Register;
