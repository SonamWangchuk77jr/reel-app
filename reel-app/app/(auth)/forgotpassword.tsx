import { forgotPassword, resetPasswordConfirmationCode, resetPassword } from "@/api/auth";
import { forgotPasswordSchema } from "@/schema/authSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState, useRef, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { View, Text, TextInput, SafeAreaView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import Toast from "react-native-toast-message";

function maskEmail(email: string) {
    if (!email) return "";
    const [user, domain] = email.split("@");
    if (!user || !domain) return email;
    const maskedUser = user.length <= 2 ? user[0] + "*" : user.slice(0, 2) + "*".repeat(user.length - 2);
    return `${maskedUser}@${domain}`;
}

export default function ForgotPassword() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(60);
    const codeInputs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

    // Step 1: Email form
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(forgotPasswordSchema),
    });

    // Step 3: New password form
    const {
        control: controlStep3,
        handleSubmit: handleSubmitStep3,
        formState: { errors: errorsStep3 },
        watch: watchStep3,
    } = useForm();
    const newPassword = watchStep3('newPassword', '');
    const confirmPassword = watchStep3('confirmPassword', '');

    // Password requirements
    const passwordChecks = [
        {
            label: 'Minimum length: 8 characters.',
            valid: newPassword.length >= 8,
        },
        {
            label: 'At least 1 number (0-9)',
            valid: /[0-9]/.test(newPassword),
        },
        {
            label: 'At least 1 uppercase (A-Z) & 1 lowercase (a-z)',
            valid: /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword),
        },
        {
            label: 'At least 1 special character (e.g., @, #, $, %)',
            valid: /[^A-Za-z0-9]/.test(newPassword),
        },
    ];
    const allValid = passwordChecks.every(c => c.valid) && newPassword === confirmPassword && newPassword.length > 0;

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const onSubmitEmail = async (data: any) => {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            await forgotPassword(data.email);
            setEmail(data.email);
            setStep(2);
            setTimer(60);
            setCode(["", "", "", "", "", ""]);
            Toast.show({
                type: "success",
                text1: "Code Sent Successfully",
                text2: "Please check your email for the code.",
            });
        } catch (err: any) {
            setError(err.message);
            Toast.show({
                type: "error",
                text1: "Code Sending Failed",
                text2: err.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const onResendCode = async () => {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            await forgotPassword(email);
            setTimer(60);
            setCode(["", "", "", "", "", ""]);
            Toast.show({
                type: "success",
                text1: "Code Sent Successfully",
                text2: "Please check your email for the code.",
            });
        } catch (err: any) {
            setError(err.message);
            Toast.show({
                type: "error",
                text1: "Code Sending Failed",
                text2: err.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const onVerifyCode = async () => {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const codeStr = code.join("");
            await resetPasswordConfirmationCode(email, codeStr);
            setStep(3);
            Toast.show({
                type: "success",
                text1: "Code Verified Successfully",
                text2: "You can now create a new password.",
            });
        } catch (err: any) {
            setError(err.message);
            Toast.show({
                type: "error",
                text1: "Code Verification Failed",
                text2: err.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const onSubmitNewPassword = async (data: any) => {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            await resetPassword(email, data.newPassword);
            Toast.show({
                type: "success",
                text1: "Password Reset Successfully",
                text2: "You can now log in with your new password.",
            });
            router.push('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCodeChange = (text: string, idx: number) => {
        if (!/^[0-9]?$/.test(text)) return;
        const newCode = [...code];
        newCode[idx] = text;
        setCode(newCode);
        if (text && idx < 5) {
            // @ts-ignore
            codeInputs[idx + 1].current?.focus();
        }
        if (!text && idx > 0) {
            // @ts-ignore
            codeInputs[idx - 1].current?.focus();
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-secondary">
            <View className="flex-1 justify-start items-center gap-4 px-6 mt-20">
                {step === 1 && (
                    <>
                        <Text className="text-2xl font-bold mb-10 text-white">Forgotten Password</Text>
                        <Text className="text-sm mb-6 text-white text-start">Enter the email address with your account and we'll send a code with confirmation to reset your password.</Text>
                        <Controller
                            name="email"
                            control={control}
                            defaultValue=""
                            render={({ field: { onChange, value } }) => (
                                <>
                                    <TextInput
                                        className={`border border-primary bg-white/10 text-[16px] text-white w-full pl-10 pr-6 pt-5 pb-6 font-bold  rounded-[30px] ${errors.email ? "border-red-500 mb-2" : "border-primary mb-4"}`}
                                        placeholder="Email"
                                        placeholderTextColor="#28487B"
                                        onChangeText={onChange}
                                        value={value}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                    {errors.email && (
                                        <Text className="text-red-500 text-sm text-start w-full pl-5 mb-4">{errors.email.message}</Text>
                                    )}
                                </>
                            )}
                        />
                        {error ? <Text className="text-red-500 mb-2 text-start bg-red-100 py-3 w-full rounded-lg p-2">{error}</Text> : null}
                        {success ? <Text className="text-green-500 mb-2 text-center">{success}</Text> : null}
                        <View className="w-full mt-4">
                            <TouchableOpacity
                                onPress={handleSubmit(onSubmitEmail)}
                                className="bg-primary rounded-[30px]"
                                style={{ overflow: 'hidden' }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" style={{ padding: 12 }} />
                                ) : (
                                    <Text className="text-white text-center py-4  font-bold text-lg">
                                        Send Code
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                )}
                {step === 2 && (
                    <>
                        <Text className="text-2xl font-bold mb-10 text-white text-center">Code Verification</Text>
                        <Text className="text-sm mb-6 text-white text-center">We have sent a code to {maskEmail(email)}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 24 }}>
                            {code.map((digit, idx) => (
                                <TextInput
                                    key={idx}
                                    ref={codeInputs[idx]}
                                    value={digit}
                                    onChangeText={text => handleCodeChange(text, idx)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    style={{
                                        width: 40,
                                        height: 48,
                                        borderBottomWidth: 2,
                                        borderColor: '#fff',
                                        marginHorizontal: 8,
                                        textAlign: 'center',
                                        fontSize: 28,
                                        color: '#fff',
                                        backgroundColor: 'transparent',
                                    }}
                                    returnKeyType={idx === 5 ? 'done' : 'next'}
                                />
                            ))}
                        </View>
                        <Text className="text-white text-center mb-6">
                            {timer > 0 ? (
                                <>Send code again <Text className="font-bold">00:{timer.toString().padStart(2, '0')}</Text></>
                            ) : (
                                <TouchableOpacity onPress={onResendCode} disabled={loading} style={{}}>
                                    {loading ? (
                                        <ActivityIndicator color="#4F7CAC" style={{ marginLeft: 8 }} />
                                    ) : (
                                        <Text className="font-bold" style={{ color: '#4F7CAC' }}>Resend</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        </Text>
                        {error ? <Text className="text-red-500 mb-2 text-center">{error}</Text> : null}
                        <View className="w-full mt-4">
                            <TouchableOpacity
                                onPress={onVerifyCode}
                                className="bg-primary rounded-[30px]"
                                style={{ overflow: 'hidden' }}
                                disabled={loading || code.some(d => d === "")}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" style={{ padding: 12 }} />
                                ) : (
                                    <Text className="text-white text-center py-4 font-bold text-lg">
                                        Verify
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                )}
                {step === 3 && (
                    <>
                        <Text className="text-2xl font-bold mb-6 text-white text-center">Create New Password</Text>
                        <Text className="text-base mb-8 text-white text-center">The password should be different from the previous password</Text>
                        <Controller
                            name="newPassword"
                            control={controlStep3}
                            defaultValue=""
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    className="w-full border-2 border-[#3A4A5D] rounded-[30px] px-6 py-5 mb-4 text-lg text-white bg-transparent"
                                    placeholder="New Password"
                                    placeholderTextColor="#4F7CAC"
                                    onChangeText={onChange}
                                    value={value}
                                    secureTextEntry
                                    autoCapitalize="none"
                                />
                            )}
                        />
                        <Controller
                            name="confirmPassword"
                            control={controlStep3}
                            defaultValue=""
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    className="w-full border-2 border-[#3A4A5D] rounded-[30px] px-6 py-5 mb-4 text-lg text-white bg-transparent"
                                    placeholder="Confirm Password"
                                    placeholderTextColor="#4F7CAC"
                                    onChangeText={onChange}
                                    value={value}
                                    secureTextEntry
                                    autoCapitalize="none"
                                />
                            )}
                        />
                        <View className="w-full mb-8 mt-2">
                            {passwordChecks.map((check, idx) => (
                                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                    <Ionicons name="checkmark-circle" size={18} color={check.valid ? '#00FF47' : '#4F7CAC'} style={{ marginRight: 8 }} />
                                    <Text style={{ color: check.valid ? '#00FF47' : '#4F7CAC', fontSize: 14 }}>{check.label}</Text>
                                </View>
                            ))}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                <Ionicons name="checkmark-circle" size={18} color={newPassword === confirmPassword && newPassword.length > 0 ? '#00FF47' : '#4F7CAC'} style={{ marginRight: 8 }} />
                                <Text style={{ color: newPassword === confirmPassword && newPassword.length > 0 ? '#00FF47' : '#4F7CAC', fontSize: 14 }}>Passwords match</Text>
                            </View>
                        </View>
                        {error ? <Text className="text-red-500 mb-2 text-center">{error}</Text> : null}
                        {success ? <Text className="text-green-500 mb-2 text-center">{success}</Text> : null}
                        <View className="w-full mt-4">
                            <TouchableOpacity
                                onPress={handleSubmitStep3(onSubmitNewPassword)}
                                className="bg-primary rounded-[30px]"
                                style={{ overflow: 'hidden', opacity: allValid ? 1 : 0.5 }}
                                disabled={loading || !allValid}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" style={{ padding: 12 }} />
                                ) : (
                                    <Text className="text-white text-center py-4 font-bold text-lg">
                                        Reset Password
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}