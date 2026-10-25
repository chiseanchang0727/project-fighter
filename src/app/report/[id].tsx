import { router, useLocalSearchParams } from "expo-router";
import { Alert, Text } from "react-native";
import { useEffect, useState } from "react";
import { ReportForm } from "../../components/ReportForm";
import type { Report } from "../../domain/types";
import { useRepo, useMarkers } from "../../storage/hooks";
import { useTheme } from "../../theme";

export default function EditReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const repo = useRepo();
  const { markers, error } = useMarkers();
  const [report, setReport] = useState<Report | null | undefined>(undefined);

  useEffect(() => {
    repo.getReport(id).then(setReport).catch(() => setReport(null));
  }, [id, repo]);

  if (error) return <Text style={{ color: t.accent, margin: 16 }}>{error}</Text>;
  if (report === undefined || markers === null) return null;
  if (report === null) return <Text style={{ color: t.accent, margin: 16 }}>找不到此紀錄 Record not found.</Text>;

  return (
    <ReportForm
      markerDefs={markers}
      initial={report}
      theme={t}
      onSubmit={async (updated) => {
        await repo.saveReport(updated);
        router.back();
      }}
      onDelete={() =>
        Alert.alert("刪除紀錄？", "此操作無法復原 This cannot be undone.", [
          { text: "取消 Cancel", style: "cancel" },
          {
            text: "刪除 Delete",
            style: "destructive",
            onPress: async () => {
              await repo.deleteReport(report.id);
              router.back();
            },
          },
        ])
      }
    />
  );
}
