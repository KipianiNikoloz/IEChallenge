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

  return (
    <div className="card" style={{ display: "grid", gap: "1rem" }}>
      <div>
        <h2 style={{ margin: 0 }}>Algorithm</h2>
        <p style={{ margin: "0.25rem 0", color: "var(--muted)" }}>
          Transparency view for the optimization engine. Summaries and log feed render in a neutral,
          monotone palette.
        </p>
      </div>
      {loading && <div style={{ color: "var(--muted)" }}>Loading...</div>}
      {error && <div style={{ color: "var(--accent)" }}>{error}</div>}
      {!loading && !error && (
        <div style={logPanelStyle}>
          <div style={{ fontWeight: 600 }}>Summary</div>
          <p style={{ margin: "0.25rem 0", color: "var(--muted)" }}>
            Objective: {summary?.objective ?? "N/A"}
          </p>
          <p style={{ margin: "0.25rem 0", color: "var(--muted)" }}>
            Status: {summary?.status ?? "unknown"} · Version: {summary?.version ?? "-"}
          </p>
          <div style={{ marginTop: "0.75rem", fontWeight: 600 }}>Recent logs</div>
          <ul style={logListStyle}>
            {logs.length === 0 && <li>No logs yet.</li>}
            {logs.map((log) => (
              <li key={log.id}>
                <span style={{ color: "var(--muted)" }}>{log.timestamp}</span> —{" "}
                <strong>{log.level}</strong>: {log.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const logPanelStyle: CSSProperties = {
  border: "1px dashed var(--border)",
  borderRadius: 12,
  padding: "1rem",
};

const logListStyle: CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: "0.25rem 0 0",
  display: "grid",
  gap: "0.35rem",
  color: "var(--muted)",
};
