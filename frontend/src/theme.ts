export const theme = {
  background: "var(--bg)",
  backgroundRaised: "var(--bg-raised)",
  text: "var(--text)",
  muted: "var(--muted)",
  border: "var(--border)",
  accent: "var(--accent)",
  success: "var(--success)",
};

export function applyTheme() {
  document.body.style.backgroundColor = theme.background;
  document.body.style.color = theme.text;
}
