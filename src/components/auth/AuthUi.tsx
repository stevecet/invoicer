import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "../../hooks/useTheme";

type IconName = keyof typeof Ionicons.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap;

type AuthInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  textContentType?:
  | "none"
  | "URL"
  | "addressCity"
  | "addressCityAndState"
  | "addressState"
  | "countryName"
  | "creditCardNumber"
  | "emailAddress"
  | "familyName"
  | "fullStreetAddress"
  | "givenName"
  | "jobTitle"
  | "location"
  | "middleName"
  | "name"
  | "namePrefix"
  | "nameSuffix"
  | "nickname"
  | "organizationName"
  | "postalCode"
  | "streetAddressLine1"
  | "streetAddressLine2"
  | "sublocality"
  | "telephoneNumber"
  | "username"
  | "password"
  | "newPassword"
  | "oneTimeCode"
  | undefined;
  secureTextEntry?: boolean;
  icon: IconName;
  iconSet?: "ionicons" | "material";
  rightIcon?: "eye" | "eye-off";
  onRightIconPress?: () => void;
};

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

type AuthSocialRowProps = {
  onFacebookPress?: () => void;
  onGooglePress?: () => void;
  onApplePress?: () => void;
};

export function AuthInput({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  textContentType,
  secureTextEntry,
  icon,
  iconSet = "material",
  rightIcon,
  onRightIconPress,
}: AuthInputProps) {
  const { colors } = useTheme();
  const LeftIcon = iconSet === "ionicons" ? Ionicons : MaterialCommunityIcons;

  return (
    <View style={[styles.inputShell, { backgroundColor: colors.surfaceSecondary, shadowColor: colors.textMuted }]}>
      <LeftIcon name={icon as never} size={20} color={colors.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        textContentType={textContentType}
        secureTextEntry={secureTextEntry}
        style={[styles.input, { color: colors.text }]}
      />
      {rightIcon ? (
        <Pressable
          accessibilityRole="button"
          hitSlop={10}
          onPress={onRightIconPress}
          style={styles.trailingIcon}
        >
          <Ionicons name={rightIcon} size={22} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function AuthButton({ label, onPress, disabled }: AuthButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.tint },
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text style={styles.buttonLabel}>{label}</Text>
    </Pressable>
  );
}

export function AuthSocialRow({
  onGooglePress = () => { },
  onApplePress = () => { },
}: AuthSocialRowProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.socialRow}>
      {/* <Pressable accessibilityRole="button" onPress={onGooglePress} style={[styles.socialButton, { backgroundColor: colors.surfaceSecondary, shadowColor: colors.textMuted }]}>
        <Image source={require("@/assets/images/google.png")} style={styles.googleIcon} />
      </Pressable> */}
      <Pressable accessibilityRole="button" onPress={onApplePress} style={[styles.socialButton, { backgroundColor: colors.surfaceSecondary, shadowColor: colors.textMuted }]}>
        {isDark ? (
          <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
        ) : (
          <Image source={require("@/assets/images/apple-logo.png")} style={styles.appleIcon} />
        )}
      </Pressable>
    </View>
  );
}

export function AuthInlineLink({
  prefix,
  action,
  onPress,
}: {
  prefix: string;
  action: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.inlineLinkRow}>
      <Text style={[styles.inlinePrefix, { color: colors.textSecondary }]}>{prefix} </Text>
      <Pressable accessibilityRole="button" onPress={onPress}>
        <Text style={[styles.inlineAction, { color: colors.tint }]}>{action}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  inputShell: {
    minHeight: 60,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  input: {
    flex: 1,
    marginLeft: 14,
    fontSize: 16,
    paddingVertical: 16,
  },
  trailingIcon: {
    marginLeft: 10,
  },
  button: {
    minHeight: 50,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonLabel: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    marginTop: 18,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  googleIcon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  appleIcon: {
    width: 21,
    height: 22,
    resizeMode: "contain",
  },
  inlineLinkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  inlinePrefix: {
    fontSize: 15,
  },
  inlineAction: {
    fontSize: 15,
    fontWeight: "700",
  },
});
