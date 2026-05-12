import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

type ForgotPasswordValues = {
  email: string;
};

export default function ForgotPasswordScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
  } = useForm<ForgotPasswordValues>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordValues) => {
    console.log("Password reset requested for:", data.email);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Forgot Password
      </Text>
      <Text style={styles.description}>
        Enter the email tied to your account and we&apos;ll send a reset link.
      </Text>

      <Text style={styles.label}>Email</Text>
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
          <TextInput
            value={value}
            onChangeText={onChange}
            mode="outlined"
            placeholder="test@example.com"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoCapitalize="none"
          />
        )}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

      {isSubmitSuccessful && (
        <Text style={styles.successText}>
          If this email exists in our system, a reset link is on its way.
        </Text>
      )}

      <Button mode="contained" style={styles.button} onPress={handleSubmit(onSubmit)}>
        Send Reset Link
      </Button>

      <View style={styles.footer}>
        <Text>Remembered your password?</Text>
        <Link href="/login">
          <Button mode="text" compact>
            Back to Login
          </Button>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 12,
  },
  description: {
    textAlign: "center",
    color: "#5F6368",
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    marginBottom: 5,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginTop: 6,
  },
  successText: {
    color: "#1E8E3E",
    marginTop: 12,
  },
  button: {
    marginTop: 24,
    borderRadius: 5,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
});
