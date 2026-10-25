import { Stack } from "expo-router";
import { useTheme } from "../../../theme";

export default function RecordsLayout() {
  const t = useTheme();
  return <Stack screenOptions={{ headerStyle: { backgroundColor: t.card }, headerTintColor: t.accent, headerTitleStyle: { color: t.fg }, contentStyle: { backgroundColor: t.bg } }}>
    <Stack.Screen name="index" options={{ title: "紀錄 Records" }} />
    <Stack.Screen name="trends" options={{ title: "趨勢 Trends" }} />
  </Stack>;
}
