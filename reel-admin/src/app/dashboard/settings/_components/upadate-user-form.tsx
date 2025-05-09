"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import React, { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

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
import { getAuthUser, getUser } from "@/lib/auth"
import { toast } from "sonner"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Invalid email address.",
    }),
    profilePicture: z
        .instanceof(File)
        .optional()
})

interface UserType {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    profilePicture: string;
}

export function UpdateUserForm() {
    const [userData, setUserData] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const userToken = getUser();


    console.log('user data: ====>', userData)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: userData?.name || "",
            email: userData?.email || "",
            profilePicture: undefined,
        },
    });

    useEffect(() => {
        async function fetchUser() {
            const userData = await getAuthUser();
            const user = userData as unknown as UserType;
            setUserData(user)
        }
        fetchUser();
    }, []);

    useEffect(() => {
        if (userData) {
            form.reset({
                name: userData.name || "",
                email: userData.email || "",
                profilePicture: undefined,
            });
        }
    }, [userData, form]);

    useEffect(() => {
        if (userData?.profilePicture) {
            setPreview(userData.profilePicture);
        }
    }, [userData]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setErrorMsg(null);
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("email", values.email);
        if (values.profilePicture !== undefined) {
            formData.append("profilePicture", values.profilePicture);
        }

        try {
            setLoading(true);
            const response = await fetch("http://localhost:5001/api/auth/profile", {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${userToken?.token}`,
                    "Accept": "*/*",
                },
                body: formData,
            });

            if (!response.ok) {
                setLoading(false);
                setErrorMsg("Failed to update profile");
                throw new Error("Failed to update profile");
            }

            const data = await response.json();
            console.log("Profile updated:", data);
            window.location.reload()
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error(error);
            setErrorMsg("Failed to update profile");
        } finally {
            setLoading(false);
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, onChange: (file: File | undefined) => void) {
        const file = e.target.files ? e.target.files[0] : undefined;
        if (file) {
            const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
            if (!allowedTypes.includes(file.type)) {
                setErrorMsg("Accepted: JPG, PNG, GIF. Max size: 2MB.");
                return;
            }
            if (file.size > 2 * 1024 * 1024) { // 2MB
                setErrorMsg("Accepted: JPG,JPEG, PNG, GIF. Max size: 2MB.");
                return;
            }
            setPreview(URL.createObjectURL(file));
        }
        setErrorMsg(null);
        onChange(file);
    }

    function handleReset() {
        if (userData) {
            form.reset({
                name: userData.name || "",
                email: userData.email || "",
                profilePicture: undefined,
            });
            setPreview(userData.profilePicture || null);
            setErrorMsg(null);
        }
    }

    if (!userData) {
        return (
            <div className="flex flex-col gap-6  h-60 w-full">
                <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
                    <Skeleton className="h-10 w-full md:w-1/2" />
                    <Skeleton className="h-10 w-full md:w-1/2" />
                </div>
                <div className="flex gap-2 items-center">
                    <Skeleton className="h-24 w-24 rounded-full mt-4" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        );
    }



    return (
        <div >
            <div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-md">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your name" {...field} disabled={loading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your email" {...field} disabled={loading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div>
                            <FormLabel className="mb-2 block">Profile Picture</FormLabel>
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-full overflow-hidden border bg-muted flex items-center justify-center">
                                    {preview ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={preview} alt="Profile Preview" className="object-cover w-full h-full" />
                                    ) : (
                                        <span className="text-xs text-muted-foreground">No Image</span>
                                    )}
                                </div>
                                <FormField
                                    control={form.control}
                                    name="profilePicture"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input
                                                    id="profilePicture"
                                                    type="file"
                                                    accept="image/*"
                                                    disabled={loading}
                                                    onChange={e => handleFileChange(e, field.onChange)}
                                                />
                                            </FormControl>
                                            <p className="text-xs text-muted-foreground mt-1">Accepted: JPG, PNG, GIF. Max size: 2MB.</p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        {errorMsg && <div className="text-red-500 text-sm mt-2">{errorMsg}</div>}
                        <div className="flex gap-4 mt-6">
                            <Button className="w-[120px]" type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save"
                                )}
                            </Button>
                            <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}
