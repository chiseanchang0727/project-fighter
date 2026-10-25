import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { MarkerDef } from "../domain/types";
import { useRepo } from "../storage/hooks";
import type { Theme } from "../theme";

export function AddMarkerForm({ theme: t, onAdded, onCancel }: {
  theme: Theme; onAdded: (marker: MarkerDef) => void; onCancel: () => void;
}) {
  const repo = useRepo();
  const [name, setName] = useState("");
  const [abbr, setAbbr] = useState("");
  const [unit, setUnit] = useState("");
  const [low, setLow] = useState("");
  const [high, setHigh] = useState("");
  const [saving, setSaving] = useState(false);

  async function add() {
    if (saving) return;
    setSaving(true);
    try {
      const marker: MarkerDef = {
        id: `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
        abbr: abbr.trim(), zh: name.trim(), en: "", unit: unit.trim(),
        ...(low.trim() ? { refLow: Number(low.trim().replace(",", ".")) } : {}),
        ...(high.trim() ? { refHigh: Number(high.trim().replace(",", ".")) } : {}),
      };
      await repo.addMarker(marker);
      onAdded(marker);
    } catch (e) {
      Alert.alert("新增失敗 Add failed", e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[s.form, { backgroundColor: t.card, borderColor: t.border }]}>
      <Text style={{ color: t.fg, fontSize: 18, fontWeight: "700" }}>新增指標 Add marker</Text>
      {[
        { label: "名稱 Name *", value: name, change: setName },
        { label: "縮寫 Abbreviation *", value: abbr, change: setAbbr },
        { label: "單位 Unit (optional)", value: unit, change: setUnit },
        { label: "參考下限 Minimum (optional)", value: low, change: setLow, numeric: true },
        { label: "參考上限 Maximum (optional)", value: high, change: setHigh, numeric: true },
      ].map((field) => (
        <View key={field.label} style={{ gap: 6 }}>
          <Text style={{ color: t.fg }}>{field.label}</Text>
          <TextInput accessibilityLabel={field.label} value={field.value} onChangeText={field.change}
            editable={!saving} maxLength={100} autoCorrect={false}
            keyboardType={field.numeric ? "numbers-and-punctuation" : "default"}
            style={[s.input, { color: t.fg, borderColor: t.border, backgroundColor: t.inputBg }]} />
        </View>
      ))}
      <Text style={{ color: t.muted }}>新增後請儲存範本以套用。Save the template after adding the marker.</Text>
      <Pressable accessibilityRole="button" disabled={saving} onPress={() => { void add(); }} style={[s.button, { backgroundColor: t.accent, opacity: saving ? 0.6 : 1 }]}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>{saving ? "新增中 Adding…" : "新增指標 Add marker"}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" disabled={saving} onPress={onCancel} style={s.button}>
        <Text style={{ color: t.muted }}>取消 Cancel</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  form: { padding: 16, borderWidth: 1, borderRadius: 12, gap: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  button: { minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 8 },
});
