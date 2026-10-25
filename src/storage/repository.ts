import type { MarkerDef, MarkerExplanation, Report } from "../domain/types";

/**
 * The only persistence contract the UI knows about. To move to another backend
 * (REST API, Supabase, Firebase, ...), implement this interface and change
 * `createRepository` in `src/storage/index.ts`.
 */
export interface Repository {
  listMarkers(): Promise<MarkerDef[]>;
  addMarker(marker: MarkerDef): Promise<void>;
  saveMarkerExplanation(markerId: string, explanation: MarkerExplanation): Promise<void>;
  getTemplate(): Promise<string[]>;
  saveTemplate(markerIds: string[]): Promise<void>;
  /** All reports with their results, newest date first. */
  listReports(): Promise<Report[]>;
  getReport(id: string): Promise<Report | null>;
  /** Insert or update a report and replace its results, atomically. */
  saveReport(report: Report): Promise<void>;
  deleteReport(id: string): Promise<void>;
  /** Insert or update many reports in one atomic operation (used by backup import). */
  importReports(reports: Report[], customMarkers?: MarkerDef[], explanations?: { markerId: string; explanation: MarkerExplanation }[]): Promise<void>;
}
