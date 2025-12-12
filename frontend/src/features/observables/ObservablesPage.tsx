import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { clearToken, isAuthenticated } from "../../lib/auth";
import { get } from "../../lib/apiClient";

type EventNode = {
  id: number;
  label: string;
  weight: number;
  status: "PLANNED" | "COMPLETED" | "FAILED";
  type: "PAST" | "PLANNED" | "OPTIMIZATION";
};

type ObservableRow = {
  id: number;
  name: string;
  status: "STABLE" | "AT_RISK" | "OPTIMIZED";
  utility_x: number;
  utility_y: number;
  utility_distance: number;
  events: EventNode[];
};

export function ObservablesPage() {
  const [rows, setRows] = useState<ObservableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadObservables = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await get<Omit<ObservableRow, "events">[]>("/observables");
      const detailed = await Promise.all(
        summary.map(async (item) => {
          try {
            const detail = await get<{ events: EventNode[] }>(`/observables/${item.id}`);
            return { ...item, events: detail.events };
          } catch {
            return { ...item, events: [] };
          }
        }),
      );
      setRows(detailed);
    } catch (err: any) {
      if (err.response?.status === 401) {
        clearToken();
        navigate("/login");
        return;
      }
      setError("Unable to load observables");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    void loadObservables();
  }, [navigate, loadObservables]);

  return (
    <div className="card" style={{ display: "grid", gap: "1.25rem" }}>
      <div>
        <h2 style={{ margin: 0 }}>Observables</h2>
        <p style={{ margin: "0.25rem 0", color: "var(--muted)" }}>
          Scan event chains and utility state at a glance. Accent marks risk/optimization only.
        </p>
      </div>
      {loading && <div style={{ color: "var(--muted)" }}>Loading...</div>}
      {error && <div style={{ color: "var(--accent)" }}>{error}</div>}
      {!loading && !error && rows.length === 0 && (
        <div style={{ color: "var(--muted)" }}>No observables yet.</div>
      )}
      {!loading && !error && rows.length > 0 && (
        <div style={{ display: "grid", gap: "1rem" }}>
          {rows.map((row) => (
            <div key={row.id} style={rowStyle}>
              <div>
                <div style={{ fontWeight: 600 }}>{row.name}</div>
                <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                  Status: {row.status}
                </div>
                <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                  Distance: {row.utility_distance.toFixed(2)}
                </div>
              </div>
              <div style={chainStyle}>
                {row.events.length === 0 && (
                  <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No events</span>
                )}
                {row.events.map((event, idx) => (
                  <div
                    key={event.id}
                    style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                  >
                    {idx > 0 && <div style={connectorStyle} />}
                    <div style={nodeStyle(event)} title={event.label} />
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "right", minWidth: 140 }}>
                <div style={{ fontSize: "0.9rem", color: "var(--muted)" }}>Utility</div>
                <div style={{ fontWeight: 600 }}>
                  x: {row.utility_x.toFixed(2)} | y: {row.utility_y.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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
  flexWrap: "wrap",
};

const connectorStyle: React.CSSProperties = {
  height: 2,
  width: 32,
  background: "var(--border)",
};

const nodeStyle = (event: EventNode): React.CSSProperties => {
  const size = 16 + event.weight * 12;
  const base: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    border: "2px solid var(--border)",
    background: "transparent",
  };
  if (event.status === "COMPLETED") {
    return { ...base, background: "var(--text)", borderColor: "var(--text)" };
  }
  if (event.status === "PLANNED") {
    return { ...base, borderStyle: "dashed", borderColor: "var(--muted)" };
  }
  if (event.status === "FAILED") {
    return { ...base, background: "var(--accent)", borderColor: "var(--accent)" };
  }
  return base;
};
