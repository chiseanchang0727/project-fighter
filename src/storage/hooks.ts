import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useMemo, useState } from "react";
import type { MarkerDef, Report } from "../domain/types";
import { createRepository } from "./index";
import type { Repository } from "./repository";

export function useRepo(): Repository {
  const db = useSQLiteContext();
  return useMemo(() => createRepository(db), [db]);
}

/** Loads reports and reloads every time the screen regains focus. */
export function useReports() {
  const repo = useRepo();
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setReports(await repo.listReports());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [repo]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { reports, error, reload };
}

/** Refresh the marker catalog after adding or importing custom markers. */
export function useMarkers() {
  const repo = useRepo();
  const [markers, setMarkers] = useState<MarkerDef[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useFocusEffect(useCallback(() => {
    let active = true;
    repo.listMarkers().then((value) => {
      if (active) { setMarkers(value); setError(null); }
    }).catch((e) => { if (active) setError(e instanceof Error ? e.message : String(e)); });
    return () => { active = false; };
  }, [repo]));
  return { markers, error };
}
