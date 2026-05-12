import SignUpForm from "@/src/components/forms/SignupForm";
import { TextDivider } from "@/src/components/TextDivider";
import { Link } from "expo-router";
import {
    Image,
    Pressable,
    StyleSheet,
    View,
} from "react-native";
import { Button, Text } from "react-native-paper";

export default function RegisterScreen() {

    return (
        <View style={styles.container}>
            <View style={styles.logo}><Image source={require('@/assets/images/icon.png')} style={styles.logoImage} /></View>
            <SignUpForm />
            <TextDivider label="or" />
            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
                <Pressable onPress={() => { }} style={styles.socialIconButton}>
                    <Image source={require("@/assets/images/google.png")} style={styles.socialIcon} />
                </Pressable>
                <Pressable onPress={() => { }} style={styles.socialIconButton}>
                    <Image source={require("@/assets/images/apple-logo.png")} style={styles.socialIcon} />
                </Pressable>
            </View>
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 10,
            }}>
                <Text>Have an account?</Text>
                <Link href="/login">
                    <Button mode="text" compact>
                        Login
                    </Button>
                </Link>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingTop: 18,
        marginTop: 50,
    },
    button: {
        marginTop: 20,
        borderRadius: 5,
    },
    logo: {
        alignSelf: "center",
        marginBottom: 10,
    },
    logoImage: {
        width: 50,
        height: 50,
    },
    socialIconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: "#DADCE0",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        marginHorizontal: 8,
    },
    socialIcon: {
        width: 22,
        height: 22,
        resizeMode: "contain",
    },
});
