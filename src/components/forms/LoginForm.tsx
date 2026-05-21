import { AuthButton, AuthInput } from "@/src/components/auth/AuthUi";
import { useAuthStore } from "@/stores/auth-store";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { IconButton } from "react-native-paper";
import { useTheme } from "@/src/hooks/useTheme";

export default function LoginForm() {
  const { colors, isDark } = useTheme();
  const [visible, setVisible] = useState(false);
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string; password: string }>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    clearError();
    const success = await login(data);

    if (success) {
      router.replace("/(tabs)");
    }
  };

  return (
    <View style={styles.container}>
      {error ? (
        <View style={[styles.errorContainer, { backgroundColor: isDark ? colors.error + "20" : "#FDE8E8", borderColor: colors.error }]}>
          <View style={styles.errorTextWrap}>
            <IconButton
              icon="alert-circle"
              iconColor={colors.error}
              size={20}
              style={styles.inlineIcon}
            />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>

          <IconButton
            icon="close"
            size={18}
            iconColor={colors.error}
            style={styles.closeButton}
            onPress={() => {
              clearError();
            }}
          />
        </View>
      ) : null}
      <Controller
        control={control}
        name="email"
        rules={{ required: "Email is required" }}
        render={({ field: { value, onChange } }) => (
          <AuthInput
            value={value}
            onChangeText={onChange}
            placeholder="Email address"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoCapitalize="none"
            icon="mail"
            iconSet="ionicons"
          />
        )}
      />
      {errors.email ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.email.message}</Text> : null}

      <Controller
        control={control}
        name="password"
        rules={{ required: "Password is required" }}
        render={({ field: { value, onChange } }) => (
          <AuthInput
            value={value}
            onChangeText={onChange}
            placeholder="Password"
            textContentType="password"
            secureTextEntry={!visible}
            icon="lock"
            rightIcon={visible ? "eye-off" : "eye"}
            onRightIconPress={() => setVisible((current) => !current)}
          />
        )}
      />
      {errors.password ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.password.message}</Text> : null}

      <View style={styles.optionsRow}>
        <View />
        <Pressable accessibilityRole="button" onPress={() => router.push("/forgot-password")}>
          <Text style={[styles.optionLink, { color: colors.text }]}>Forgot Password</Text>
        </Pressable>
      </View>

      <AuthButton
        label={isLoading ? "Logging in..." : "Login"}
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  optionsRow: {
    marginTop: 2,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  optionLink: {
    fontSize: 14,
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 10,
    width: '100%',
  },
  errorTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inlineIcon: {
    margin: 0,
    padding: 0,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1, 
    marginLeft: 4,
  },
  closeButton: {
    margin: 0,
    padding: 0,
  },
});
