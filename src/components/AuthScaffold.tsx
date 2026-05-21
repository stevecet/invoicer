import { PropsWithChildren } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../hooks/useTheme";
import { StatusBar } from "expo-status-bar";

type AuthScaffoldProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  footer?: React.ReactNode;
}>;

export default function AuthScaffold({ title, subtitle, footer, children }: AuthScaffoldProps) {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.surface }]} edges={["top", "bottom"]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.deviceFrame}>
            <View style={styles.hero}>
              <Image
                source={require("@/assets/images/invoice.png")}
                style={styles.heroIcon}
              />
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
            </View>

            <View style={styles.body}>{children}</View>
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingVertical: 26,
    justifyContent: "center",
  },
  deviceFrame: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
  },
  hero: {
    paddingHorizontal: 6,
    marginBottom: 28,
    marginTop: 8,
    alignItems: "center",
  },
  heroIcon: {
    width: 68,
    height: 68,
    resizeMode: "contain",
    marginBottom: 18,
  },
  body: {
    gap: 16,
  },
  footer: {
    marginTop: 18,
  },
});
