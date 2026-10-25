import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable } from "react-native";
import type { LabResult, MarkerDef } from "../domain/types";
import { useTheme } from "../theme";

export function MarkerInfoButton({ marker, result }: { marker: MarkerDef; result?: LabResult }) {
  const t = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={`${marker.abbr} 說明 Information`}
    style={({ pressed }) => ({ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}
    onPress={(event) => {
      event.stopPropagation();
      router.push({ pathname: "/marker/[id]", params: {
        id: marker.id,
        ...(result ? { value: String(result.value), refLow: String(result.refLow ?? marker.refLow ?? ""), refHigh: String(result.refHigh ?? marker.refHigh ?? "") } : {}),
      } });
    }}>
    <Ionicons name="information-circle-outline" color={t.accent} size={22} />
  </Pressable>;
}
