import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { encouragementsFor, nextEncouragement } from "../../domain/encouragement";
import { CURRENT_PROFILE } from "../../domain/profile";
import { useTheme, type Theme } from "../../theme";

export default function HomeScreen() {
  const t = useTheme();
  const s = styles(t);
  const profile = CURRENT_PROFILE;
  const messages = encouragementsFor(profile.id);
  const previousMessage = useRef<number | null>(null);
  const [messageIndex, setMessageIndex] = useState<number | null>(null);

  useFocusEffect(useCallback(() => {
    const next = nextEncouragement(previousMessage.current, messages.length);
    previousMessage.current = next;
    setMessageIndex(next);
  }, [messages]));

  const message = messageIndex === null ? null : messages[messageIndex];

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.eyebrow}>你的健康紀錄 YOUR HEALTH JOURNAL</Text>
      <Text style={s.greeting}>你好，{profile.name}</Text>
      <Text style={s.intro}>Welcome, {profile.name}. Keep your health records together.</Text>

      {message && <View style={s.encouragement}>
        <Ionicons name="heart-outline" color={t.accent} size={22} />
        <Text style={s.message}>{message.text}</Text>
        {message.from && <Text style={s.author}>from {message.from}</Text>}
      </View>}

      <Pressable accessibilityRole="button" onPress={() => router.push("/report/new")}
        style={({ pressed }) => [s.add, pressed && s.pressed]}>
        <Ionicons name="add-circle-outline" color={t.onAccent} size={22} />
        <Text style={s.addText}>新增紀錄 Add record</Text>
      </Pressable>

      <Pressable accessibilityRole="button" onPress={() => router.navigate("/records")}
        style={({ pressed }) => [s.shortcut, pressed && s.pressed]}>
        <Ionicons name="document-text-outline" color={t.accent} size={26} />
        <Text style={s.shortcutTitle}>紀錄 Records</Text>
        <Text style={s.muted}>查看與編輯過往紀錄</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => router.navigate("/records/trends")}
        style={({ pressed }) => [s.shortcut, pressed && s.pressed]}>
        <Ionicons name="trending-up-outline" color={t.accent} size={26} />
        <Text style={s.shortcutTitle}>趨勢 Trends</Text>
        <Text style={s.muted}>查看指標隨時間的變化</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = (t: Theme) => StyleSheet.create({
  container: { padding: 20, paddingBottom: 40, gap: 18, backgroundColor: t.bg, flexGrow: 1 },
  eyebrow: { color: t.muted, fontSize: 12, fontWeight: "600", letterSpacing: 1, marginTop: 8 },
  greeting: { color: t.fg, fontSize: 30, fontWeight: "700" },
  intro: { color: t.muted, fontSize: 15, lineHeight: 23 },
  encouragement: { padding: 18, gap: 10, borderRadius: 14, borderWidth: 1, borderColor: t.border, backgroundColor: t.card },
  message: { color: t.fg, fontSize: 18, lineHeight: 29, fontWeight: "500" },
  author: { color: t.muted, fontSize: 14, textAlign: "right" },
  muted: { color: t.muted, fontSize: 13, lineHeight: 21 },
  add: { flexDirection: "row", gap: 10, flexWrap: "wrap", minHeight: 52, padding: 14, alignItems: "center", justifyContent: "center", backgroundColor: t.accent, borderRadius: 14 },
  addText: { color: t.onAccent, fontSize: 16, fontWeight: "700" },
  shortcut: { padding: 16, gap: 10, borderWidth: 1, borderColor: t.border, borderRadius: 14, backgroundColor: t.card },
  shortcutTitle: { color: t.fg, fontSize: 15, fontWeight: "600" },
  pressed: { opacity: 0.7 },
});
