import { router } from "expo-router";
import { ReportForm } from "../../components/ReportForm";
import { useRepo } from "../../storage/hooks";
import { useTheme } from "../../theme";
import { useEffect, useState } from "react";
import type { MarkerDef } from "../../domain/types";
import { Text } from "react-native";

export default function NewReportScreen() {
  const t = useTheme();
  const repo = useRepo();
  const [markerIds, setMarkerIds] = useState<string[] | null>(null);
  const [markers, setMarkers] = useState<MarkerDef[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    Promise.all([repo.getTemplate(), repo.listMarkers()]).then(([ids, defs]) => { if (active) { setMarkerIds(ids); setMarkers(defs); } }).catch((e) => {
      if (active) setError(e instanceof Error ? e.message : String(e));
    });
    return () => { active = false; };
  }, [repo]);
  if (error) return <Text style={{ color: t.accent, margin: 16 }}>讀取失敗 Failed to load: {error}</Text>;
  if (markerIds === null || markers === null) return <Text style={{ color: t.muted, margin: 16 }}>載入中 Loading…</Text>;
  return (
    <ReportForm
      markerDefs={markers}
      markerIds={markerIds}
      theme={t}
      onSubmit={async (report) => {
        await repo.saveReport(report);
        router.back();
      }}
    />
  );
}
