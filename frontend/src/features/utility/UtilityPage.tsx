export function UtilityPage() {
  return (
    <div className="card" style={{ display: "grid", gap: "1.5rem" }}>
      <div>
        <h2 style={{ margin: 0 }}>Utility</h2>
        <p style={{ margin: "0.25rem 0", color: "var(--muted)" }}>
          Utility scatter with sigmoid cutoff, satisfaction thresholds, and distribution bars. Monotone
          palette with accent reserved for below-cutoff points.
        </p>
      </div>
      <div className="grid-2">
        <div style={panelStyle}>
          <div style={panelHeader}>Utility Plane</div>
          <div style={planePlaceholder}>Scatter + cutoff curve placeholder</div>
        </div>
        <div style={panelStyle}>
          <div style={panelHeader}>Utility Histogram</div>
          <div style={barPlaceholder}>Bars with satisfaction thresholds placeholder</div>
        </div>
      </div>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  border: "1px dashed var(--border)",
  borderRadius: 12,
  padding: "1rem",
  minHeight: 220,
};

const panelHeader: React.CSSProperties = {
  color: "var(--muted)",
  fontSize: "0.95rem",
  marginBottom: "0.75rem",
};

const planePlaceholder: React.CSSProperties = {
  height: 160,
  background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
  borderRadius: 10,
  display: "grid",
  placeItems: "center",
  color: "var(--muted)",
  border: "1px solid var(--border)",
};

const barPlaceholder: React.CSSProperties = {
  height: 160,
  background: "linear-gradient(0deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
  borderRadius: 10,
  display: "grid",
  placeItems: "center",
  color: "var(--muted)",
  border: "1px solid var(--border)",
};
import React from "react";
