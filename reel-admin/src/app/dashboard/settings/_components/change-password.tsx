"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { getUser } from "@/lib/auth"
import { toast } from "sonner"
import React, { useState } from "react"

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
import { useRouter } from "next/navigation"

const formSchema = z.object({
    oldPassword: z.string().min(1, {
        message: "Old password must be at least 8 characters.",
    }),
    newPassword: z.string()
        .min(8, { message: "New password must be at least 8 characters." })
        .regex(/[A-Z]/, { message: "Password must include at least one uppercase letter." })
        .regex(/[a-z]/, { message: "Password must include at least one lowercase letter." })
        .regex(/[0-9]/, { message: "Password must include at least one number." })
        .regex(/[^A-Za-z0-9]/, { message: "Password must include at least one special character." }),
})

export function ChangePassword() {
    const router = useRouter()
    const [loading, setLoading] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            oldPassword: "",
            newPassword: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const user = getUser();
            const response = await fetch("http://localhost:5001/api/auth/change-password", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user?.token}`,
                    "Accept": "*/*",
                },
                body: JSON.stringify(values),
            });
            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.error || "Failed to change password");
                setLoading(false);
                return;
            }
            sessionStorage.removeItem('user');
            router.push('/login');
            toast.success("Password changed successfully");
            form.reset();
        } catch {
            toast.error("Failed to change password");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="oldPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Old Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="********" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="********" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button className="w-[200px]" type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
            </form>
        </Form>
    )
}
