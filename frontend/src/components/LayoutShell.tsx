import React, { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { clearToken, isAuthenticated } from "../lib/auth";

const links = [
  { to: "/dashboard/observables", label: "Observables" },
  { to: "/dashboard/utility", label: "Utility" },
  { to: "/dashboard/algorithm", label: "Algorithm" },
];

export function LayoutShell() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <header style={headerStyle}>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <div style={brandStyle}>BlackBox</div>
          <nav style={{ display: "flex", gap: "0.5rem" }}>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                style={({ isActive }) => ({
                  color: isActive ? "var(--text)" : "var(--text-secondary)",
                  fontWeight: isActive ? 600 : 500,
                  padding: "0.5rem 0.75rem",
                  borderRadius: "var(--radius-sm)",
                  background: isActive ? "var(--accent-light)" : "transparent",
                  transition: "all 0.2s ease",
                  fontSize: "0.875rem",
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ color: "var(--muted)", fontSize: "0.875rem", fontWeight: 500 }}>Admin</div>
          <button onClick={handleLogout} style={{ height: "32px", fontSize: "0.8rem" }}>Logout</button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.75rem 2rem",
  borderBottom: "1px solid var(--border)",
  background: "var(--bg-raised)",
  boxShadow: "var(--shadow-sm)",
  position: "sticky",
  top: 0,
  zIndex: 10,
  backdropFilter: "blur(8px)",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
};

const brandStyle: React.CSSProperties = {
  fontWeight: 700,
  letterSpacing: "-0.03em",
  fontSize: "1.125rem",
  color: "var(--text)",
};
