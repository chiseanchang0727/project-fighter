import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme";

export function RecordsMenu({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
    <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
      <Pressable accessibilityRole="button" accessibilityLabel="關閉選單 Close menu" onPress={onClose} style={{ position: "absolute", inset: 0 }} />
      <View accessibilityViewIsModal style={{ backgroundColor: t.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: Math.max(insets.bottom, 20), gap: 12 }}>
        <Text accessibilityRole="header" style={{ color: t.fg, fontSize: 20, fontWeight: "700" }}>紀錄與趨勢 Records & Trends</Text>
        {([
          { title: "紀錄 Records", description: "查看與編輯檢驗紀錄", icon: "document-text-outline", route: "/records" },
          { title: "趨勢 Trends", description: "查看指標隨時間的變化", icon: "trending-up-outline", route: "/records/trends" },
        ] as const).map((item) => <Pressable key={item.route} accessibilityRole="button" onPress={() => {
          onClose();
          router.navigate(item.route);
        }} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderWidth: 1, borderColor: t.border, borderRadius: 12, opacity: pressed ? 0.6 : 1 })}>
          <Ionicons name={item.icon} color={t.accent} size={26} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: t.fg, fontSize: 17, fontWeight: "600" }}>{item.title}</Text>
            <Text style={{ color: t.muted }}>{item.description}</Text>
          </View>
          <Ionicons name="chevron-forward" color={t.muted} size={18} />
        </Pressable>)}
        <Pressable accessibilityRole="button" onPress={onClose} style={{ minHeight: 44, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: t.muted }}>取消 Cancel</Text>
        </Pressable>
      </View>
    </View>
  </Modal>;
}
