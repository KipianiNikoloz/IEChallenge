import { FormEvent, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";

import { post } from "../../lib/apiClient";
import { setToken } from "../../lib/auth";

type LoginResponse = { access_token: string; token_type: string };

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await post<LoginResponse>("/auth/login", { username, password });
      setToken(data.access_token);
      navigate("/dashboard/observables");
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
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
        {error && <div style={{ color: "var(--accent)", fontSize: "0.9rem" }}>{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

const labelStyle: CSSProperties = {
  display: "grid",
  gap: "0.25rem",
  color: "var(--muted)",
  fontSize: "0.9rem",
};

const inputStyle: CSSProperties = {
  background: "var(--bg)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  padding: "0.55rem 0.65rem",
  borderRadius: "6px",
};
