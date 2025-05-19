/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff, Check, Circle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

export const forgotPassword = async (email: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to send confirmation code");
        }

        return await response.json();
    } catch (error: any) {
        throw new Error(error.message || "Failed to send confirmation code");
    }
};

export const resetPasswordConfirmationCode = async (email: string, confirmationCode: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/confirm-reset-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, confirmationCode }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to reset password confirmation code");
        }

        return await response.json();
    } catch (error: any) {
        throw new Error(error.message || "Failed to reset password confirmation code");
    }
};

export const resetPassword = async (email: string, newPassword: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, newPassword }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to reset password");
        }

        return await response.json();
    } catch (error: any) {
        throw new Error(error.message || "Failed to reset password");
    }
};

// Form schemas
const emailSchema = z.object({
    email: z.string().email({
        message: "Invalid email address",
    }),
});

const codeSchema = z.object({
    code: z.string().length(6, {
        message: "Verification code must be 6 digits",
    }),
});

const passwordSchema = z.object({
    newPassword: z.string()
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(/[0-9]/, { message: "Password must contain at least 1 number" })
        .regex(/[A-Z]/, { message: "Password must contain at least 1 uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least 1 lowercase letter" })
        .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least 1 special character" }),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

function ForgotPasswordPage() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const router = useRouter();

    // Forms
    const emailForm = useForm<z.infer<typeof emailSchema>>({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            email: "",
        },
    });

    const codeForm = useForm<z.infer<typeof codeSchema>>({
        resolver: zodResolver(codeSchema),
        defaultValues: {
            code: "",
        },
    });

    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    const [showPassword, setShowPassword] = useState(false);

    // Password strength checks
    const getPasswordChecks = (password: string, confirmPassword: string) => [
        {
            label: 'Minimum length: 8 characters',
            valid: password.length >= 8,
        },
        {
            label: 'At least 1 number (0-9)',
            valid: /[0-9]/.test(password),
        },
        {
            label: 'At least 1 uppercase letter (A-Z)',
            valid: /[A-Z]/.test(password),
        },
        {
            label: 'At least 1 lowercase letter (a-z)',
            valid: /[a-z]/.test(password),
        },
        {
            label: 'At least 1 special character',
            valid: /[^A-Za-z0-9]/.test(password),
        },
        {
            label: 'Passwords match',
            valid: password === confirmPassword && password.length > 0,
        },
    ];

    // Timer for resend code
    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const onSubmitEmail = async (data: z.infer<typeof emailSchema>) => {
        setLoading(true);
        try {
            await forgotPassword(data.email);
            setEmail(data.email);
            setStep(2);
            setTimer(60);
            toast.success("Code sent successfully", {
                description: "Please check your email for the confirmation code"
            });
        } catch (err: any) {
            toast.error("Failed to send code", {
                description: err.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setLoading(true);
        try {
            await forgotPassword(email);
            setTimer(60);
            toast.success("Code resent successfully", {
                description: "Please check your email for the new confirmation code"
            });
        } catch (err: any) {
            toast.error("Failed to resend code", {
                description: err.message
            });
        } finally {
            setLoading(false);
        }
    };

    const onVerifyCode = async (data: z.infer<typeof codeSchema>) => {
        setLoading(true);
        try {
            await resetPasswordConfirmationCode(email, data.code);
            setStep(3);
            toast.success("Code verified successfully", {
                description: "You can now create a new password"
            });
        } catch (err: any) {
            toast.error("Code verification failed", {
                description: err.message
            });
        } finally {
            setLoading(false);
        }
    };

    const onResetPassword = async (data: z.infer<typeof passwordSchema>) => {
        setLoading(true);
        try {
            await resetPassword(email, data.newPassword);
            toast.success("Password reset successfully", {
                description: "You can now log in with your new password"
            });
            router.push('/login');
        } catch (err: any) {
            toast.error("Password reset failed", {
                description: err.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background px-4">
            <div className="w-full max-w-md bg-white dark:bg-card rounded-xl shadow-lg p-8 space-y-8">
                <div className="flex flex-col items-center space-y-2">
                    <Image src="/logo.svg" alt="Logo" width={48} height={48} className="mb-2" />
                    <h1 className="text-2xl font-bold">
                        {step === 1 && "Forgot Password"}
                        {step === 2 && "Verify Code"}
                        {step === 3 && "Reset Password"}
                    </h1>
                    <p className="text-sm text-muted-foreground text-center">
                        {step === 1 && "Enter your email address and we'll send you a code to reset your password."}
                        {step === 2 && `We've sent a verification code to ${email}. Please enter it below.`}
                        {step === 3 && "Create a new password for your account."}
                    </p>
                </div>

                {/* Step 1: Email Form */}
                {step === 1 && (
                    <Form {...emailForm}>
                        <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-6">
                            <FormField
                                control={emailForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your email"
                                                type="email"
                                                autoComplete="email"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    setEmail(e.target.value);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send Code"}
                            </Button>

                            <div className="text-sm text-center">
                                <Link href="/login" className="text-primary hover:underline">
                                    Back to login
                                </Link>
                            </div>
                        </form>
                    </Form>
                )}

                {/* Step 2: Verification Code */}
                {step === 2 && (
                    <Form {...codeForm}>
                        <form onSubmit={codeForm.handleSubmit(onVerifyCode)} className="space-y-6 justify-center items-center">
                            <FormField
                                control={codeForm.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem className='w-full flex flex-col gap-3 justify-center items-center'>
                                        <FormLabel className='text-lg'>Verification Code</FormLabel>
                                        <FormControl>
                                            <InputOTP maxLength={6} {...field}>
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={0} />
                                                    <InputOTPSlot index={1} />
                                                    <InputOTPSlot index={2} />
                                                    <InputOTPSlot index={3} />
                                                    <InputOTPSlot index={4} />
                                                    <InputOTPSlot index={5} />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading || codeForm.watch("code")?.length !== 6}
                            >
                                {loading ? "Verifying..." : "Verify Code"}
                            </Button>

                            <div className="text-sm text-center">
                                {timer > 0 ? (
                                    <p className="text-muted-foreground">Resend code in {timer}s</p>
                                ) : (
                                    <Button
                                        variant="link"
                                        onClick={handleResendCode}
                                        disabled={loading}
                                        className="text-primary p-0"
                                    >
                                        Resend code
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Form>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onResetPassword)} className="space-y-6">
                            <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter new password"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    tabIndex={-1}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                                    onClick={() => setShowPassword((v) => !v)}
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Confirm new password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Password strength indicators */}
                            <div className="space-y-2">
                                {getPasswordChecks(
                                    passwordForm.watch("newPassword") || "",
                                    passwordForm.watch("confirmPassword") || ""
                                ).map((check, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        {check.valid ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Circle className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span className={`text-sm ${check.valid ? "text-green-500" : "text-muted-foreground"}`}>
                                            {check.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading || !passwordForm.formState.isValid}
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </Button>
                        </form>
                    </Form>
                )}
            </div>
        </div>
    )
}

export default ForgotPasswordPage
