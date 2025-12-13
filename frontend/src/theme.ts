export const theme = {
  background: "var(--bg)",
  backgroundRaised: "var(--bg-raised)",
  text: "var(--text)",
  muted: "var(--muted)",
  border: "var(--border)",
  accent: "var(--accent)",
  success: "var(--success)",
  // Soft elevation + radius tokens for consistent surfaces.
  radius: "var(--radius)",
  shadow: "var(--shadow)",
};

export function applyTheme() {
  document.body.style.backgroundColor = theme.background;
  document.body.style.color = theme.text;
}
