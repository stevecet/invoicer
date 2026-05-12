import LoginForm from "@/src/components/forms/LoginForm";
import { TextDivider } from "@/src/components/TextDivider";
import { Link } from "expo-router";
import {
    Image,
    StyleSheet,
    View,
} from "react-native";
import { Button, Icon, Text } from "react-native-paper";

export default function LoginScreen() {

    return (
        <View style={styles.container}>
            <View style={styles.logo}><Image source={require('@/assets/images/icon.png')} style={styles.logoImage} /></View>
            <LoginForm />
            <TextDivider label="or" />
            <Button
                icon={() => <Image source={require("@/assets/images/google.png")} style={styles.socialIcon} />}
                mode="outlined"
                onPress={() => { }}
                textColor="#3c4043"
                style={styles.googleButton}
                labelStyle={{ fontSize: 16, fontWeight: '500' }}
            >
                Sign in with Google
            </Button>
            <Button
                icon={({ color }) => (
                    <Icon source="apple" size={24} color={color} />
                )}
                mode="contained"
                onPress={() => { }}
                buttonColor="#000000"
                textColor="#FFFFFF"
                style={styles.appleButton}
                labelStyle={{ fontSize: 16, fontWeight: '500' }}
            >
                Sign in with Apple
            </Button>
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 20,
            }}>
                <Text>Don&apos;t have an account?</Text>
                <Link href="/register">
                    <Button mode="text" compact>
                        Sign Up
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
    logo: {
        alignSelf: "center",
        marginBottom: 10,
    },
    logoImage: {
        width: 50,
        height: 50,
    },
    socialIcon: {
        width: 18,
        height: 18,
        resizeMode: "contain",
    },
    appleButton: {
        borderRadius: 6,
        height: 44,
        justifyContent: "center",
        marginVertical: 15,
    },
    googleButton: {
        borderColor: "#DADCE0",
        borderRadius: 4,
        height: 44,
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
    },
});
