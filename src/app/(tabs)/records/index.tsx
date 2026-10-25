import { MarkerInfoButton } from "../../../components/MarkerInfoButton";
import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { markerById, flagFor } from "../../../domain/markers";
import { FLAG_LABEL, formatValue } from "../../../domain/format";
import type { MarkerDef, Report } from "../../../domain/types";
import { useReports, useMarkers } from "../../../storage/hooks";
import { useTheme, type Theme } from "../../../theme";

export default function RecordsScreen() {
  const t = useTheme();
  const { reports, error } = useReports();
  const { markers, error: markerError } = useMarkers();
  const s = styles(t);

  if (error || markerError) return <Text style={s.error}>讀取失敗 Failed to load: {error ?? markerError}</Text>;
  if (reports === null || markers === null) return null;

  return (
    <View style={{ flex: 1 }}>
      <Pressable onPress={() => router.push("/report/new")} style={({ pressed }) => [s.add, pressed && { opacity: 0.8 }]}>
        <Text style={s.addText}>＋ 新增紀錄 Add record</Text>
      </Pressable>
      {reports.length === 0 ? (
        <Text style={s.empty}>尚無紀錄 No records yet.</Text>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingTop: 0 }}
          renderItem={({ item }) => <ReportCard report={item} theme={t} markers={markers} />}
        />
      )}
    </View>
  );
}

function ReportCard({ report, theme, markers }: { report: Report; theme: Theme; markers: MarkerDef[] }) {
  const s = styles(theme);
  const sorted = [...report.results].sort(
    (a, b) => markers.findIndex((m) => m.id === a.markerId) - markers.findIndex((m) => m.id === b.markerId),
  );
  return (
    <Pressable onPress={() => router.push(`/report/${report.id}`)} style={({ pressed }) => [s.card, pressed && { opacity: 0.8 }]}>
      <View style={s.cardHeader}>
        <Text style={s.date}>{report.date}</Text>
        <Text style={s.link}>編輯 Edit ›</Text>
      </View>
      {report.note !== "" && <Text style={s.note}>{report.note}</Text>}
      {sorted.map((r) => {
        const flag = flagFor(r, markers);
        const abnormal = flag !== "normal";
        const marker = markerById(r.markerId, markers);
        return (
          <View key={r.markerId} style={s.resultRow}>
            <Text style={[s.resultName, abnormal && { color: theme.accent, fontWeight: "700" }]}>
              {markerById(r.markerId, markers)?.abbr}
            </Text>
            {marker && <MarkerInfoButton marker={marker} result={r} />}
            <Text style={[s.resultValue, abnormal && { color: theme.accent, fontWeight: "700" }]}>
              {formatValue(r.value)} <Text style={s.unit}>{markerById(r.markerId, markers)?.unit}</Text>
            </Text>
            <Text style={[s.flag, abnormal && { color: theme.accent }]}>{abnormal ? FLAG_LABEL[flag] : ""}</Text>
          </View>
        );
      })}
    </Pressable>
  );
}

const styles = (t: Theme) => StyleSheet.create({
  add: { margin: 16, backgroundColor: t.accent, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  addText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  empty: { color: t.muted, textAlign: "center", marginTop: 48 },
  error: { color: t.accent, margin: 16 },
  card: { backgroundColor: t.card, borderRadius: 14, borderWidth: 1, borderColor: t.border, padding: 14, gap: 6 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  date: { color: t.fg, fontSize: 17, fontWeight: "700" },
  link: { color: t.muted, fontSize: 13 },
  note: { color: t.muted, fontSize: 13 },
  resultRow: { flexDirection: "row", alignItems: "center", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border, paddingVertical: 4 },
  resultName: { width: 56, color: t.fg, fontSize: 14 },
  resultValue: { flex: 1, color: t.fg, fontSize: 14, textAlign: "right" },
  unit: { color: t.muted, fontSize: 12 },
  flag: { width: 84, textAlign: "right", fontSize: 12, color: t.accent },
});
