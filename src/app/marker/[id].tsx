import { useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { ExplanationFields, EMPTY_EXPLANATION } from "../../components/ExplanationFields";
import { ExplanationLanguageSwitch } from "../../components/ExplanationLanguageSwitch";
import { explanationIn, EXPLANATION_LABELS } from "../../domain/explanation-language";
import { formatValue } from "../../domain/format";
import { flagFor } from "../../domain/markers";
import { MARKER_EDUCATION } from "../../domain/marker-education";
import type { ExplanationLanguage, MarkerDef, MarkerExplanation } from "../../domain/types";
import { useRepo } from "../../storage/hooks";
import { useTheme } from "../../theme";

export default function MarkerScreen() {
  const params = useLocalSearchParams<{ id: string; edit?: string; value?: string; refLow?: string; refHigh?: string; language?: string }>();
  const repo = useRepo();
  const t = useTheme();
  const [marker, setMarker] = useState<MarkerDef | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<MarkerExplanation>(EMPTY_EXPLANATION);
  const [editing, setEditing] = useState(params.edit === "true");
  const [language, setLanguage] = useState<ExplanationLanguage>(params.language === "en" ? "en" : "zh");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    repo.listMarkers().then((markers) => {
      if (!active) return;
      const found = markers.find((m) => m.id === params.id);
      if (!found) { setError("找不到指標 Marker not found."); return; }
      setMarker(found);
      setDraft(found.explanation ?? EMPTY_EXPLANATION);
    }).catch((e) => { if (active) setError(e instanceof Error ? e.message : String(e)); });
    return () => { active = false; };
  }, [repo, params.id]);

  async function save() {
    if (!marker || saving) return;
    setSaving(true);
    try {
      await repo.saveMarkerExplanation(marker.id, draft);
      setMarker({ ...marker, explanation: draft });
      setEditing(false);
    } catch (e) {
      Alert.alert("儲存失敗 Save failed", e instanceof Error ? e.message : String(e));
    } finally { setSaving(false); }
  }

  if (error) return <Text style={{ color: t.accent, margin: 16 }}>{error}</Text>;
  if (!marker) return <Text style={{ color: t.muted, margin: 16 }}>載入中 Loading…</Text>;
  const parseNumber = (value: string | undefined) => value !== undefined && value !== "" && Number.isFinite(Number(value)) ? Number(value) : undefined;
  const value = parseNumber(params.value);
  const low = params.refLow !== undefined ? parseNumber(params.refLow) : marker.refLow;
  const high = params.refHigh !== undefined ? parseNumber(params.refHigh) : marker.refHigh;
  const flag = value !== undefined ? flagFor({ markerId: marker.id, value, refLow: low, refHigh: high }, [marker]) : null;
  const education = MARKER_EDUCATION[marker.id];
  const localized = explanationIn(marker.explanation, language);
  const usesDefault = education && JSON.stringify(localized) === JSON.stringify(explanationIn(education.explanation, language));
  const zh = language === "zh";
  const button = { minHeight: 48, padding: 14, borderRadius: 10, alignItems: "center" as const };
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48, gap: 18 }} keyboardShouldPersistTaps="handled">
      <ExplanationLanguageSwitch value={language} onChange={setLanguage} theme={t} />
      <Text style={{ color: t.fg, fontSize: 26, fontWeight: "700" }}>{marker.abbr}</Text>
      <Text style={{ color: t.muted }}>{zh ? marker.zh : marker.en || marker.abbr}</Text>
      <View style={{ padding: 16, borderRadius: 12, backgroundColor: t.card, gap: 10 }}>
        {value !== undefined && <Text style={{ color: t.fg, fontSize: 20, fontWeight: "600" }}>{formatValue(value)} {marker.unit} · {flag && (zh ? { low: "偏低", normal: "正常", high: "偏高" }[flag] : { low: "Low", normal: "Normal", high: "High" }[flag])}</Text>}
        <Text style={{ color: t.muted }}>{zh ? "參考範圍" : "Reference range"}: {low ?? "–"} – {high ?? "–"} {marker.unit}</Text>
      </View>
      {editing ? <>
        <ExplanationFields value={draft} onChange={setDraft} theme={t} disabled={saving} language={language} />
        <Pressable accessibilityRole="button" disabled={saving} onPress={() => { void save(); }} style={[button, { backgroundColor: t.accent }]}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>{saving ? (zh ? "儲存中…" : "Saving…") : (zh ? "儲存說明" : "Save explanations")}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" disabled={saving} onPress={() => { setDraft(marker.explanation ?? EMPTY_EXPLANATION); setEditing(false); }} style={button}>
          <Text style={{ color: t.muted }}>{zh ? "取消" : "Cancel"}</Text>
        </Pressable>
      </> : <>
        {(["definition", "low", "high"] as const).map((key) => <View key={key} style={{ gap: 8 }}>
          <Text style={{ color: flag === key ? t.accent : t.fg, fontSize: 17, fontWeight: "700" }}>{EXPLANATION_LABELS[language][key]}</Text>
          <Text selectable style={{ color: t.fg, fontSize: 16, lineHeight: 25 }}>{localized[key] || (zh ? "尚未加入中文說明，可編輯補充。" : "No English explanation yet. Edit to add one.")}</Text>
        </View>)}
        <Pressable accessibilityRole="button" onPress={() => setEditing(true)} style={[button, { borderWidth: 1, borderColor: t.accent }]}>
          <Text style={{ color: t.accent }}>{zh ? "編輯說明" : "Edit explanations"}</Text>
        </Pressable>
      </>}
      {!editing && usesDefault && <View style={{ gap: 8 }}>
        <Text style={{ color: t.muted }}>{zh ? "預設衛教說明 · 來源核對日期 2026-10-25" : "Default educational summary · Sources checked 2026-10-25"}</Text>
        {education.sources.map((source) => <Pressable key={source.url} accessibilityRole="link" onPress={() => {
          Linking.openURL(source.url).catch(() => Alert.alert("無法開啟連結", "Could not open the source link."));
        }} style={{ minHeight: 44, justifyContent: "center" }}>
          <Text style={{ color: t.accent }}>{source.title} ↗</Text>
        </Pressable>)}
      </View>}
      <Text style={{ color: t.muted, lineHeight: 21 }}>{zh ? `${usesDefault ? "一般衛教資訊" : "自訂筆記"}，非醫療診斷。請依檢驗單的參考範圍與醫師說明判讀；正常範圍內也不代表一定沒有疾病。` : `${usesDefault ? "General education" : "Personal notes"}, not a diagnosis. Use your lab’s reference range and your clinician’s interpretation. An in-range result does not rule out illness.`}</Text>
    </ScrollView>
  </KeyboardAvoidingView>;
}
