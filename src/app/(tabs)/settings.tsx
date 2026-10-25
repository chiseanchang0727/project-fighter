import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { DEFAULT_PROFILE } from "../../domain/profile";
import { parseBackup, parseCustomMarkers, parseMarkerExplanations } from "../../domain/validate";
import { useRepo } from "../../storage/hooks";
import { useTheme, type Theme } from "../../theme";

export default function SettingsScreen() {
  const t = useTheme();
  const repo = useRepo();
  const s = styles(t);

  async function exportBackup() {
    try {
      const reports = await repo.listReports();
      const markers = await repo.listMarkers();
      const customMarkers = markers.filter((m) => m.id.startsWith("custom-"));
      const markerExplanations = markers.flatMap((m) => m.explanation ? [{ markerId: m.id, explanation: m.explanation }] : []);
      const stamp = new Date().toISOString().slice(0, 10);
      const file = new File(Paths.cache, `project-fighter-backup-${stamp}.json`);
      if (file.exists) file.delete();
      file.create();
      file.write(JSON.stringify({ app: "project-fighter", version: 3, reports, customMarkers, markerExplanations }, null, 2));
      if (!(await Sharing.isAvailableAsync())) return Alert.alert("無法分享", "此裝置不支援分享功能");
      await Sharing.shareAsync(file.uri, { mimeType: "application/json", dialogTitle: "匯出備份 Export backup" });
    } catch (e) {
      Alert.alert("匯出失敗", e instanceof Error ? e.message : String(e));
    }
  }

  async function importBackup() {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "application/json", copyToCacheDirectory: true });
      if (result.canceled) return;
      const text = await new File(result.assets[0].uri).text();
      const parsed = JSON.parse(text);
      const customMarkers = parseCustomMarkers(Array.isArray(parsed) ? [] : parsed?.customMarkers ?? []);
      const markers = [...await repo.listMarkers(), ...customMarkers];
      const reports = parseBackup(Array.isArray(parsed) ? parsed : parsed?.reports, markers);
      const explanations = parseMarkerExplanations(Array.isArray(parsed) ? [] : parsed?.markerExplanations ?? [], markers);
      await repo.importReports(reports, customMarkers, explanations);
      Alert.alert("完成 Done", `已匯入 ${reports.length} 筆紀錄 Imported ${reports.length} record(s).`);
    } catch (e) {
      Alert.alert("匯入失敗 Import failed", e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.section}>個人檔案 Profile</Text>
      <View style={[s.button, { gap: 8 }]}>
        <Text style={{ color: t.fg, fontSize: 24, fontWeight: "700" }}>{DEFAULT_PROFILE.name}</Text>
        <Text style={s.noteText}>姓名 Name · {DEFAULT_PROFILE.name}</Text>
        <Text style={s.noteText}>更多個人資料將於之後加入。More profile details will be added later.</Text>
      </View>
      <Text style={s.section}>資料 Data</Text>
      <Pressable onPress={exportBackup} style={({ pressed }) => [s.button, pressed && { opacity: 0.7 }]}>
        <Text style={s.buttonText}>匯出備份 Export backup</Text>
      </Pressable>
      <Pressable onPress={importBackup} style={({ pressed }) => [s.button, pressed && { opacity: 0.7 }]}>
        <Text style={s.buttonText}>匯入備份 Import backup</Text>
      </Pressable>
      <View style={s.note}>
        <Text style={s.noteText}>
          所有資料只存在這支手機上，不會上傳到任何伺服器。刪除 App 前請先匯出備份。
        </Text>
        <Text style={s.noteText}>
          All data stays on this phone and is not uploaded anywhere. Export a backup before deleting the app.
        </Text>
        <Text style={s.noteText}>
          本 App 僅供個人紀錄，不提供醫療診斷；請以醫師的解讀為準。
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = (t: Theme) => StyleSheet.create({
  container: { padding: 16, gap: 12 },
  section: { color: t.muted, fontSize: 13, textTransform: "uppercase", marginTop: 8 },
  button: { backgroundColor: t.card, borderRadius: 12, borderWidth: 1, borderColor: t.border, padding: 16 },
  buttonText: { color: t.accent, fontSize: 16, fontWeight: "600" },
  note: { marginTop: 16, gap: 8 },
  noteText: { color: t.muted, fontSize: 13, lineHeight: 19 },
});
