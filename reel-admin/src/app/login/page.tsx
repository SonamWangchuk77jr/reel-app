"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const formSchema = z.object({
    email: z.string().email({
        message: "Invalid email address",
    }),
    password: z.string().min(1, {
        message: "Password is required",
    }),
})

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const router = useRouter();

    useEffect(() => {
        // If already logged in as Admin, redirect to dashboard
        const userStr = typeof window !== 'undefined' ? sessionStorage.getItem('user') : null;
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.user && user.user.role === 'Admin') {
                    toast.success('Logged in successfully');
                    router.push('/dashboard');
                }
            } catch { }
        }
    }, [router]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        // Trim values
        const payload = {
            email: values.email.trim(),
            password: values.password.trim(),
        };
        console.log("Submitting login:", payload);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': '*/*',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error('Login failed', {
                    description: errorData.error,
                });
                setLoading(false);
                return;
            }

            const data = await response.json();

            // Check if user is Admin
            if (data.user?.role !== "Admin") {
                toast.error('Login failed', {
                    description: 'Invalid credentials',
                });
                setLoading(false);
                return;
            }

            // Store all user response data in sessionStorage
            sessionStorage.setItem('user', JSON.stringify(data));

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (error) {
            alert('An error occurred during login.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background px-4">
            <div className="w-full max-w-md bg-white dark:bg-card rounded-xl shadow-lg p-8 space-y-8">
                <div className="flex flex-col items-center space-y-2">
                    <Image src="/logo.svg" alt="Logo" width={48} height={48} className="mb-2" />
                    <h1 className="text-2xl font-bold">Sign in to your account</h1>
                    <p className="text-sm text-muted-foreground">Welcome back! Please enter your details.</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your email" type="email" autoComplete="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter your password"
                                                autoComplete="current-password"
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
                                    <div className="flex justify-end mt-1">
                                        <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                    Signing in...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>
                </Form>

            </div>
        </div>
    )
}
