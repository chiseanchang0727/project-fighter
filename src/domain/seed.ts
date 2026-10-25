import type { Report } from "./types";

// First record shared by the user: 9/14 blood test.
export const SEED_REPORT: Report = {
  id: "seed-2026-09-14",
  date: "2026-09-14",
  note: "抽血當下有異位性皮膚炎，第一次化療（10/15）前已好轉。",
  updatedAt: Date.now(),
  results: [
    { markerId: "wbc", value: 7020 },
    { markerId: "anc", value: 4163 },
    { markerId: "lym", value: 26.9 },
    { markerId: "mono", value: 4.4 },
    { markerId: "eos", value: 8.4 },
    { markerId: "hgb", value: 13.4 },
    { markerId: "plt", value: 211000 },
    { markerId: "pt", value: 10.1 },
    { markerId: "ggt", value: 11 },
    { markerId: "crea", value: 0.88 },
    { markerId: "ldh", value: 254 },
  ],
};
