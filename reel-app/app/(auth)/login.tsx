import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "@/schema/authSchema";
import Toast from "react-native-toast-message";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(loginSchema),
    });
    const [loading, setLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const { login } = useAuth();

    const onSubmit = async (data: { email: string; password: string }) => {
        setLoading(true);
        try {
            await login(data.email, data.password);
            Toast.show({
                type: "success",
                text1: "Login Successful",
                text2: "You have been logged in!",
            });
        } catch (err: any) {
            console.log("Login Error:", err);
            Toast.show({
                type: "error",
                text1: "Login Failed",
                text2: err.message || "Something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 justify-center items-center px-6 bg-secondary">
            <Text className="text-2xl font-bold mb-10 text-white">Login</Text>

            <Controller
                name="email"
                control={control}
                defaultValue=""
                render={({ field: { onChange, value } }) => (
                    <>
                        <TextInput
                            className={`
                                border border-primary bg-white/10 text-[16px] text-white w-full pl-10 pr-6 pt-5 pb-6 font-bold  rounded-[30px]
                                ${errors.email ? "border-red-500 mb-2" : "border-primary mb-4"}
                                `}
                            placeholder="Email"
                            placeholderTextColor="#28487B"
                            onChangeText={onChange}
                            value={value}
                        />
                        {errors.email && (
                            <Text className="text-red-500 text-sm text-start w-full pl-5 mb-4">{errors.email.message}</Text>
                        )}
                    </>
                )}
            />

            <Controller
                name="password"
                control={control}
                defaultValue=""
                render={({ field: { onChange, value } }) => (
                    <>
                        <View className="relative w-full">
                            <TextInput
                                className={`
                                border border-primary bg-white/10 text-[16px] text-white w-full pl-10 pr-12 pt-5 pb-6 font-bold rounded-[30px]
                                ${errors.password ? "border-red-500 mb-2" : "border-primary mb-4"}`}
                                placeholder="Create Password"
                                placeholderTextColor="#28487B"
                                secureTextEntry={!showPassword}
                                onChangeText={onChange}
                                value={value}
                            />
                            <TouchableOpacity
                                className="absolute right-4 top-5"
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons
                                    name={showPassword ? "eye" : "eye-off"}
                                    size={24}
                                    color="#28487B"
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.password && (
                            <Text className="text-red-500 text-sm text-start w-full pl-5 mb-4">{errors.password.message}</Text>
                        )}
                    </>
                )}
            />

            <TouchableOpacity
                className="bg-primary w-[60%] border border-primary text-[16px] text-primary py-5 mb-4 mt-10 rounded-[30px] flex items-center justify-center"
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#ffffff" />
                ) : (
                    <Text className="text-white text-center text-lg font-bold">Login</Text>
                )}
            </TouchableOpacity>

            <View className="mt-10">
                <Text className="text-white/75 text-center text-base font-semibold">
                    Don't have an account?{" "}
                    <Text
                        className="text-primary font-bold"
                        onPress={() => router.push("/(auth)/signup")}
                    >
                        REGISTER
                    </Text>
                </Text>
                <Text className="text-white/75 mt-3 text-center text-base font-semibold">
                    Forgot Password?{" "}
                    <Text
                        className="text-primary font-bold"
                        onPress={() => router.push("/(auth)/forgotpassword")}
                    >
                        RESET
                    </Text>
                </Text>
            </View>
        </View>
    );
}
