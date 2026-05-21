import { useEffect, useRef, useState } from "react";
import AuthScaffold from "@/src/components/AuthScaffold";
import { AuthButton, AuthInlineLink } from "@/src/components/auth/AuthUi";
import { useAuthStore } from "@/stores/auth-store";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "@/src/hooks/useTheme";

type VerifyOtpValues = {
  otp: string;
};

export default function VerifyResetOtpScreen() {
  const { colors, isDark } = useTheme();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);
  const verifyPasswordResetOtp = useAuthStore((state) => state.verifyPasswordResetOtp);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const otpInputRef = useRef<TextInput>(null);

  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpValues>({
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    if (secondsRemaining <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setSecondsRemaining((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsRemaining]);

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const focusOtpInput = () => {
    requestAnimationFrame(() => {
      otpInputRef.current?.focus();
    });
  };

  const handleVerifyOtp = async (data: VerifyOtpValues) => {
    if (!email) {
      return;
    }

    clearError();
    const success = await verifyPasswordResetOtp(email, data.otp);

    if (success) {
      router.push({
        pathname: "/reset-password",
        params: { email, otp: data.otp },
      });
    }
  };

  const handleResendCode = async () => {
    if (!email || secondsRemaining > 0) {
      return;
    }

    clearError();
    const success = await requestPasswordReset(email);

    if (success) {
      setSecondsRemaining(60);
    }
  };

  return (
    <AuthScaffold
      title="Verify OTP"
      subtitle={
        email
          ? `Enter the 6-digit code sent to \n ${email}`
          : "Enter the 6-digit code sent to your email address."
      }
      footer={
        <AuthInlineLink
          prefix="Entered the wrong email?"
          action="Go back"
          onPress={() => router.push("/forgot-password")}
        />
      }
    >
      <View style={styles.container}>
        <Controller
          control={control}
          name="otp"
          rules={{
            required: "OTP is required",
            pattern: {
              value: /^\d{6}$/,
              message: "OTP must be 6 digits",
            },
          }}
          render={({ field: { value, onChange } }) => (
            <View style={styles.otpInputWrap}>
              <Pressable onPress={focusOtpInput} style={styles.otpTapTarget}>
                <View pointerEvents="none" style={styles.digitsRow}>
                  {Array.from({ length: 6 }).map((_, index) => {
                    const digit = value[index] ?? "";
                    const isActive = value.length === index || (value.length === 6 && index === 5);

                    return (
                      <View
                        key={`otp-digit-${index}`}
                        style={[
                          styles.digitBox,
                          { borderColor: colors.border, backgroundColor: colors.surfaceSecondary },
                          digit ? { borderColor: colors.tint, backgroundColor: isDark ? colors.tint + "15" : "#F4FCF8" } : null,
                          isActive ? { borderColor: colors.tint, shadowColor: colors.tint } : null,
                        ]}
                      >
                        <Text style={[styles.digitText, { color: colors.text }]}>{digit}</Text>
                      </View>
                    );
                  })}
                </View>
              </Pressable>

              <TextInput
                ref={otpInputRef}
                value={value}
                onChangeText={(text) => onChange(text.replace(/\D/g, "").slice(0, 6))}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoCapitalize="none"
                maxLength={6}
                caretHidden
                style={styles.hiddenInput}
                autoFocus
                blurOnSubmit={false}
              />
            </View>
          )}
        />
        {errors.otp ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.otp.message}</Text> : null}
        {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

        <Text style={[styles.helperText, { color: colors.textSecondary }]}>The code expires in 10 minutes.</Text>

        <View style={styles.buttonWrap}>
          <AuthButton
            label={isLoading ? "Verifying..." : "Continue"}
            onPress={handleSubmit(handleVerifyOtp)}
            disabled={isLoading || !email}
          />
        </View>

        <Pressable
          disabled={isLoading || !email || secondsRemaining > 0}
          onPress={handleResendCode}
          style={[
            styles.secondaryButton,
            { borderColor: colors.border, backgroundColor: colors.surfaceSecondary },
            isLoading || !email || secondsRemaining > 0 ? styles.secondaryButtonDisabled : null,
          ]}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Send Again</Text>
        </Pressable>
        <Text style={[styles.countdownText, { color: colors.textMuted }]}>
          {secondsRemaining > 0 ? `Resend available in (${formatCountdown(secondsRemaining)})` : "You can request a new code now."}
        </Text>
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  otpInputWrap: {
    position: "relative",
    alignItems: "center",
  },
  otpTapTarget: {
    width: "100%",
  },
  hiddenInput: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.02,
    color: "transparent",
    backgroundColor: "transparent",
    zIndex: 2,
  },
  digitsRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  digitBox: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 52,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  digitText: {
    fontSize: 24,
    fontWeight: "700",
  },
  helperText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  countdownText: {
    fontSize: 13,
    textAlign: "center",
  },
  errorText: {
    fontSize: 13,
    textAlign: "center",
  },
  buttonWrap: {
    marginTop: 22,
  },
  secondaryButton: {
    minHeight: 50,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  secondaryButtonDisabled: {
    opacity: 0.55,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
