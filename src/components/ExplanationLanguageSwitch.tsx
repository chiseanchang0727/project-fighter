import { Pressable, Text, View } from "react-native";
import type { ExplanationLanguage } from "../domain/types";
import type { Theme } from "../theme";

export function ExplanationLanguageSwitch({ value, onChange, theme: t }: {
  value: ExplanationLanguage; onChange: (language: ExplanationLanguage) => void; theme: Theme;
}) {
  return <View style={{ flexDirection: "row", gap: 4, alignSelf: "flex-start" }} accessibilityRole="tablist">
    {([['zh', '中文'], ['en', 'EN']] as const).map(([language, label]) =>
      <Pressable key={language} accessibilityRole="tab" accessibilityState={{ selected: value === language }}
        hitSlop={{ top: 4, bottom: 4 }} onPress={() => onChange(language)} style={{ minWidth: 44, minHeight: 36, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1,
          borderColor: value === language ? t.accent : t.border, backgroundColor: value === language ? t.accent : t.card, alignItems: "center" }}>
        <Text style={{ color: value === language ? "#fff" : t.fg, fontWeight: "600", fontSize: 12 }}>{label}</Text>
      </Pressable>)}
  </View>;
}
