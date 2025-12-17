import { useEffect, useMemo, useState, type CSSProperties } from "react";

import { get } from "../../lib/apiClient";
import { UtilityHistogram, UtilityScatter, buildHistogram } from "./utilityCharts";

type GlobalMetrics = {
  average_distance: number;
  percent_below_cutoff: number;
  system_stability_index: number;
  total_observables: number;
};

type ObservableUtility = {
  id: number;
  utility_x: number;
  utility_y: number;
  utility_distance: number;
  status: string;
};

export function UtilityPage() {
  const [metrics, setMetrics] = useState<GlobalMetrics | null>(null);
  const [points, setPoints] = useState<ObservableUtility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [globalData, observables] = await Promise.all([
          get<GlobalMetrics>("/utility/global"),
          get<ObservableUtility[]>("/observables"),
        ]);
        setMetrics(globalData);
        setPoints(observables);
      } catch {
        setError("Unable to load utility data");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const scatterPoints = useMemo(
    () =>
      points.map((p) => ({
        id: String(p.id),
        x: p.utility_x,
        y: p.utility_y,
        belowCutoff: p.utility_distance < 1,
      })),
    [points],
  );

  const histogramBins = useMemo(
    () => buildHistogram(points.map((p) => p.utility_distance)),
    [points],
  );

  return (
    <div className="card" style={{ display: "grid", gap: "2rem", padding: "2rem" }}>
      <div>
        <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Utility Overview</h2>
        <p style={{ margin: "0.5rem 0 0", color: "var(--text-secondary)" }}>
          Utility plane analysis with cutoff curve and distribution metrics.
        </p>
      </div>
      {loading && <div style={{ color: "var(--muted)" }}>Loading...</div>}
      {error && <div style={{ color: "var(--error)" }}>{error}</div>}
      {metrics && !loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
          <Metric label="Total observables" value={metrics.total_observables} />
          <Metric label="Average distance" value={metrics.average_distance} />
          <Metric label="% below cutoff" value={metrics.percent_below_cutoff * 100} suffix="%" />
          <Metric label="Stability index" value={metrics.system_stability_index} />
        </div>
      )}
      <div className="grid-2" style={{ gap: "2rem" }}>
        <div style={panelStyle}>
          <div style={panelHeader}>Utility Plane</div>
          {points.length === 0 ? (
            <div style={{ color: "var(--muted)", textAlign: "center", padding: "2rem" }}>No points yet.</div>
          ) : (
            <UtilityScatter points={scatterPoints} />
          )}
        </div>
        <div style={panelStyle}>
          <div style={panelHeader}>Utility Histogram</div>
          {histogramBins.length === 0 ? (
            <div style={{ color: "var(--muted)", textAlign: "center", padding: "2rem" }}>No distribution yet.</div>
          ) : (
            <UtilityHistogram bins={histogramBins} />
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  return (
    <div style={{ 
      padding: "1rem", 
      background: "var(--bg)", 
      borderRadius: "var(--radius-sm)", 
      border: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      gap: "0.25rem"
    }}>
      <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 500 }}>{label}</div>
      <div style={{ fontWeight: 700, letterSpacing: "-0.02em", fontSize: "1.5rem", color: "var(--text)" }}>
        {value.toFixed(2)}
        <span style={{ fontSize: "1rem", color: "var(--muted)", marginLeft: "0.1rem" }}>{suffix}</span>
      </div>
    </div>
  );
}

const panelStyle: CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "1.5rem",
  minHeight: 300,
  background: "var(--bg)",
  boxShadow: "var(--shadow-sm)",
};

const panelHeader: CSSProperties = {
  color: "var(--text)",
  fontSize: "1rem",
  fontWeight: 600,
  marginBottom: "1.5rem",
};
