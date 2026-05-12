import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";

export default function SignUpForm() {
    const login = useAuthStore((state) => state.login);
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    });
    const [visible, setVisible] = useState(false);

    const onSubmit = (data: { email: string; password: string; confirmPassword: string }) => {
        console.log(data);
        login();
        router.replace("/home");
    };

    const formRules = {
        email: {
            required: "Email is required",
            pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Invalid email address"
            }
        },
        password: {
            required: "Password is required",
            pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.@$!%*?&#])[A-Za-z\d@$!%*?&#\s]{8,}$/,
                message: "Password must be at least 8 characters and include uppercase, lowercase, a number, and a symbol or space"
            }

        },
        confirmPassword: {
            required: "Please confirm your password",
            validate: (value: string, formValues: any) => value === formValues.password || "Passwords do not match"
        }
    };

    return (
        <View>
            <Text variant="headlineSmall" style={styles.title}>
                Sign Up
            </Text>
            <Text style={styles.label}>Email</Text>
            <Controller
                name="email"
                control={control}
                rules={formRules.email}
                render={({ field: { value, onChange } }) => (
                    <TextInput mode="outlined" placeholder="test@example.com"
                        onChangeText={onChange} value={value} keyboardType="email-address"
                        textContentType="emailAddress" style={styles.input} />
                )}
            />
            {errors.email && <Text style={{ color: "red", marginBottom: 5 }}>{errors.email.message}</Text>}

            <Text style={styles.label}>Password</Text>
            <Controller
                name="password"
                control={control}
                rules={formRules.password}
                render={({ field: { value, onChange } }) => (
                    <TextInput mode="outlined" placeholder="********" style={styles.input}
                        right={<TextInput.Icon icon={visible ? "eye-off" : "eye"} onPress={() => setVisible(!visible)} />}
                        secureTextEntry={!visible} value={value} onChangeText={onChange} textContentType="password" />
                )}
            />
            {errors.password && <Text style={{ color: "red", marginBottom: 5 }}>{errors.password.message}</Text>}

            <Text style={styles.label}>Re-enter Password</Text>
            <Controller
                name="confirmPassword"
                control={control}
                rules={formRules.confirmPassword}
                render={({ field: { value, onChange } }) => (
                    <TextInput mode="outlined" placeholder="********" style={styles.input}
                        right={<TextInput.Icon icon={visible ? "eye-off" : "eye"} onPress={() => setVisible(!visible)} />}
                        secureTextEntry={!visible} value={value} onChangeText={onChange} textContentType="password" />
                )}
            />
            {errors.confirmPassword && <Text style={{ color: "red", marginBottom: 5 }}>{errors.confirmPassword.message}</Text>}

            <Button mode="contained" style={styles.button} onPress={handleSubmit(onSubmit)}>
                Sign Up
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        marginBottom: 16,
        textAlign: "center",
        fontWeight: "bold",
    },
    button: {
        marginTop: 20,
        borderRadius: 5,
    },
    input: {
        marginBottom: 3,
        backgroundColor: "#ebeaea",
    },
    label: {
        marginBottom: 5,
        marginTop: 15,
        fontWeight: "bold",
    }
});
