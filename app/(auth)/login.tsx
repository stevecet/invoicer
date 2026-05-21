import AuthScaffold from "@/src/components/AuthScaffold";
import LoginForm from "@/src/components/forms/LoginForm";
import { TextDivider } from "@/src/components/TextDivider";
import { router } from "expo-router";
import { View } from "react-native";
import { AuthInlineLink, AuthSocialRow } from "@/src/components/auth/AuthUi";

export default function LoginScreen() {
  return (
    <AuthScaffold
      title="Log in"
      subtitle="Enter your email and password to securely access your account and manage your services."
      footer={
        <View>
          <AuthInlineLink
            prefix="Don't have an account?"
            action="Sign Up here"
            onPress={() => router.push("/register")}
          />
          <TextDivider label="or" />
          <AuthSocialRow />
        </View>
      }
    >
      <LoginForm />
    </AuthScaffold>
  );
}
