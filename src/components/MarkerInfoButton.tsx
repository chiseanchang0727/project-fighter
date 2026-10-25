import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable } from "react-native";
import type { LabResult, MarkerDef } from "../domain/types";

export function MarkerInfoButton({ marker, result }: { marker: MarkerDef; result?: LabResult }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`${marker.abbr} 說明 Information`}
    style={({ pressed }) => ({ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}
    onPress={(event) => {
      event.stopPropagation();
      router.push({ pathname: "/marker/[id]", params: {
        id: marker.id,
        ...(result ? { value: String(result.value), refLow: String(result.refLow ?? marker.refLow ?? ""), refHigh: String(result.refHigh ?? marker.refHigh ?? "") } : {}),
      } });
    }}>
    <Ionicons name="information-circle-outline" color="#9ca3af" size={22} />
  </Pressable>;
}
