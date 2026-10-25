import { useState } from "react";
import { router } from "expo-router";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { ExplanationLanguageSwitch } from "../../components/ExplanationLanguageSwitch";
import { explanationIn } from "../../domain/explanation-language";
import type { ExplanationLanguage } from "../../domain/types";
import { useMarkers } from "../../storage/hooks";
import { useTheme } from "../../theme";

export default function DefinitionsScreen() {
  const t = useTheme();
  const { markers, error } = useMarkers();
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<ExplanationLanguage>("zh");
  const zh = language === "zh";
  const needle = query.trim().toLowerCase();
  if (error) return <Text style={{ color: t.accent, margin: 16 }}>{error}</Text>;
  return <View style={{ flex: 1, backgroundColor: t.bg }}>
    <View style={{ padding: 16, gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Text style={{ color: t.fg, fontSize: 22, fontWeight: "700", flex: 1 }}>{zh ? "指標說明" : "Definitions"}</Text>
        <ExplanationLanguageSwitch value={language} onChange={setLanguage} theme={t} />
      </View>
      <Text style={{ color: t.muted }}>{zh ? "了解各項指標的定義與數值意義，點選即可閱讀或編輯。" : "Learn what each marker measures and what values may mean. Tap to read or edit."}</Text>
      <TextInput accessibilityLabel={zh ? "搜尋指標" : "Search markers"} placeholder={zh ? "搜尋名稱或縮寫" : "Search name or abbreviation"}
        placeholderTextColor={t.muted} value={query} onChangeText={setQuery} autoCorrect={false}
        style={{ color: t.fg, backgroundColor: t.inputBg, borderColor: t.border, borderWidth: 1, padding: 12, borderRadius: 10, fontSize: 16 }} />
    </View>
    <FlatList data={(markers ?? []).filter((m) => [m.abbr, m.zh, m.en].some((name) => name.toLowerCase().includes(needle)))}
      keyExtractor={(m) => m.id} contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 12 }} keyboardShouldPersistTaps="handled"
      ListEmptyComponent={<Text style={{ color: t.muted }}>{!markers ? (zh ? "載入中…" : "Loading…") : (zh ? "找不到指標" : "No matching markers")}</Text>}
      renderItem={({ item }) => <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: "/marker/[id]", params: { id: item.id, language } })}
        style={({ pressed }) => ({ padding: 16, gap: 8, backgroundColor: t.card, borderColor: t.border, borderWidth: 1, borderRadius: 12, opacity: pressed ? 0.6 : 1 })}>
        <Text style={{ color: t.fg, fontSize: 17, fontWeight: "700" }}>{item.abbr} · {zh ? item.zh : item.en || item.abbr}</Text>
        <Text numberOfLines={3} style={{ color: t.muted, lineHeight: 22 }}>{explanationIn(item.explanation, language).definition || (zh ? "尚未加入說明，點選以新增。" : "No explanation yet. Tap to add one.")}</Text>
      </Pressable>} />
  </View>;
}
