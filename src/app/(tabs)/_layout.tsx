import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useState, type ComponentProps } from "react";
import { RecordsMenu } from "../../components/RecordsMenu";
import { useTheme } from "../../theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

// Tab icon colors are typed as ColorValue; Ionicons needs a plain string.
const icon = (name: IconName) => {
  function TabIcon({ color, size }: { color: unknown; size: number }) {
    return <Ionicons name={name} color={color as string} size={size} />;
  }
  return TabIcon;
};

export default function TabsLayout() {
  const t = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: { backgroundColor: t.card, borderTopColor: t.border },
        headerStyle: { backgroundColor: t.card },
        headerTitleStyle: { color: t.fg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "首頁 Home", tabBarIcon: icon("home-outline") }} />
      <Tabs.Screen name="records" options={{ title: "紀錄與趨勢", headerShown: false, tabBarIcon: icon("stats-chart-outline") }}
        listeners={{ tabPress: (event) => { event.preventDefault(); setMenuOpen(true); } }} />
      <Tabs.Screen name="template" options={{ title: "範本 Template", tabBarIcon: icon("list-outline") }} />
      <Tabs.Screen name="definitions" options={{ title: "指標說明", tabBarIcon: icon("book-outline") }} />
      <Tabs.Screen name="settings" options={{ title: "設定 Settings", tabBarIcon: icon("settings-outline") }} />
    </Tabs>
    <RecordsMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
