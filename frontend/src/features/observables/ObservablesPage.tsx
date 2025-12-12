type EventNode = {
  id: number;
  label: string;
  weight: number;
  status: "completed" | "planned" | "failed" | "optimization";
};

type ObservableRow = {
  id: number;
  name: string;
  utilityX: number;
  utilityY: number;
  status: "STABLE" | "AT_RISK" | "OPTIMIZED";
  events: EventNode[];
};

const mockRows: ObservableRow[] = [
  {
    id: 1,
    name: "Person A",
    utilityX: 0.4,
    utilityY: 0.6,
    status: "STABLE",
    events: [
      { id: 1, label: "p1", weight: 0.3, status: "completed" },
      { id: 2, label: "p2", weight: 0.4, status: "planned" },
      { id: 3, label: "p3", weight: 0.2, status: "failed" },
    ],
  },
  {
    id: 2,
    name: "Person B",
    utilityX: -0.1,
    utilityY: 0.2,
    status: "AT_RISK",
    events: [
      { id: 1, label: "p1", weight: 0.25, status: "completed" },
      { id: 2, label: "p2", weight: 0.3, status: "planned" },
    ],
  },
];

export function ObservablesPage() {
  return (
    <div className="card" style={{ display: "grid", gap: "1.25rem" }}>
      <div>
        <h2 style={{ margin: 0 }}>Observables</h2>
        <p style={{ margin: "0.25rem 0", color: "var(--muted)" }}>
          Scan event chains and utility state at a glance. Accent marks risk/optimization only.
        </p>
      </div>
      <div style={{ display: "grid", gap: "1rem" }}>
        {mockRows.map((row) => (
          <div key={row.id} style={rowStyle}>
            <div>
              <div style={{ fontWeight: 600 }}>{row.name}</div>
              <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                Status: {row.status}
              </div>
            </div>
            <div style={chainStyle}>
              {row.events.map((event, idx) => (
                <div key={event.id} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  {idx > 0 && <div style={connectorStyle} />}
                  <div style={nodeStyle(event)} title={event.label} />
                </div>
              ))}
            </div>
            <div style={{ textAlign: "right", minWidth: 120 }}>
              <div style={{ fontSize: "0.9rem", color: "var(--muted)" }}>Utility</div>
              <div style={{ fontWeight: 600 }}>
                x: {row.utilityX.toFixed(2)} | y: {row.utilityY.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const rowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "180px 1fr 140px",
  alignItems: "center",
  gap: "1rem",
};

const chainStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
};

const connectorStyle: React.CSSProperties = {
  height: 2,
  width: 32,
  background: "var(--border)",
};

const nodeStyle = (event: EventNode): React.CSSProperties => {
  const base: React.CSSProperties = {
    width: 16 + event.weight * 16,
    height: 16 + event.weight * 16,
    borderRadius: "50%",
    border: "2px solid var(--border)",
    background: "transparent",
  };
  if (event.status === "completed") {
    return { ...base, background: "var(--text)", borderColor: "var(--text)" };
  }
  if (event.status === "planned") {
    return { ...base, borderStyle: "dashed", borderColor: "var(--muted)" };
  }
  if (event.status === "failed" || event.status === "optimization") {
    return { ...base, background: "var(--accent)", borderColor: "var(--accent)" };
  }
  return base;
};
import React from "react";
