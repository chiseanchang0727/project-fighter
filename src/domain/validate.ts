import { MARKERS } from "./markers";
import type { LabResult, MarkerDef, MarkerExplanation, Report } from "./types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDate(s: string): boolean {
  if (!DATE_RE.test(s)) return false;
  const d = new Date(`${s}T00:00:00`);
  const [year, month, day] = s.split("-").map(Number);
  return !Number.isNaN(d.getTime()) && d.getFullYear() === year && d.getMonth() + 1 === month && d.getDate() === day;
}

/** Local calendar date as YYYY-MM-DD (not UTC, so it matches what the user sees). */
export function localToday(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** Strictly validates an untrusted backup file. Throws with a readable message on bad input. */
export function parseBackup(raw: unknown, markers: MarkerDef[] = MARKERS): Report[] {
  const known = new Set(markers.map((m) => m.id));
  if (!Array.isArray(raw)) throw new Error("Backup must be a JSON array of reports.");
  return raw.map((r, i) => {
    const where = `report #${i + 1}`;
    if (typeof r !== "object" || r === null) throw new Error(`${where} is not an object.`);
    const o = r as Record<string, unknown>;
    if (typeof o.id !== "string" || o.id.length === 0) throw new Error(`${where} has no id.`);
    if (typeof o.date !== "string" || !isValidDate(o.date)) throw new Error(`${where} has an invalid date.`);
    if (typeof o.note !== "string") throw new Error(`${where} has an invalid note.`);
    if (!isNum(o.updatedAt)) throw new Error(`${where} has an invalid updatedAt.`);
    if (!Array.isArray(o.results)) throw new Error(`${where} has no results.`);
    const results: LabResult[] = o.results.map((x, j) => {
      const rw = `${where}, result #${j + 1}`;
      if (typeof x !== "object" || x === null) throw new Error(`${rw} is not an object.`);
      const q = x as Record<string, unknown>;
      if (typeof q.markerId !== "string" || !known.has(q.markerId)) throw new Error(`${rw} has an unknown marker.`);
      if (!isNum(q.value)) throw new Error(`${rw} has an invalid value.`);
      const out: LabResult = { markerId: q.markerId, value: q.value };
      if (q.refLow !== undefined && q.refLow !== null) {
        if (!isNum(q.refLow)) throw new Error(`${rw} has an invalid refLow.`);
        out.refLow = q.refLow;
      }
      if (q.refHigh !== undefined && q.refHigh !== null) {
        if (!isNum(q.refHigh)) throw new Error(`${rw} has an invalid refHigh.`);
        out.refHigh = q.refHigh;
      }
      return out;
    });
    return { id: o.id, date: o.date, note: o.note, updatedAt: o.updatedAt, results };
  });
}

/** Custom definitions travel with backups so results remain readable on another device. */
export function parseCustomMarkers(raw: unknown): MarkerDef[] {
  if (!Array.isArray(raw)) throw new Error("Custom markers must be an array.");
  const ids = new Set(MARKERS.map((m) => m.id));
  return raw.map((value) => {
    if (!value || typeof value !== "object") throw new Error("Invalid custom marker.");
    const m = value as Record<string, unknown>;
    if (typeof m.id !== "string" || !/^custom-[a-zA-Z0-9-]+$/.test(m.id) || ids.has(m.id)) throw new Error("Invalid or duplicate marker id.");
    ids.add(m.id);
    for (const key of ["abbr", "zh", "en", "unit"]) {
      if (typeof m[key] !== "string" || (m[key] as string).length > 100) throw new Error(`Invalid marker ${key}.`);
    }
    if (!(m.abbr as string).trim() || !(m.zh as string).trim()) throw new Error("Name and abbreviation are required.");
    for (const key of ["refLow", "refHigh"]) {
      if (m[key] !== undefined && !isNum(m[key])) throw new Error("Reference limits must be finite numbers.");
    }
    if (isNum(m.refLow) && isNum(m.refHigh) && m.refLow > m.refHigh) throw new Error("Reference minimum must not exceed maximum.");
    return { id: m.id, abbr: (m.abbr as string).trim(), zh: (m.zh as string).trim(), en: (m.en as string).trim(), unit: (m.unit as string).trim(),
      ...(m.refLow !== undefined ? { refLow: m.refLow as number } : {}),
      ...(m.refHigh !== undefined ? { refHigh: m.refHigh as number } : {}),
      ...(m.explanation !== undefined ? { explanation: parseExplanation(m.explanation) } : {}) };
  });
}

export function parseExplanation(raw: unknown): MarkerExplanation {
  if (!raw || typeof raw !== "object") throw new Error("Invalid marker explanation.");
  const fields = raw as Record<string, unknown>;
  for (const key of ["definition", "low", "high"]) {
    if (typeof fields[key] !== "string" || (fields[key] as string).length > 4000) {
      throw new Error("Each explanation must be text of at most 4,000 characters.");
    }
  }
  const parsed: MarkerExplanation = { definition: (fields.definition as string).trim(), low: (fields.low as string).trim(), high: (fields.high as string).trim() };
  if (fields.translations !== undefined) {
    if (!fields.translations || typeof fields.translations !== "object" || Array.isArray(fields.translations)) throw new Error("Invalid explanation translations.");
    const translations = fields.translations as Record<string, unknown>;
    parsed.translations = {};
    for (const language of ["en", "zh"] as const) {
      if (translations[language] !== undefined) {
        const entry = translations[language];
        if (!entry || typeof entry !== "object" || "translations" in entry) throw new Error("Invalid explanation translation.");
        parsed.translations[language] = parseExplanation(entry);
      }
    }
  }
  return parsed;
}

export function parseMarkerExplanations(raw: unknown, markers: MarkerDef[]): { markerId: string; explanation: MarkerExplanation }[] {
  if (!Array.isArray(raw)) throw new Error("Marker explanations must be an array.");
  const ids = new Set<string>();
  return raw.map((entry) => {
    if (!entry || typeof entry !== "object" || typeof entry.markerId !== "string" || !markers.some((m) => m.id === entry.markerId) || ids.has(entry.markerId)) {
      throw new Error("Unknown or duplicate marker explanation.");
    }
    ids.add(entry.markerId);
    return { markerId: entry.markerId, explanation: parseExplanation(entry.explanation) };
  });
}
