import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";
import { StyleSheet, Text, View } from "react-native";
import { AuthButton, AuthInput } from "@/src/components/auth/AuthUi";
import { useTheme } from "@/src/hooks/useTheme";

export default function SignUpForm() {
  const { colors } = useTheme();
  const register = useAuthStore((state) => state.register);
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
  } = useForm<{
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const [visible, setVisible] = useState(false);

  const onSubmit = async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    clearError();
    const success = await register({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    if (success) {
      router.replace("/(tabs)");
    }
  };

  const formRules = {
    name: {
      required: "Name is required",
      minLength: {
        value: 2,
        message: "Name must be at least 2 characters",
      },
    },
    email: {
      required: "Email is required",
      pattern: {
        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        message: "Invalid email address",
      },
    },
    password: {
      required: "Password is required",
      pattern: {
        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.@$!%*?&#])[A-Za-z\d@$!%*?&#\s]{8,}$/,
        message: "Password must be at least 8 characters and include uppercase, lowercase, a number, and a symbol or space",
      },
    },
    confirmPassword: {
      required: "Please confirm your password",
      validate: (value: string, formValues: { password: string }) =>
        value === formValues.password || "Passwords do not match",
    },
  };

  return (
    <View style={styles.container}>
      <Controller
        name="name"
        control={control}
        rules={formRules.name}
        render={({ field: { value, onChange } }) => (
          <AuthInput
            value={value}
            onChangeText={onChange}
            placeholder="Name"
            textContentType="name"
            autoCapitalize="words"
            icon="person"
            iconSet="ionicons"
          />
        )}
      />
      {errors.name ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.name.message}</Text> : null}

      <Controller
        name="email"
        control={control}
        rules={formRules.email}
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
        name="password"
        control={control}
        rules={formRules.password}
        render={({ field: { value, onChange } }) => (
          <AuthInput
            value={value}
            onChangeText={onChange}
            placeholder="Password"
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
        name="confirmPassword"
        control={control}
        rules={formRules.confirmPassword}
        render={({ field: { value, onChange } }) => (
          <AuthInput
            value={value}
            onChangeText={onChange}
            placeholder="Confirm Password"
            textContentType="newPassword"
            secureTextEntry={!visible}
            icon="lock"
            rightIcon={visible ? "eye-off" : "eye"}
            onRightIconPress={() => setVisible((current) => !current)}
          />
        )}
      />
      {errors.confirmPassword ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.confirmPassword.message}</Text> : null}

      {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

      <View style={styles.buttonWrap}>
        <AuthButton
          label={isLoading ? "Creating account..." : "Create Account"}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  buttonWrap: {
    marginTop: 18,
  },
  errorText: {
    fontSize: 13,
    marginTop: -2,
  },
});
