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
    <div className="card" style={{ maxWidth: 400, margin: "6rem auto", padding: "2rem" }}>
      <h2 style={{ marginTop: 0, marginBottom: "1.5rem", textAlign: "center", fontSize: "1.5rem" }}>Admin Login</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.25rem" }}>
        <label style={labelStyle}>
          <span>Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
            required
            placeholder="Enter username"
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
            placeholder="Enter password"
          />
        </label>
        {error && <div style={{ color: "var(--error)", fontSize: "0.875rem", background: "#fef2f2", padding: "0.5rem", borderRadius: "var(--radius-sm)", textAlign: "center" }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ marginTop: "0.5rem", height: "40px", background: "var(--text)", color: "white", borderColor: "var(--text)" }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

const labelStyle: CSSProperties = {
  display: "grid",
  gap: "0.375rem",
  color: "var(--text-secondary)",
  fontSize: "0.875rem",
  fontWeight: 500,
};

const inputStyle: CSSProperties = {
  // Styles handled by global CSS mostly, but overriding specific needs if any
  width: "100%",
};
