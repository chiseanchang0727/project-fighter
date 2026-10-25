import { useState } from "react";
import { RecordsMenu } from "../../components/RecordsMenu";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { DEFAULT_PROFILE } from "../../domain/profile";
import { useTheme, type Theme } from "../../theme";

export default function HomeScreen() {
  const t = useTheme();
  const s = styles(t);
  const profile = DEFAULT_PROFILE;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.eyebrow}>你的健康紀錄 YOUR HEALTH JOURNAL</Text>
      <Text style={s.greeting}>你好，{profile.name}</Text>
      <Text style={s.intro}>Welcome, {profile.name}. Keep your health records together, one day at a time.</Text>

      <Pressable accessibilityRole="button" onPress={() => router.push("/report/new")}
        style={({ pressed }) => [s.add, pressed && s.pressed]}>
        <Ionicons name="add-circle-outline" color="#fff" size={22} />
        <Text style={s.addText}>新增紀錄 Add record</Text>
      </Pressable>

      <Pressable accessibilityRole="button" onPress={() => setMenuOpen(true)}
        style={({ pressed }) => [s.shortcut, pressed && s.pressed]}>
        <Ionicons name="stats-chart-outline" color={t.accent} size={26} />
        <Text style={s.shortcutTitle}>紀錄與趨勢 Records & Trends</Text>
        <Text style={s.muted}>查看過往紀錄與數值變化</Text>
      </Pressable>
      <RecordsMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </ScrollView>
  );
}

const styles = (t: Theme) => StyleSheet.create({
  container: { padding: 20, paddingBottom: 40, gap: 18, backgroundColor: t.bg, flexGrow: 1 },
  eyebrow: { color: t.muted, fontSize: 12, fontWeight: "600", letterSpacing: 1, marginTop: 8 },
  greeting: { color: t.fg, fontSize: 30, fontWeight: "700" },
  intro: { color: t.muted, fontSize: 15, lineHeight: 23 },
  muted: { color: t.muted, fontSize: 13, lineHeight: 21 },
  add: { flexDirection: "row", gap: 10, flexWrap: "wrap", minHeight: 52, padding: 14, alignItems: "center", justifyContent: "center", backgroundColor: t.accent, borderRadius: 14 },
  addText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  shortcut: { padding: 16, gap: 10, borderWidth: 1, borderColor: t.border, borderRadius: 14, backgroundColor: t.card },
  shortcutTitle: { color: t.fg, fontSize: 15, fontWeight: "600" },
  pressed: { opacity: 0.7 },
});
