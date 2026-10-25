import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import type { MarkerDef } from "../../domain/types";
import { AddMarkerForm } from "../../components/AddMarkerForm";
import { useRepo } from "../../storage/hooks";
import { useTheme } from "../../theme";

export default function TemplateScreen() {
  const t = useTheme();
  const repo = useRepo();
  const [ids, setIds] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [markers, setMarkers] = useState<MarkerDef[]>([]);
  const [adding, setAdding] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    Promise.all([repo.getTemplate(), repo.listMarkers()]).then(([value, defs]) => {
      if (active) { setIds((current) => current ?? value); setMarkers(defs); setError(null); }
    }).catch((e) => {
      if (active) setError(e instanceof Error ? e.message : String(e));
    });
    return () => { active = false; };
  }, [repo]));

  async function save() {
    if (!ids || saving) return;
    setSaving(true);
    try {
      await repo.saveTemplate(ids);
      Alert.alert("已儲存 Saved", "下一筆新紀錄會使用此範本。New records will use this template.");
    } catch (e) {
      Alert.alert("儲存失敗 Save failed", e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  if (error) return <Text style={{ color: t.accent, margin: 16 }}>讀取失敗 Failed to load: {error}</Text>;
  if (ids === null) return <Text style={{ color: t.muted, margin: 16 }}>載入中 Loading…</Text>;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <Text style={{ color: t.fg, fontSize: 20, fontWeight: "700" }}>紀錄範本 Record template</Text>
      <Text style={{ color: t.muted, lineHeight: 21 }}>
        選擇新增紀錄時要填寫的指標，儲存後套用至下一筆新紀錄。既有紀錄不受影響。
        {"\n"}Choose the markers for new records, then save. Existing records keep their fields.
      </Text>
      {adding ? <AddMarkerForm theme={t} onCancel={() => setAdding(false)} onAdded={(marker) => {
        setMarkers((current) => [...current, marker]);
        setIds((current) => [...(current ?? []), marker.id]);
        setAdding(false);
      }} /> : <Pressable accessibilityRole="button" disabled={saving} onPress={() => setAdding(true)} style={[s.save, { borderWidth: 1, borderColor: t.accent }]}>
        <Text style={{ color: t.accent, fontWeight: "700" }}>＋ 新增指標 Add marker</Text>
      </Pressable>}
      <Text style={{ color: t.muted }}>已選 {ids.length} / {markers.length} selected</Text>
      {markers.map((m) => (
        <View key={m.id} style={[s.row, { backgroundColor: t.card, borderColor: t.border }]}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: t.fg, fontWeight: "600", fontSize: 16 }}>{m.abbr} · {m.zh}</Text>
            <Text style={{ color: t.muted, fontSize: 12 }}>{[m.en, m.unit].filter(Boolean).join(" · ")}</Text>

          </View>
          <Switch
            accessibilityLabel={`${m.abbr} ${m.zh}`}
            value={ids.includes(m.id)}
            disabled={saving}
            trackColor={{ true: t.accent }}
            onValueChange={(enabled) => setIds((current) => enabled ? [...(current ?? []), m.id] : (current ?? []).filter((id) => id !== m.id))}
          />
        </View>
      ))}
      {ids.length === 0 && <Text style={{ color: t.accent }}>請至少選擇一項指標 Select at least one marker.</Text>}
      <Pressable accessibilityRole="button" disabled={saving || adding || ids.length === 0} onPress={save}
        style={({ pressed }) => [s.save, { backgroundColor: t.accent, opacity: saving || ids.length === 0 || pressed ? 0.6 : 1 }]}>
        <Text style={{ color: t.onAccent, fontSize: 16, fontWeight: "700" }}>{saving ? "儲存中 Saving…" : "儲存範本 Save template"}</Text>
      </Pressable>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48, gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderWidth: 1, borderRadius: 12 },
  save: { padding: 16, borderRadius: 12, alignItems: "center", marginTop: 8 },
});
