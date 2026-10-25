import type { SQLiteDatabase } from "expo-sqlite";
import type { LabResult, MarkerDef, MarkerExplanation, Report } from "../domain/types";
import { parseCustomMarkers, parseExplanation, parseMarkerExplanations } from "../domain/validate";
import type { Repository } from "./repository";
import { MARKERS } from "../domain/markers";

const LATEST_VERSION = 4;

/**
 * Applies schema migrations using PRAGMA user_version.
 * Returns true when the database was just created (fresh install).
 */
export async function migrate(db: SQLiteDatabase): Promise<boolean> {
  await db.execAsync("PRAGMA foreign_keys = ON;");
  const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const current = row?.user_version ?? 0;
  if (current >= LATEST_VERSION) return false;

  await db.withTransactionAsync(async () => {
    if (current < 1) {
      await db.execAsync(`
        CREATE TABLE reports (
          id TEXT PRIMARY KEY NOT NULL,
          date TEXT NOT NULL,
          note TEXT NOT NULL DEFAULT '',
          updated_at INTEGER NOT NULL
        );
        CREATE INDEX reports_by_date ON reports(date);
        CREATE TABLE results (
          report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
          marker_id TEXT NOT NULL,
          value REAL NOT NULL,
          ref_low REAL,
          ref_high REAL,
          PRIMARY KEY (report_id, marker_id)
        );
      `);
    }
    if (current < 2) {
      await db.execAsync("CREATE TABLE record_template (id INTEGER PRIMARY KEY CHECK (id = 1), marker_ids TEXT NOT NULL)");
      await db.runAsync("INSERT INTO record_template (id, marker_ids) VALUES (1, ?)", JSON.stringify(MARKERS.map((m) => m.id)));
    }
    if (current < 3) {
      await db.execAsync("CREATE TABLE custom_markers (id TEXT PRIMARY KEY NOT NULL, definition TEXT NOT NULL)");
    }
    if (current < 4) {
      await db.execAsync("CREATE TABLE marker_explanations (marker_id TEXT PRIMARY KEY NOT NULL, explanation TEXT NOT NULL)");
    }
    await db.execAsync(`PRAGMA user_version = ${LATEST_VERSION}`);
  });
  return current === 0;
}

interface ReportRow { id: string; date: string; note: string; updated_at: number }
interface ResultRow { report_id: string; marker_id: string; value: number; ref_low: number | null; ref_high: number | null }

function toResult(r: ResultRow): LabResult {
  const out: LabResult = { markerId: r.marker_id, value: r.value };
  if (r.ref_low !== null) out.refLow = r.ref_low;
  if (r.ref_high !== null) out.refHigh = r.ref_high;
  return out;
}

function toReport(r: ReportRow, results: ResultRow[]): Report {
  return {
    id: r.id,
    date: r.date,
    note: r.note,
    updatedAt: r.updated_at,
    results: results.map(toResult),
  };
}

export class SQLiteRepository implements Repository {
  constructor(private readonly db: SQLiteDatabase) {}

  async listMarkers(): Promise<MarkerDef[]> {
    const rows = await this.db.getAllAsync<{ definition: string }>("SELECT definition FROM custom_markers ORDER BY rowid");
    const notes = await this.db.getAllAsync<{ marker_id: string; explanation: string }>("SELECT * FROM marker_explanations");
    const byId = new Map(notes.map((n) => [n.marker_id, JSON.parse(n.explanation) as MarkerExplanation]));
    return [...MARKERS, ...rows.map((r) => JSON.parse(r.definition) as MarkerDef)].map((m) =>
      byId.has(m.id) ? { ...m, explanation: byId.get(m.id) } : m);
  }

  async saveMarkerExplanation(markerId: string, explanation: MarkerExplanation): Promise<void> {
    const validated = parseExplanation(explanation);
    if (!(await this.listMarkers()).some((m) => m.id === markerId)) throw new Error("Marker not found.");
    await this.writeExplanation(markerId, validated);
  }

  private async writeExplanation(markerId: string, explanation: MarkerExplanation): Promise<void> {
    await this.db.runAsync("INSERT INTO marker_explanations (marker_id, explanation) VALUES (?, ?) ON CONFLICT(marker_id) DO UPDATE SET explanation = excluded.explanation", markerId, JSON.stringify(explanation));
  }

