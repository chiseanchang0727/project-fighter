import type { ExplanationLanguage, ExplanationText, MarkerExplanation } from "./types";

export const EXPLANATION_LABELS = {
  en: { definition: "Definition", low: "What low values may mean", high: "What high values may mean" },
  zh: { definition: "定義", low: "偏低可能代表", high: "偏高可能代表" },
};

/** Older explanations stored Chinese and English on separate lines. Keep that data readable. */
export function explanationIn(explanation: MarkerExplanation | undefined, language: ExplanationLanguage): ExplanationText {
  if (explanation?.translations?.[language]) return explanation.translations[language];
  const select = (text: string) => text.split("\n").filter((line) => {
    const chinese = /\p{Script=Han}/u.test(line);
    return language === "zh" ? chinese : !chinese;
  }).join("\n").trim();
  return { definition: select(explanation?.definition ?? ""), low: select(explanation?.low ?? ""), high: select(explanation?.high ?? "") };
}

export function updateExplanation(explanation: MarkerExplanation, language: ExplanationLanguage, value: ExplanationText): MarkerExplanation {
  return { ...explanation, translations: { en: explanationIn(explanation, "en"), zh: explanationIn(explanation, "zh"), [language]: value } };
}
