import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../hooks/useTheme";

export const TextDivider = ({ label }: { label: string }) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.dividerContainer}>
      <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      <Text style={[styles.dividerText, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 15,
  },
});
