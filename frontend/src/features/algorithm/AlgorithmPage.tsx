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
    <div className="card" style={{ position: "relative", overflow: "hidden", padding: "1.25rem" }}>
      <style>
        {`
          .alg-noise { mix-blend-mode: multiply; }
          .alg-scan { animation: alg-scan 4.8s ease-in-out infinite; opacity: 0.12; }
          .alg-blink { animation: alg-blink 3.2s steps(2, end) infinite; }
          .alg-drift { animation: alg-drift 9s ease-in-out infinite alternate; }
          .alg-jitter { animation: alg-jitter 2.4s steps(4, end) infinite; }
          @keyframes alg-scan { 0% { transform: translateY(-8%); } 50% { transform: translateY(8%); } 100% { transform: translateY(-8%); } }
          @keyframes alg-blink { 0%, 49% { opacity: 0.65; } 50%, 100% { opacity: 0.18; } }
          @keyframes alg-drift { 0% { transform: translateX(-2%); } 100% { transform: translateX(2%); } }
          @keyframes alg-jitter { 0% { transform: translate(0, 0); } 50% { transform: translate(1px, -1px); } 100% { transform: translate(-1px, 1px); } }
        `}
      </style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
        <h2 style={{ margin: 0, fontWeight: 600, letterSpacing: "0.08em" }}>Algorithm</h2>
        <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>∴{summary?.version ?? "0.x"}∵</div>
      </div>

      {loading && <div style={{ color: "var(--muted)" }}>Loading...</div>}
      {error && <div style={{ color: "var(--accent)" }}>{error}</div>}

      {!loading && !error && (
        <div style={{ position: "relative", minHeight: 320 }}>
          <div
            aria-hidden
            className="alg-noise alg-drift"
            style={{
              position: "absolute",
              inset: "-8% -6%",
              background:
                "repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0, rgba(0,0,0,0.08) 3px, transparent 4px)",
              pointerEvents: "none",
            }}
          />
          <div
            aria-hidden
            className="alg-scan"
            style={{
              position: "absolute",
              inset: "-10% -6%",
              background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)",
              pointerEvents: "none",
            }}
          />

          <div style={gridShell}>
            <ChaoticBlock
              title="∴ Θ"
              content={[
                "λΣΣ :: //{ΔΔ}",
                `v=${summary?.status ?? "UNK"} :: ⊠⊠⊠`,
                "ƒ(x)=Σ e^{-x} ░░░",
              ]}
              variant="overlay"
            />
            <ChaoticBlock
              title="ξξξξ"
              content={[
                "[ ψ ≈ NULL ] ::" ,
                "∑λ⟂⟂⟂   0xAF12   ▓▓▓▓",
                "{r:r:r:r} :: ???",
              ]}
              variant="tight"
            />
            <ChaoticBlock
              title="∴objective"
              content={[
                truncate(summary?.objective ?? "∅"),
                "ΞΞΞΞΞΞΞΞΞΞΞΞ",
                "while(true){⧟⧟⧟}",
              ]}
              variant="wide"
            />
          </div>

          <div style={logField}>
            {logs.length === 0 && <div style={{ color: "var(--muted)" }}>∴ no emissions</div>}
            {logs.map((log, idx) => (
              <div
                key={log.id}
                className={idx % 3 === 0 ? "alg-blink" : ""}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "center",
                  padding: "0.35rem 0.4rem",
                  borderBottom: "1px solid rgba(0,0,0,0.08)",
                  fontFamily: idx % 2 === 0 ? "'SFMono-Regular', Consolas, monospace" : "Inter, sans-serif",
                  fontSize: idx % 2 === 0 ? "0.85rem" : "0.9rem",
                  letterSpacing: idx % 2 === 0 ? "0.12em" : "-0.01em",
                  lineHeight: 1.25,
                  background: idx % 4 === 0 ? "rgba(0,0,0,0.04)" : "transparent",
                }}
              >
                <span>
                  {mask(log.message)} ⧝ {log.level} :: {scramble(log.timestamp)}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>∻∻∻</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChaoticBlock({
  title,
  content,
  variant,
}: {
  title: string;
  content: string[];
  variant?: "overlay" | "tight" | "wide";
}) {
  const base: CSSProperties = {
    border: "1px solid rgba(0,0,0,0.2)",
    padding: "0.65rem",
    background: variant === "overlay" ? "rgba(0,0,0,0.05)" : "var(--bg-raised)",
    borderRadius: 8,
    position: "relative",
    overflow: "hidden",
    minHeight: 120,
  };
  if (variant === "overlay") base.mixBlendMode = "multiply";
  if (variant === "wide") base.gridColumn = "span 2";

  return (
    <div style={base}>
      <div
        style={{
          fontFamily: "'SFMono-Regular', Consolas, monospace",
          fontSize: "0.8rem",
          letterSpacing: "0.2em",
          marginBottom: "0.35rem",
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: 0.16, pointerEvents: "none" }}>
        <div className="alg-jitter" style={{ position: "absolute", top: "12%", left: "6%" }}>
          ▓▓▓▓▓
        </div>
        <div className="alg-blink" style={{ position: "absolute", bottom: "8%", right: "12%", fontSize: "0.7rem" }}>
          ⧜⧜⧜
        </div>
      </div>
      <div style={{ display: "grid", gap: "0.25rem" }}>
        {content.map((line, idx) => (
          <div
            key={idx}
            style={{
              fontFamily: idx % 2 === 0 ? "'SFMono-Regular', Consolas, monospace" : "Inter, sans-serif",
              fontSize: idx % 2 === 0 ? "0.78rem" : "0.9rem",
              letterSpacing: idx % 2 === 0 ? "0.14em" : "-0.04em",
              whiteSpace: "pre",
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

const gridShell: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "0.75rem",
  marginBottom: "1rem",
};

const logField: CSSProperties = {
  border: "1px solid rgba(0,0,0,0.18)",
  borderRadius: 8,
  padding: "0.35rem",
  maxHeight: 280,
  overflow: "hidden",
  background: "linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.02))",
};

function mask(value: string): string {
  const fragments = value.split(" ");
  return fragments
    .map((frag, idx) => (idx % 2 === 0 ? "▣".repeat(Math.min(frag.length, 6)) : frag))
    .join(" ");
}

function scramble(input: string): string {
  const glyphs = ["∴", "∵", "⟂", "ξ", "λ", "░"];
  return input
    .split("")
    .map((ch, idx) => (idx % 3 === 0 ? glyphs[idx % glyphs.length] : ch))
    .join("");
}

function truncate(value: string): string {
  if (value.length <= 26) return value;
  return value.slice(0, 18) + "…" + value.slice(-5);
}
