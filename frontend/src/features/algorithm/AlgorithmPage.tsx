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
    <div className="card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0, fontWeight: 600, letterSpacing: "-0.02em", fontSize: "1.5rem" }}>Algorithm</h2>
        <div style={{ 
          fontSize: "0.875rem", 
          color: "var(--text-secondary)", 
          fontFamily: "monospace", 
          background: "var(--bg)", 
          padding: "0.25rem 0.5rem", 
          borderRadius: "4px", 
          border: "1px solid var(--border)" 
        }}>
          v{summary?.version ?? "0.x"}
        </div>
      </div>

      {loading && <div style={{ color: "var(--muted)" }}>Loading...</div>}
      {error && <div style={{ color: "var(--error)" }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          
          <div style={gridShell}>
            <InfoBlock
              title="∴ Θ"
              content={[
                "λΣΣ :: //{ΔΔ}",
                `v=${summary?.status ?? "UNK"} :: ⊠⊠⊠`,
                "ƒ(x)=Σ e^{-x} ░░░",
              ]}
            />
            <InfoBlock
              title="ξξξξ"
              content={[
                "[ ψ ≈ NULL ] ::" ,
                "∑λ⟂⟂⟂   0xAF12   ▓▓▓▓",
                "{r:r:r:r} :: ???",
              ]}
            />
            <InfoBlock
              title="∴objective"
              content={[
                truncate(summary?.objective ?? "∅"),
                "ΞΞΞΞΞΞΞΞΞΞΞΞ",
                "while(true){⧟⧟⧟}",
              ]}
              variant="wide"
            />
            <InfoBlock
              title="φ-stack"
              content={[
                "[0x00|0x0F|0xFF]",
                "Σ(i=0→n) λ_i μ_i ▒▒▒",
                "ƒ≈{∂/∂t ▷ ▷ ▷}",
                "ψψψ ψψ ψψψ",
              ]}
            />
            <InfoBlock
              title="unk/pkt"
              content={[
                "⌊1101⌋ ⌈0011⌉ ⌊1010⌋",
                "∵∴∵   { }   ∵∴∵",
                "::= >>= <<= ::=",
                "ΩΩΩΩΩΩΩΩΩΩΩΩΩ",
              ]}
            />
          </div>

          <div style={shardField}>
            {["⊡ ⊠ ⊡", "∑∑∑ λλλ", "░░░░", "∂ψ/∂t ≠ 0", "NULL≠0x00", "ξξξξξ", "⧜⧜⧜"].map((frag, idx) => (
              <div
                key={idx}
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                  padding: "0.25rem 0.5rem",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  background: "var(--bg)",
                  color: "var(--text-secondary)",
                  textAlign: "center"
                }}
              >
                {frag}
              </div>
            ))}
          </div>

          <div style={graphShell}>
            <NetworkGraph />
          </div>

          <div style={logField}>
            {logs.length === 0 && <div style={{ color: "var(--muted)", padding: "1rem", textAlign: "center" }}>No logs available</div>}
            {logs.map((log, idx) => (
              <div
                key={log.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "center",
                  padding: "0.5rem 0.75rem",
                  borderBottom: "1px solid var(--border)",
                  fontFamily: "monospace",
                  fontSize: "0.8rem",
                  background: idx % 2 === 0 ? "var(--bg)" : "transparent",
                  color: "var(--text-secondary)"
                }}
              >
                <span style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span style={{ color: "var(--accent)", fontWeight: 600 }}>[{log.level}]</span>
                  <span>
                    {mask(log.message)} ⧝ {scramble(log.timestamp)} ⧝ {ghostBits(idx)}
                  </span>
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

function InfoBlock({
  title,
  content,
  variant,
}: {
  title: string;
  content: string[];
  variant?: "wide";
}) {
  const base: CSSProperties = {
    border: "1px solid var(--border)",
    padding: "1rem",
    background: "var(--bg-raised)",
    borderRadius: "var(--radius-sm)",
    position: "relative",
    overflow: "hidden",
    minHeight: 120,
    boxShadow: "var(--shadow-sm)",
  };
  if (variant === "wide") base.gridColumn = "span 2";

  return (
    <div style={base}>
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.05em",
          marginBottom: "0.75rem",
          textTransform: "uppercase",
          color: "var(--muted)"
        }}
      >
        {title}
      </div>
      <div style={{ display: "grid", gap: "0.35rem" }}>
        {content.map((line, idx) => (
          <div
            key={idx}
            style={{
              fontFamily: "monospace",
              fontSize: "0.85rem",
              color: "var(--text)",
              whiteSpace: "pre-wrap",
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
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "1rem",
};

const logField: CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  maxHeight: 300,
  overflowY: "auto",
  background: "var(--bg-raised)",
  boxShadow: "inset 0 2px 4px 0 rgba(0,0,0,0.02)"
};

const shardField: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
  justifyContent: "center",
  opacity: 0.8
};

const graphShell: CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "1rem",
  background: "var(--bg)",
  overflow: "hidden"
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

function ghostBits(idx: number): string {
  const ghost = ["0b1011", "▒▒▒", "∧∨∧", "⊗⊙⊗", "∞", "φ"];
  return ghost[idx % ghost.length] ?? "▒";
}

function NetworkGraph() {
  const nodes = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: 20 + (i * 37) % 260 + (i % 3) * 8,
    y: 20 + (i * 53) % 140 + ((i % 4) - 1) * 6,
    r: 4 + (i % 5),
  }));
  const edges = [
    [0, 1],
    [1, 3],
    [2, 5],
    [3, 6],
    [4, 7],
    [5, 8],
    [6, 9],
    [7, 10],
    [8, 11],
    [9, 12],
    [10, 13],
    [11, 14],
    [12, 15],
    [13, 16],
    [14, 17],
    [2, 9],
    [5, 13],
    [0, 8],
    [4, 12],
  ];

  return (
    <svg viewBox="0 0 320 180" style={{ width: "100%", display: "block", overflow: "visible" }}>
      <rect x={0} y={0} width={320} height={180} fill="transparent" />
      {edges.map(([a, b], idx) => {
        const from = nodes[a];
        const to = nodes[b];
        return (
          <g key={`e-${idx}`} opacity={0.6}>
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="var(--border-hover)"
              strokeWidth={1}
            />
          </g>
        );
      })}
      {nodes.map((node, idx) => (
        <g key={`n-${node.id}`}>
          <circle
            cx={node.x}
            cy={node.y}
            r={node.r}
            fill="var(--bg-raised)"
            stroke="var(--accent)"
            strokeWidth={1.5}
          />
        </g>
      ))}
    </svg>
  );
}