  async addMarker(marker: MarkerDef): Promise<void> {
    const [validated] = parseCustomMarkers([marker]);
    const existing = await this.listMarkers();
    if (existing.some((m) => m.id === validated.id || m.abbr.toLowerCase() === validated.abbr.toLowerCase())) {
      throw new Error("此縮寫已存在 A marker with this abbreviation already exists.");
    }
    await this.db.runAsync("INSERT INTO custom_markers (id, definition) VALUES (?, ?)", validated.id, JSON.stringify(validated));
  }

  async getTemplate(): Promise<string[]> {
    const row = await this.db.getFirstAsync<{ marker_ids: string }>("SELECT marker_ids FROM record_template WHERE id = 1");
    if (!row) throw new Error("Record template is missing.");
    return JSON.parse(row.marker_ids);
  }

  async saveTemplate(markerIds: string[]): Promise<void> {
    const ids = (await this.listMarkers()).filter((m) => markerIds.includes(m.id)).map((m) => m.id);
    if (ids.length === 0) throw new Error("請至少選擇一項指標 Select at least one marker.");
    await this.db.runAsync("UPDATE record_template SET marker_ids = ? WHERE id = 1", JSON.stringify(ids));
  }

  async listReports(): Promise<Report[]> {
    const reports = await this.db.getAllAsync<ReportRow>(
      "SELECT id, date, note, updated_at FROM reports ORDER BY date DESC, updated_at DESC",
    );
    const results = await this.db.getAllAsync<ResultRow>("SELECT * FROM results");
    const byReport = new Map<string, ResultRow[]>();
    for (const r of results) {
      const list = byReport.get(r.report_id) ?? [];
      list.push(r);
      byReport.set(r.report_id, list);
    }
    return reports.map((r) => toReport(r, byReport.get(r.id) ?? []));
  }

  async getReport(id: string): Promise<Report | null> {
    const row = await this.db.getFirstAsync<ReportRow>(
      "SELECT id, date, note, updated_at FROM reports WHERE id = ?",
      id,
    );
    if (!row) return null;
    const results = await this.db.getAllAsync<ResultRow>("SELECT * FROM results WHERE report_id = ?", id);
    return toReport(row, results);
  }

  async saveReport(report: Report): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      await this.upsert(report);
    });
  }

  async deleteReport(id: string): Promise<void> {
    // results are removed by ON DELETE CASCADE (foreign_keys is ON)
    await this.db.runAsync("DELETE FROM reports WHERE id = ?", id);
  }

  async importReports(reports: Report[], customMarkers: MarkerDef[] = [], explanations: { markerId: string; explanation: MarkerExplanation }[] = []): Promise<void> {
    const validated = parseCustomMarkers(customMarkers);
    await this.db.withTransactionAsync(async () => {
      const existing = await this.listMarkers();
      for (const marker of validated) {
        const match = existing.find((m) => m.id === marker.id);
        if (match) {
          if (["abbr", "zh", "en", "unit", "refLow", "refHigh"].some((key) => match[key as keyof MarkerDef] !== marker[key as keyof MarkerDef])) {
            throw new Error(`Conflicting marker definition: ${marker.abbr}`);
          }
        } else {
          await this.db.runAsync("INSERT INTO custom_markers (id, definition) VALUES (?, ?)", marker.id, JSON.stringify(marker));
        }
      }
      const notes = parseMarkerExplanations(explanations, await this.listMarkers());
      for (const marker of validated) {
        if (marker.explanation) await this.writeExplanation(marker.id, marker.explanation);
      }
      for (const note of notes) await this.writeExplanation(note.markerId, note.explanation);
      for (const r of reports) await this.upsert(r);
    });
  }

  /** Must run inside a transaction. */
  private async upsert(report: Report): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO reports (id, date, note, updated_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET date = excluded.date, note = excluded.note, updated_at = excluded.updated_at`,
      report.id, report.date, report.note, report.updatedAt,
    );
    await this.db.runAsync("DELETE FROM results WHERE report_id = ?", report.id);
    for (const r of report.results) {
      await this.db.runAsync(
        "INSERT INTO results (report_id, marker_id, value, ref_low, ref_high) VALUES (?, ?, ?, ?, ?)",
        report.id, r.markerId, r.value, r.refLow ?? null, r.refHigh ?? null,
      );
    }
  }
}
