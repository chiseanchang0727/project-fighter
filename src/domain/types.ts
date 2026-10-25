export interface ExplanationText {
  definition: string;
  low: string;
  high: string;
}

export type ExplanationLanguage = "en" | "zh";

export interface MarkerExplanation extends ExplanationText {
  translations?: Partial<Record<ExplanationLanguage, ExplanationText>>;
}

export interface MarkerDef {
  id: string;
  abbr: string;
  zh: string;
  en: string;
  unit: string;
  /** Default reference range; hospitals differ, so a result may override it. */
  refLow?: number;
  refHigh?: number;
  hint?: { zh: string; en: string };
  explanation?: MarkerExplanation;
}

export interface LabResult {
  markerId: string;
  value: number;
  refLow?: number;
  refHigh?: number;
}

export interface Report {
  id: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  note: string;
  results: LabResult[];
  updatedAt: number;
}

export type Flag = "low" | "normal" | "high";
