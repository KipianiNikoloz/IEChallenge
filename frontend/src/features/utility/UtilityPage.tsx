import { useEffect, useState, type CSSProperties } from "react";

import { get } from "../../lib/apiClient";

type GlobalMetrics = {
  average_distance: number;
  percent_below_cutoff: number;
  system_stability_index: number;
  total_observables: number;
};

export function UtilityPage() {
  const [metrics, setMetrics] = useState<GlobalMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await get<GlobalMetrics>("/utility/global");
        setMetrics(data);
      } catch {
        setError("Unable to load utility metrics");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <div className="card" style={{ display: "grid", gap: "1.5rem" }}>
      <div>
        <h2 style={{ margin: 0 }}>Utility</h2>
        <p style={{ margin: "0.25rem 0", color: "var(--muted)" }}>
          Utility scatter with sigmoid cutoff, satisfaction thresholds, and distribution bars. Monotone
          palette with accent reserved for below-cutoff points.
        </p>
      </div>
      {loading && <div style={{ color: "var(--muted)" }}>Loading...</div>}
      {error && <div style={{ color: "var(--accent)" }}>{error}</div>}
      {metrics && !loading && !error && (
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Metric label="Total observables" value={metrics.total_observables} />
          <Metric label="Average distance" value={metrics.average_distance} />
          <Metric label="% below cutoff" value={metrics.percent_below_cutoff * 100} suffix="%" />
          <Metric label="Stability index" value={metrics.system_stability_index} />
        </div>
      )}
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

function Metric({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  return (
    <div style={{ minWidth: 180 }}>
      <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{label}</div>
      <div style={{ fontWeight: 700, letterSpacing: "0.01em" }}>
        {value.toFixed(2)}
        {suffix}
      </div>
    </div>
  );
}

const panelStyle: CSSProperties = {
  border: "1px dashed var(--border)",
  borderRadius: 12,
  padding: "1rem",
  minHeight: 220,
};

const panelHeader: CSSProperties = {
  color: "var(--muted)",
  fontSize: "0.95rem",
  marginBottom: "0.75rem",
};

const planePlaceholder: CSSProperties = {
  height: 160,
  background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
  borderRadius: 10,
  display: "grid",
  placeItems: "center",
  color: "var(--muted)",
  border: "1px solid var(--border)",
};

const barPlaceholder: CSSProperties = {
  height: 160,
  background: "linear-gradient(0deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
  borderRadius: 10,
  display: "grid",
  placeItems: "center",
  color: "var(--muted)",
  border: "1px solid var(--border)",
};
