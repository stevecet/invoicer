import AuthScaffold from "@/src/components/AuthScaffold";
import { AuthButton, AuthInlineLink, AuthInput } from "@/src/components/auth/AuthUi";
import { useAuthStore } from "@/stores/auth-store";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/src/hooks/useTheme";
import { useEffect } from "react";

type ForgotPasswordValues = {
  email: string;
};

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);
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
  } = useForm<ForgotPasswordValues>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    clearError();
    const success = await requestPasswordReset(data.email);

    if (success) {
      router.push({
        pathname: "/verify-reset-otp",
        params: { email: data.email },
      });
    }
  };

  return (
    <AuthScaffold
      title="Forgot Password"
      subtitle="Enter your email address and we'll send a 6-digit code you can use to reset your password."
      footer={
        <AuthInlineLink
          prefix="Remembered your password?"
          action="Back to Login"
          onPress={() => router.push("/login")}
        />
      }
    >
      <View style={styles.container}>
        <Controller
          control={control}
          name="email"
          rules={{
            required: "Email is required",
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: "Invalid email address",
            },
          }}
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
        {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

        <View style={styles.buttonWrap}>
          <AuthButton
            label={isLoading ? "Sending code..." : "Send OTP"}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          />
        </View>
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  errorText: {
    fontSize: 13,
  },
  buttonWrap: {
    marginTop: 22,
  },
});
