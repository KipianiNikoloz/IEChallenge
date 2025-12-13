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
    <div className="card" style={{ display: "grid", gap: "1.5rem" }}>
      <div>
        <h2 style={{ margin: 0 }}>Utility</h2>
        <p style={{ margin: "0.25rem 0", color: "var(--muted)" }}>
          Utility plane with cutoff curve and distribution bars. Accent is reserved for below-cutoff
          risk points.
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
          {points.length === 0 ? (
            <div style={{ color: "var(--muted)" }}>No points yet.</div>
          ) : (
            <UtilityScatter points={scatterPoints} />
          )}
        </div>
        <div style={panelStyle}>
          <div style={panelHeader}>Utility Histogram</div>
          {histogramBins.length === 0 ? (
            <div style={{ color: "var(--muted)" }}>No distribution yet.</div>
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
