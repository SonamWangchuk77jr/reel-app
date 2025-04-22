import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import Checkbox from 'expo-checkbox';
import { useForm, Controller } from "react-hook-form";
import { router } from "expo-router";
import { yupResolver } from "@hookform/resolvers/yup";
import { signupSchema } from "@/schema/authSchema";
import React from "react";
import { signup } from "@/api/auth";
import Toast from "react-native-toast-message";
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen() {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(signupSchema),
    });
    const [loading, setLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);


    const onSubmit = async (data: { name: string; email: string; password: string }) => {
        setLoading(true);
        try {
            const result = await signup(data);
            Toast.show({
                type: "success",
                text1: "Registration Successful",
                text2: result.message,
            });
            // Navigate to onboarding screen after successful registration
            router.replace("/(auth)/onboarding");
        } catch (error: any) {
            if (error.response) {
                Toast.show({
                    type: "error",
                    text1: "Registration Failed",
                    text2: error.response.data.error,
                });
                console.log("Signup failed:", error.response.data.error);
            } else {
                console.log("Signup failed:", error.message);
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <View className="flex-1 justify-center items-center px-6 bg-secondary">
            <Text className="text-2xl font-bold mb-10 text-white">Register</Text>

            <Controller
                name="name"
                control={control}
                defaultValue=""
                render={({ field: { onChange, value } }) => (
                    <>
                        <TextInput
                            className={`
                                border border-primary bg-white/10 text-[16px] text-white w-full pl-10 pr-6 pt-5 pb-6 font-bold  rounded-[30px]
                                ${errors.email ? "border-red-500 mb-2" : "border-primary mb-4"}
                                `}
                            placeholder="Name"
                            placeholderTextColor="#28487B"
                            onChangeText={onChange}
                            value={value}
                        />
                        {errors.name && (
                            <Text className="text-red-500 text-sm text-start w-full pl-5 mb-4">{errors.name.message}</Text>
                        )}
                    </>

                )}
            />

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

            <Controller
                name="confirmPassword"
                control={control}
                defaultValue=""
                render={({ field: { onChange, value } }) => (
                    <>
                        <View className="relative w-full">
                            <TextInput
                                className={`
                                border border-primary bg-white/10 text-[16px] text-white w-full pl-10 pr-12 pt-5 pb-6 font-bold rounded-[30px]
                                ${errors.password ? "border-red-500 mb-2" : "border-primary mb-4"}`}
                                placeholder="Confirm Password"
                                placeholderTextColor="#28487B"
                                secureTextEntry={!showConfirmPassword}
                                onChangeText={onChange}
                                value={value}
                            />
                            <TouchableOpacity
                                className="absolute right-4 top-5"
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <Ionicons
                                    name={showConfirmPassword ? "eye" : "eye-off"}
                                    size={24}
                                    color="#28487B"
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.confirmPassword && (
                            <Text className="text-red-500 text-sm text-start w-full pl-5 mb-4">{errors.confirmPassword.message}</Text>
                        )}
                    </>
                )}
            />
            <Controller
                name="acceptTerms"
                control={control}
                defaultValue={false}
                render={({ field: { onChange, value } }) => (
                    <>
                        <View className="flex-row items-start px-5 py-2 w-full">
                            <Checkbox
                                value={value}
                                onValueChange={onChange}
                                color={value ? '#28487B' : undefined} // Tailwind primary
                                className="mr-3 mt-2"
                            />
                            <Text className="text-white/75 text-base font-semibold flex-1">
                                I agree to the{' '}
                                <Text className="text-primary font-bold">Terms and Conditions</Text> and{' '}
                                <Text className="text-primary font-bold">Privacy Policy</Text>
                            </Text>
                        </View>

                        {errors.acceptTerms && (
                            <Text className="text-red-500 text-sm text-start w-full px-5 mb-3">
                                {errors.acceptTerms.message}
                            </Text>
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
                    <Text className="text-white text-center text-lg font-bold">Sign Up</Text>
                )}
            </TouchableOpacity>


            <View className="mt-10">
                <Text className="text-white/75 text-center text-base font-semibold">
                    Already have an account?{" "}
                    <Text
                        className="text-primary font-bold"
                        onPress={() => router.push("/(auth)/login")}
                    >
                        LOGIN
                    </Text>
                </Text>
            </View>
        </View>
    );
}
