export function AlgorithmPage() {
  return (
    <div className="card" style={{ display: "grid", gap: "1rem" }}>
      <div>
        <h2 style={{ margin: 0 }}>Algorithm</h2>
        <p style={{ margin: "0.25rem 0", color: "var(--muted)" }}>
          Transparency view for the optimization engine. Summaries and log feed render in a neutral,
          monotone palette.
        </p>
      </div>
      <div style={logPanelStyle}>
        <div style={{ fontWeight: 600 }}>Summary</div>
        <p style={{ margin: "0.25rem 0", color: "var(--muted)" }}>
          Objective: keep observables above cutoff with minimal interventions.
        </p>
        <div style={{ marginTop: "0.75rem", fontWeight: 600 }}>Recent logs</div>
        <ul style={logListStyle}>
          <li>Optimizer idle; monitoring drift.</li>
          <li>Next evaluation window: +5 minutes.</li>
        </ul>
      </div>
    </div>
  );
}

const logPanelStyle: React.CSSProperties = {
  border: "1px dashed var(--border)",
  borderRadius: 12,
  padding: "1rem",
};

const logListStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: "0.25rem 0 0",
  display: "grid",
  gap: "0.35rem",
  color: "var(--muted)",
};
import React from "react";
