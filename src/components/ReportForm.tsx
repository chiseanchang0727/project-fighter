import { MarkerInfoButton } from "./MarkerInfoButton";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View, Pressable } from "react-native";
import type { MarkerDef, Report } from "../domain/types";
import { isValidDate, localToday } from "../domain/validate";
import type { Theme } from "../theme";

interface Props {
  initial?: Report;
  theme: Theme;
  onSubmit: (report: Report) => Promise<void>;
  onDelete?: () => void;
  markerIds?: string[];
  markerDefs: MarkerDef[];
}

const MAX_NOTE = 2000;

export function ReportForm({ initial, theme, onSubmit, onDelete, markerIds, markerDefs }: Props) {
  const markers = markerDefs.filter((m) => initial ? initial.results.some((r) => r.markerId === m.id) : !markerIds || markerIds.includes(m.id));
  const [date, setDate] = useState(initial?.date ?? localToday());
  const [note, setNote] = useState(initial?.note ?? "");
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries((initial?.results ?? []).map((r) => [r.markerId, String(r.value)])),
  );
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!isValidDate(date)) return Alert.alert("日期格式錯誤", "請輸入 YYYY-MM-DD，例如 2026-09-14");
    if (note.length > MAX_NOTE) return Alert.alert("備註太長", `最多 ${MAX_NOTE} 字`);

    const results = [];
    for (const m of markers) {
      const raw = (values[m.id] ?? "").trim();
      if (raw === "") continue;
      const v = Number(raw);
      if (!Number.isFinite(v)) return Alert.alert("數值錯誤", `${m.abbr} 必須是數字`);
      const original = initial?.results.find((r) => r.markerId === m.id);
      results.push({ ...original, markerId: m.id, value: v });
    }
    if (results.length === 0) return Alert.alert("沒有數值", "請至少填寫一項指標");

    setSaving(true);
    try {
      await onSubmit({
        id: initial?.id ?? newId(),
        date,
        note: note.trim(),
        results,
        // Timestamp is created by the Save event handler, never during render.
        // eslint-disable-next-line react-hooks/purity
        updatedAt: Date.now(),
      });
    } catch (e) {
      Alert.alert("儲存失敗", e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  const s = styles(theme);
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <Text style={s.label}>日期 Date</Text>
        <TextInput style={s.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={theme.muted} autoCapitalize="none" />

        {markers.map((m) => (
          <View key={m.id} style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>{m.abbr}</Text>
              <Text style={s.hint}>{m.zh} · {m.unit}</Text>
            </View>
            <MarkerInfoButton marker={m} />
            <TextInput
              style={[s.input, s.valueInput]}
              value={values[m.id] ?? ""}
              onChangeText={(t) => setValues((prev) => ({ ...prev, [m.id]: t.replace(",", ".") }))}
              keyboardType="decimal-pad"
              placeholder="—"
              placeholderTextColor={theme.muted}
            />
          </View>
        ))}

        <Text style={s.label}>備註 Note</Text>
        <TextInput style={[s.input, s.multiline]} value={note} onChangeText={setNote} multiline placeholder="例如：第一次化療 10/15" placeholderTextColor={theme.muted} />

        <Pressable onPress={() => { void save(); }} disabled={saving} style={({ pressed }) => [s.primary, (pressed || saving) && { opacity: 0.7 }]}>
          <Text style={s.primaryText}>儲存 Save</Text>
        </Pressable>
        {onDelete && (
          <Pressable onPress={onDelete} style={s.danger}>
            <Text style={s.dangerText}>刪除此紀錄 Delete</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const styles = (t: Theme) => StyleSheet.create({
  container: { padding: 16, paddingBottom: 48, gap: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 4 },
  label: { color: t.fg, fontWeight: "600", fontSize: 15, marginTop: 8 },
  hint: { color: t.muted, fontSize: 12 },
  input: {
    borderWidth: 1, borderColor: t.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    color: t.fg, backgroundColor: t.inputBg, fontSize: 16,
  },
  valueInput: { width: 120, textAlign: "right" },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  primary: { marginTop: 20, backgroundColor: t.accent, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  primaryText: { color: t.onAccent, fontWeight: "700", fontSize: 16 },
  danger: { marginTop: 12, paddingVertical: 14, alignItems: "center" },
  dangerText: { color: t.accent, fontWeight: "600" },
});
