import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { initDatabase } from "../storage";
import { useTheme } from "../theme";

const DB_NAME = "project-fighter.db";

export default function RootLayout() {
  const t = useTheme();
  return (
    <SQLiteProvider databaseName={DB_NAME} onInit={initDatabase}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.card },
          headerTintColor: t.accent,
          headerTitleStyle: { color: t.fg },
          contentStyle: { backgroundColor: t.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="marker/[id]" options={{ title: "指標說明 Marker info", presentation: "modal" }} />
        <Stack.Screen name="report/new" options={{ title: "新增 Add", presentation: "modal" }} />
        <Stack.Screen name="report/[id]" options={{ title: "編輯 Edit" }} />
      </Stack>
    </SQLiteProvider>
  );
}
