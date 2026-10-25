import { useColorScheme } from "react-native";

const light = {
  bg: "#f8fafc",
  card: "#ffffff",
  fg: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  accent: "#0f766e",
  onAccent: "#ffffff",
  inRange: "#16a34a",
  band: "rgba(22,163,74,0.15)",
  inputBg: "#ffffff",
};

const dark: typeof light = {
  bg: "#0b1120",
  card: "#1e293b",
  fg: "#f1f5f9",
  muted: "#94a3b8",
  border: "#334155",
  accent: "#5eead4",
  onAccent: "#0b1120",
  inRange: "#4ade80",
  band: "rgba(74,222,128,0.18)",
  inputBg: "#0f172a",
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === "dark" ? dark : light;
}
