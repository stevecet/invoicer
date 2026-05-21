import AuthScaffold from "@/src/components/AuthScaffold";
import SignUpForm from "@/src/components/forms/SignupForm";
import { TextDivider } from "@/src/components/TextDivider";
import { router } from "expo-router";
import { View } from "react-native";
import { AuthInlineLink, AuthSocialRow } from "@/src/components/auth/AuthUi";

export default function RegisterScreen() {
  return (
    <AuthScaffold
      title="Create Account"
      subtitle="Create a new account to get started and enjoy seamless access to our features."
      footer={
        <View>
          <AuthInlineLink
            prefix="Already have an account?"
            action="Sign In here"
            onPress={() => router.push("/login")}
          />
          <TextDivider label="or" />
          <AuthSocialRow />
        </View>
      }
    >
      <SignUpForm />
    </AuthScaffold>
  );
}
