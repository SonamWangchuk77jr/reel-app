'use client'
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import type { ControllerRenderProps } from "react-hook-form";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


const formSchema = z.object({
    name: z.string().min(1, {
        message: "Name is required",
    }),
    point: z.number().min(100, {
        message: "Points is required",
    }),
    adsVideoUrl: z
        .instanceof(File, { message: "Ads video is required" })
        .refine(
            (file) =>
                !!file &&
                (
                    file.type === "video/mp4" ||
                    file.type === "video/quicktime" ||
                    file.name.endsWith(".mp4") ||
                    file.name.endsWith(".mov") ||
                    file.name.endsWith(".m4v")
                ),
            {
                message: "File must be .mp4, .mov, or .m4v video",
            }
        )
})

function AddAdsPage() {
    const [loading, setLoading] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            point: 0,
            adsVideoUrl: undefined
        }
    });

    // Advanced video upload UI hooks
    const [dragActive, setDragActive] = React.useState(false);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [fileInfo, setFileInfo] = React.useState<File | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const router = useRouter();
    React.useEffect(() => {
        if (fileInfo) {
            const url = URL.createObjectURL(fileInfo);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [fileInfo]);

    function handleDrop(
        e: React.DragEvent<HTMLDivElement>,
        field: ControllerRenderProps<z.infer<typeof formSchema>, "adsVideoUrl">
    ) {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setFileInfo(file);
            field.onChange(file);
        }
    }

    function handleFileChange(
        e: React.ChangeEvent<HTMLInputElement>,
        field: ControllerRenderProps<z.infer<typeof formSchema>, "adsVideoUrl">
    ) {
        const file = e.target.files?.[0];
        if (file) {
            setFileInfo(file);
            field.onChange(file);
        }
    }

    function handleRemove(field: ControllerRenderProps<z.infer<typeof formSchema>, "adsVideoUrl">) {
        setFileInfo(null);
        field.onChange(undefined);
        if (inputRef.current) inputRef.current.value = "";
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        // Simulate async action
        const user = getUser();
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('point', values.point.toString());
        formData.append('adsVideoUrl', values.adsVideoUrl);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ads`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${user?.token}`
            },
            body: formData
        });
        const data = await response.json();
        if (response.ok) {
            toast.success('Ads added successfully');
            router.push('/dashboard/ads-management');
        } else {
            toast.error(data.message);
        }
        setTimeout(() => {
            console.log(values);
            form.reset();
            setLoading(false);
        }, 1000);
    }

    return (
        <div>
            <div className="flex justify-start mb-2">
                <Link href="/dashboard/ads-management">
                    <Button variant="outline" className="px-20 py-5 text-center">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                </Link>

            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Add Ads</CardTitle>
                    <CardDescription>
                        Add a new ad to the list.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input type="text" placeholder="Ad Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="point"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Points</FormLabel>
                                            <Select
                                                onValueChange={val => field.onChange(Number(val))}
                                                value={field.value?.toString()}
                                                defaultValue={field.value?.toString()}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select Points" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0">Select Points</SelectItem>
                                                    <SelectItem value="100">100</SelectItem>
                                                    <SelectItem value="200">200</SelectItem>
                                                    <SelectItem value="300">300</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Advanced Video Upload UI */}
                                <div className="col-span-2">
                                    <FormField
                                        control={form.control}
                                        name="adsVideoUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ads Video File</FormLabel>
                                                <FormControl>
                                                    <div>
                                                        <div
                                                            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}
                                                            onClick={() => inputRef.current?.click()}
                                                            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                                                            onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                                                            onDrop={e => handleDrop(e, field)}
                                                        >
                                                            {previewUrl ? (
                                                                <video src={previewUrl} controls className="w-full max-h-48 rounded mb-2" />
                                                            ) : (
                                                                <>
                                                                    <span className="text-4xl mb-2">🎬</span>
                                                                    <span className="text-gray-500">Drag & drop a video file here, or click to select</span>
                                                                </>
                                                            )}
                                                            <input
                                                                ref={inputRef}
                                                                type="file"
                                                                accept="video/mp4,video/quicktime,video/mov,video/m4v"
                                                                className="hidden"
                                                                onChange={e => handleFileChange(e, field)}
                                                            />
                                                        </div>
                                                        {fileInfo && (
                                                            <div className="mt-2 flex flex-col gap-1 text-sm">
                                                                <span className="font-medium">{fileInfo.name}</span>
                                                                <span className="text-xs text-gray-500">{(fileInfo.size / 1024 / 1024).toFixed(2)} MB • {fileInfo.type}</span>
                                                                <Button type="button" className="bg-red-500 text-white mt-1 self-start" onClick={() => handleRemove(field)}>
                                                                    <X className="w-4 h-4" /> Remove
                                                                </Button>
                                                            </div>
                                                        )}
                                                        {loading && fileInfo && (
                                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                                <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Upload a video file for the ad. (supported format .mp4, .mov, .m4v)
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button className="px-20 py-5 text-center" type="submit" disabled={loading}>
                                    {loading ? "Saving..." : "Add Ad"}
                                </Button>
                            </div>
                        </form>
                    </FormProvider>
                </CardContent>
            </Card>
        </div>
    )
}

export default AddAdsPage;