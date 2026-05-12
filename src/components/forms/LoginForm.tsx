import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginForm() {
    const [visible, setVisible] = useState(false);
    const login = useAuthStore((state) => state.login);
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const onSubmit = (data: { email: string; password: string }) => {
        console.log(data);
        login();
        router.replace("/home");
    };

    return (
        <View>
            <Text variant="headlineSmall" style={styles.title}>
                Login
            </Text>
            <Text style={styles.label}>Email</Text>
            <Controller
                control={control}
                name="email"
                rules={{ required: "Email is required" }}
                render={({ field: { value, onChange } }) => (
                    <TextInput
                        value={value}
                        onChangeText={onChange}
                        mode="outlined"
                        placeholder="test@example.com"
                        keyboardType="email-address"
                        textContentType="emailAddress"
                    />
                )}
            />
            {errors.email && <Text style={{ color: "red", marginVertical: 5 }}>{errors.email.message}</Text>}

            <Text style={styles.label}>Password</Text>
            <Controller
                control={control}
                name="password"
                rules={{ required: "Password is required" }}
                render={({ field: { value, onChange } }) => (
                    <TextInput
                        value={value}
                        onChangeText={onChange}
                        mode="outlined"
                        placeholder="********"
                        textContentType="password"
                        right={<TextInput.Icon icon={visible ? "eye-off" : "eye"} onPress={() => setVisible(!visible)} />}
                        secureTextEntry={!visible}
                    />
                )}
            />
            {errors.password && <Text style={{ color: "red", marginVertical: 5 }}>{errors.password.message}</Text>}

            <View style={{
                flexDirection: "row",
                alignItems: "center",
            }}>
                <Text>Forgot Password ?</Text>
                <Button mode="text" onPress={() => router.push("/forgot-password")} compact>
                    Click here
                </Button>

            </View>

            <Button mode="contained" style={styles.button} onPress={handleSubmit(onSubmit)}>
                Login
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        marginBottom: 5,
        textAlign: "center",
        fontWeight: "bold",
    },
    button: {
        marginTop: 20,
        borderRadius: 5,
    },
    label: {
        marginBottom: 5,
        marginTop: 15,
        fontWeight: "bold",
    }
});
