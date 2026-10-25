import type { Flag, LabResult } from "./types";
import { markerById } from "./markers";

export const FLAG_LABEL: Record<Flag, string> = {
  low: "偏低 Low",
  normal: "正常 Normal",
  high: "偏高 High",
};

export function formatValue(n: number): string {
  return Number.isInteger(n) ? n.toLocaleString("en-US") : String(n);
}

export function rangeText(r: LabResult): string {
  const m = markerById(r.markerId);
  const lo = r.refLow ?? m?.refLow;
  const hi = r.refHigh ?? m?.refHigh;
  if (lo !== undefined && hi !== undefined) return `${lo} – ${hi}`;
  if (hi !== undefined) return `≤ ${hi}`;
  if (lo !== undefined) return `≥ ${lo}`;
  return "–";
}
