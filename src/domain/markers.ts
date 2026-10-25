import type { Flag, LabResult, MarkerDef } from "./types";
import { MARKER_EDUCATION } from "./marker-education";

const BUILT_IN_MARKERS: MarkerDef[] = [
  { id: "wbc", abbr: "WBC", zh: "白血球總數", en: "White Blood Cell", unit: "/µL", refLow: 4000, refHigh: 10000 },
  { id: "anc", abbr: "ANC", zh: "絕對嗜中性白血球數", en: "Absolute Neutrophil Count", unit: "/µL", refLow: 1500, refHigh: 7000 },
  { id: "lym", abbr: "LYM", zh: "淋巴球", en: "Lymphocyte", unit: "%", refLow: 20, refHigh: 40 },
  { id: "mono", abbr: "MONO", zh: "單核球", en: "Monocytes", unit: "%", refLow: 2, refHigh: 8 },
  { id: "eos", abbr: "EOS", zh: "嗜酸性白血球", en: "Eosinophil", unit: "%", refLow: 0, refHigh: 5 },
  { id: "hgb", abbr: "HGB", zh: "血紅素", en: "Hemoglobin", unit: "g/dL", refLow: 12, refHigh: 16 },
  { id: "plt", abbr: "PLT", zh: "血小板", en: "Platelet", unit: "/µL", refLow: 150000, refHigh: 400000 },
  { id: "pt", abbr: "PT", zh: "凝血酶原時間", en: "Prothrombin Time", unit: "s", refLow: 10, refHigh: 13 },
  { id: "ggt", abbr: "GGT", zh: "γ-麩胺醯轉移酶", en: "Gamma-GT", unit: "U/L", refLow: 7, refHigh: 50 },
  { id: "crea", abbr: "Crea", zh: "血清肌酸酐", en: "Creatinine", unit: "mg/dL", refLow: 0.5, refHigh: 1.1 },
  { id: "ldh", abbr: "LDH", zh: "乳酸脫氫酶", en: "Lactate Dehydrogenase", unit: "U/L", refHigh: 240 },
];

export const MARKERS: MarkerDef[] = BUILT_IN_MARKERS.map((m) => ({ ...m, explanation: MARKER_EDUCATION[m.id].explanation }));

export const markerById = (id: string, markers = MARKERS) => markers.find((m) => m.id === id);

export function flagFor(r: LabResult, markers = MARKERS): Flag {
  const m = markerById(r.markerId, markers);
  const low = r.refLow ?? m?.refLow;
  const high = r.refHigh ?? m?.refHigh;
  if (low !== undefined && r.value < low) return "low";
  if (high !== undefined && r.value > high) return "high";
  return "normal";
}
