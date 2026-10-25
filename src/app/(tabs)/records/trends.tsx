import { MarkerInfoButton } from "../../../components/MarkerInfoButton";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { formatValue } from "../../../domain/format";
import { useReports, useMarkers } from "../../../storage/hooks";
import { TrendChart } from "../../../components/TrendChart";
import { useTheme, type Theme } from "../../../theme";

export default function TrendsScreen() {
  const t = useTheme();
  const { reports, error } = useReports();
  const { markers, error: markerError } = useMarkers();
  const s = styles(t);

  if (error || markerError) return <Text style={{ color: t.accent, margin: 16 }}>{error ?? markerError}</Text>;
  if (reports === null || markers === null) return null;

  const cards = markers.flatMap((m) => {
    const points = reports.flatMap((r) => {
      const res = r.results.find((x) => x.markerId === m.id);
      return res ? [{ date: r.date, value: res.value }] : [];
    });
    if (points.length === 0) return [];
    const latest = [...points].sort((a, b) => b.date.localeCompare(a.date))[0];
    return [{ marker: m, points, latest }];
  });

  if (cards.length === 0) return <Text style={s.empty}>尚無數據 No data yet.</Text>;

  return (
    <FlatList
      data={cards}
      keyExtractor={(c) => c.marker.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item: { marker, points, latest } }) => (
        <View style={s.card}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={[s.title, { flex: 1 }]}>{marker.abbr} <Text style={s.sub}>{marker.zh} · {marker.unit}</Text></Text>
            <MarkerInfoButton marker={marker} />
          </View>
          <Text style={s.sub}>
            最新 Latest <Text style={s.latest}>{formatValue(latest.value)}</Text> ({latest.date})
            {marker.refLow !== undefined || marker.refHigh !== undefined ? `　參考 ${marker.refLow ?? "–"} – ${marker.refHigh ?? "–"}` : ""}
          </Text>
          <TrendChart points={points} refLow={marker.refLow} refHigh={marker.refHigh} theme={t} />
        </View>
      )}
    />
  );
}

const styles = (t: Theme) => StyleSheet.create({
  card: { backgroundColor: t.card, borderRadius: 14, borderWidth: 1, borderColor: t.border, padding: 14, gap: 8 },
  title: { color: t.fg, fontSize: 16, fontWeight: "700" },
  sub: { color: t.muted, fontSize: 13 },
  latest: { color: t.fg, fontWeight: "700" },
  empty: { color: t.muted, textAlign: "center", marginTop: 48 },
});
