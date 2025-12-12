import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Placeholder: wire up to auth API and token storage.
    if (username && password) {
      navigate("/dashboard/observables");
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: "4rem auto" }}>
      <h2 style={{ marginTop: 0 }}>Admin Login</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
        <label style={labelStyle}>
          <span>Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
            required
          />
        </label>
        <label style={labelStyle}>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
        </label>
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: "0.25rem",
  color: "var(--muted)",
  fontSize: "0.9rem",
};

const inputStyle: React.CSSProperties = {
  background: "var(--bg)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  padding: "0.55rem 0.65rem",
  borderRadius: "6px",
};
