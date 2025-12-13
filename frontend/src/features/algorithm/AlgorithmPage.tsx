import { useEffect, useState, type CSSProperties } from "react";

import { get } from "../../lib/apiClient";

type AlgorithmSummary = { objective: string; status: string; version: string };
type AlgorithmLogEntry = { id: number; level: string; message: string; timestamp: string };

export function AlgorithmPage() {
  const [summary, setSummary] = useState<AlgorithmSummary | null>(null);
  const [logs, setLogs] = useState<AlgorithmLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryData, logsData] = await Promise.all([
          get<AlgorithmSummary>("/algorithm/summary"),
          get<AlgorithmLogEntry[]>("/algorithm/logs"),
        ]);
        setSummary(summaryData);
        setLogs(logsData);
      } catch {
        setError("Unable to load algorithm data");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const badgeColor = (level: string) => {
    if (level === "ERROR" || level === "WARN" || level === "WARNING") {
      return "var(--accent)";
    }
    return "var(--text)";
  };

  return (
    <div className="card" style={{ display: "grid", gap: "1rem" }}>
      <div>
        <h2 style={{ margin: 0 }}>Algorithm</h2>
        <p style={{ margin: "0.25rem 0", color: "var(--muted)" }}>
          Transparency view for the optimization engine. Summaries and live-ish log feed in a neutral,
          monotone palette.
        </p>
      </div>
      {loading && <div style={{ color: "var(--muted)" }}>Loading...</div>}
      {error && <div style={{ color: "var(--accent)" }}>{error}</div>}
      {!loading && !error && (
        <div style={{ display: "grid", gap: "1rem" }}>
          <div style={summaryGrid}>
            <SummaryTile label="Objective" value={summary?.objective ?? "N/A"} />
            <SummaryTile label="Status" value={summary?.status ?? "unknown"} />
            <SummaryTile label="Version" value={summary?.version ?? "-"} />
          </div>
          <div style={logPanelStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 600 }}>Recent logs</div>
              <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                Showing latest {logs.length || 0}
              </div>
            </div>
            <div style={logFeedStyle}>
              {logs.length === 0 && <div style={{ color: "var(--muted)" }}>No logs yet.</div>}
              {logs.map((log) => (
                <div key={log.id} style={logRowStyle}>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span style={{ ...badgeStyle, color: badgeColor(log.level) }}>{log.level}</span>
                    <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{log.timestamp}</span>
                  </div>
                  <div>{log.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={tileStyle}>
      <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{label}</div>
      <div style={{ fontWeight: 700, letterSpacing: "0.01em" }}>{value}</div>
    </div>
  );
}

const summaryGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "0.75rem",
};

const tileStyle: CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "0.85rem",
  background: "var(--bg)",
};

const logPanelStyle: CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "1rem",
  background: "var(--bg)",
  minHeight: 220,
};

const logFeedStyle: CSSProperties = {
  display: "grid",
  gap: "0.6rem",
  maxHeight: 260,
  overflowY: "auto",
  paddingRight: "0.25rem",
};

const logRowStyle: CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "0.6rem 0.75rem",
  display: "grid",
  gap: "0.3rem",
};

const badgeStyle: CSSProperties = {
  fontSize: "0.8rem",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};
