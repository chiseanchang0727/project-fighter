import { Text, TextInput, View } from "react-native";
import { useState } from "react";
import type { ExplanationLanguage, MarkerExplanation } from "../domain/types";
import { explanationIn, EXPLANATION_LABELS, updateExplanation } from "../domain/explanation-language";
import { ExplanationLanguageSwitch } from "./ExplanationLanguageSwitch";
import type { Theme } from "../theme";

export const EMPTY_EXPLANATION: MarkerExplanation = { definition: "", low: "", high: "" };

export function ExplanationFields({ value, onChange, theme: t, disabled = false, language }: {
  value: MarkerExplanation; onChange: (value: MarkerExplanation) => void; theme: Theme; disabled?: boolean;
  language?: ExplanationLanguage;
}) {
  const [selectedLanguage, setSelectedLanguage] = useState<ExplanationLanguage>("zh");
  const lang = language ?? selectedLanguage;
  const text = explanationIn(value, lang);
  return <View style={{ gap: 14 }}>
    {!language && <ExplanationLanguageSwitch value={lang} onChange={setSelectedLanguage} theme={t} />}
    {(["definition", "low", "high"] as const).map((key) => {
      const label = EXPLANATION_LABELS[lang][key];
      return <View key={key} style={{ gap: 6 }}>
      <Text style={{ color: t.fg, fontWeight: "600" }}>{label}</Text>
      <TextInput accessibilityLabel={label} value={text[key]} onChangeText={(input) => onChange(updateExplanation(value, lang, { ...text, [key]: input }))}
        editable={!disabled} multiline maxLength={4000} textAlignVertical="top"
        placeholder={lang === "en" ? "Optional" : "選填"} placeholderTextColor={t.muted}
        style={{ color: t.fg, backgroundColor: t.inputBg, borderColor: t.border, borderWidth: 1, borderRadius: 8, padding: 12, minHeight: 100, fontSize: 16 }} />
    </View>; })}
  </View>;
}
