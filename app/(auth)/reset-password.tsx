import AuthScaffold from "@/src/components/AuthScaffold";
import { AuthButton, AuthInput } from "@/src/components/auth/AuthUi";
import { useAuthStore } from "@/stores/auth-store";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/src/hooks/useTheme";

type ResetPasswordValues = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const { email, otp } = useLocalSearchParams<{ email?: string; otp?: string }>();
  const [visible, setVisible] = useState(false);
  const resetPassword = useAuthStore((state) => state.resetPasswordWithOtp);
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
  } = useForm<ResetPasswordValues>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!email || !otp) {
      return;
    }

    clearError();
    const success = await resetPassword(email, otp, data.password);

    if (success) {
      router.replace("/login");
    }
  };

  return (
    <AuthScaffold
      title="Create New Password"
      subtitle="Set a new strong password to protect your account."
    >
      <View style={styles.container}>
        <Controller
          control={control}
          name="password"
          rules={{
            required: "Password is required",
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.@$!%*?&#])[A-Za-z\d@$!%*?&#\s]{8,}$/,
              message:
                "Use at least 8 characters with uppercase, lowercase, a number, and a symbol or space",
            },
          }}
          render={({ field: { value, onChange } }) => (
            <AuthInput
              value={value}
              onChangeText={onChange}
              placeholder="New password"
              textContentType="newPassword"
              secureTextEntry={!visible}
              icon="lock"
              rightIcon={visible ? "eye-off" : "eye"}
              onRightIconPress={() => setVisible((current) => !current)}
            />
          )}
        />
        {errors.password ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.password.message}</Text> : null}

        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: "Please confirm your password",
            validate: (value, formValues) =>
              value === formValues.password || "Passwords do not match",
          }}
          render={({ field: { value, onChange } }) => (
            <AuthInput
              value={value}
              onChangeText={onChange}
              placeholder="Confirm new password"
              textContentType="newPassword"
              secureTextEntry={!visible}
              icon="lock"
              rightIcon={visible ? "eye-off" : "eye"}
              onRightIconPress={() => setVisible((current) => !current)}
            />
          )}
        />
        {errors.confirmPassword ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{errors.confirmPassword.message}</Text>
        ) : null}
        {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

        <Text style={[styles.helperText, { color: colors.textSecondary }]}>
          After a successful reset, we’ll return you to login so you can sign in with the new password.
        </Text>

        <View style={styles.buttonWrap}>
          <AuthButton
            label={isLoading ? "Updating password..." : "Reset Password"}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading || !email || !otp}
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
  helperText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 13,
  },
  buttonWrap: {
    marginTop: 22,
  },
});
