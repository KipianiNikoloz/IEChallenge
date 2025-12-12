import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/dashboard/observables", label: "Observables" },
  { to: "/dashboard/utility", label: "Utility" },
  { to: "/dashboard/algorithm", label: "Algorithm" },
];

export function LayoutShell() {
  return (
    <div className="app-shell">
      <header style={headerStyle}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div style={brandStyle}>AGI Dashboard</div>
          <nav style={{ display: "flex", gap: "0.75rem" }}>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                style={({ isActive }) => ({
                  color: isActive ? "var(--accent)" : "var(--text)",
                  fontWeight: isActive ? 600 : 400,
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Admin</div>
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
  padding: "1rem 1.5rem",
  borderBottom: "1px solid var(--border)",
  background: "var(--bg-raised)",
};

const brandStyle: React.CSSProperties = {
  fontWeight: 700,
  letterSpacing: "0.04em",
};
