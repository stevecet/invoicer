import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

export default function AppBootScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.glowLarge} />
      <View style={styles.glowSmall} />

      <View style={styles.logoWrap}>
        <Image source={require("@/assets/images/invoice.png")} style={styles.logo} />
      </View>

      <Text style={styles.title}>Invoicer</Text>
      <Text style={styles.subtitle}>Hassle free invoicing</Text>

      <View style={styles.loaderRow}>
        <ActivityIndicator size="small" color="#FFFFFF" />
        <Text style={styles.loaderText}>Preparing your workspace</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  glowLarge: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#0EA5E9",
    opacity: 0.18,
    top: 110,
    right: -40,
  },
  glowSmall: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#22C55E",
    opacity: 0.14,
    bottom: 120,
    left: -20,
  },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  logo: {
    width: 44,
    height: 44,
    resizeMode: "contain",
  },
  title: {
    color: "#F8FAFC",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  subtitle: {
    color: "#CBD5E1",
    fontSize: 15,
    marginTop: 10,
  },
  loaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 28,
  },
  loaderText: {
    color: "#E2E8F0",
    marginLeft: 10,
    fontSize: 14,
  },
});
