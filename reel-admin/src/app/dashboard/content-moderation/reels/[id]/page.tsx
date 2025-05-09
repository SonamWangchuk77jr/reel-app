'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { FileTextIcon, TagIcon, CheckCircleIcon, ClockIcon, XCircleIcon, UserIcon, CalendarIcon, Edit3Icon, ArrowLeftIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getUser } from "@/lib/auth";
import { toast } from "sonner";

interface Reel {
    _id: string;
    title: string;
    description: string;
    video: string;
    category: string;
    likes: [],
    saves: [],
    status: string;
    userId: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
    likeCount: number;
    saveCount: number;
    id: string;
}

const getStatusVariant = (status: string | undefined) => {
    if (status === "pending") return "secondary"
    if (status === "approved") return "default"
    return "destructive"
}

const formatDateTime = (dateString: string | number | Date) => new Date(dateString).toLocaleString()

export default function ReelPage() {
    const { id } = useParams();

    const [reel, setReel] = useState<Reel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        const fetchReel = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reels/${id}`);
                if (!res.ok) throw new Error("Failed to fetch reel");
                const data = await res.json();
                setReel(data);
            } catch (err: unknown) {
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
            } finally {
                setLoading(false);
            }
        };
        fetchReel();
    }, [id]);

    const handleReelStatusChange = async (status: "approved" | "rejected") => {
        const userToken = getUser();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reels/${id}/status`, {
                method: "PATCH",
                headers: {
                    "accept": "*/*",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${userToken?.token}`,
                },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error(`Failed to ${status} reel`);
            const updatedReel = await res.json();
            setReel((prev) => prev ? { ...prev, status: updatedReel.status, updatedAt: updatedReel.updatedAt } : prev);
            toast.success(`Reel ${status} successfully`);
        } catch (err: unknown) {
            console.log(err);
            setError(
                err instanceof Error ? err.message : "An error occurred"
            );
            toast.error(err instanceof Error ? err.message : "An error occurred");
        }
    };

    if (loading) {
        return (
            <Card className="shadow-lg">
                <CardHeader className="gap-4">
                    <div className="flex items-center gap-3 mb-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-48" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-64 w-full mb-4" />
                    <div className="space-y-6">
                        <Skeleton className="h-6 w-32" />
                        <div className="grid grid-cols-1 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-destructive font-medium">{error}</div>
                    <div className="mt-4">
                        <Link href="/dashboard/content-moderation">
                            <Button size="sm">
                                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-lg">
            <CardHeader className="gap-4">
                <div className="flex items-center gap-3 mb-2">
                    <Link href="/dashboard/content-moderation">
                        <Button size="sm">
                            <ArrowLeftIcon className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <CardTitle className="text-2xl font-bold capitalize">
                        {reel?.title || 'Reel Details'}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {reel?.video ? (
                    <div>
                        <Label className="mb-2 block">Video Preview</Label>
                        <video
                            src={reel.video}
                            controls
                            className="w-full rounded-lg border border-muted shadow-sm bg-black"
                            style={{ maxHeight: 400 }}
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                ) : (
                    <div className="mb-4 text-destructive">No video available for this reel.</div>
                )}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">Reel Details</h2>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-start gap-3">
                            <FileTextIcon className="w-5 h-5 text-muted-foreground mt-1" />
                            <div>
                                <p className="text-sm text-muted-foreground">Description</p>
                                <p className="font-medium text-gray-900">{reel?.description || "—"}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex items-start gap-3 bg-muted p-2 rounded-md">
                                <TagIcon className="w-5 h-5 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Category</p>
                                    <p className="font-medium capitalize text-gray-900">{reel?.category || "—"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 bg-muted p-2 rounded-md">
                                {reel?.status === "approved" ? (
                                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1" />
                                ) : reel?.status === "pending" ? (
                                    <ClockIcon className="w-5 h-5 text-yellow-500 mt-1" />
                                ) : (
                                    <XCircleIcon className="w-5 h-5 text-red-500 mt-1" />
                                )}
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge variant={getStatusVariant(reel?.status)} className="capitalize">
                                        {reel?.status}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 bg-muted p-2 rounded-md">
                                <CalendarIcon className="w-5 h-5 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Created At</p>
                                    <p className="font-medium text-gray-900">{reel?.createdAt ? formatDateTime(reel.createdAt) : "—"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 bg-muted p-2 rounded-md">
                                <Edit3Icon className="w-5 h-5 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Updated At</p>
                                    <p className="font-medium text-gray-900">{reel?.updatedAt ? formatDateTime(reel.updatedAt) : "—"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <UserIcon className="w-5 h-5 text-muted-foreground mt-1" />
                            <div>
                                <p className="text-sm text-muted-foreground">User</p>
                                <p className="font-medium text-gray-900">{reel?.userId?.name || "—"}</p>
                                <p className="text-xs text-muted-foreground">{reel?.userId?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                {reel?.status === 'pending' && (
                    <div className="flex gap-4 w-full justify-start">
                        <Button onClick={() => handleReelStatusChange("approved")} variant="outline" className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white px-10">Approve</Button>
                        <Button onClick={() => handleReelStatusChange("rejected")} variant="outline" className="border-red-500 text-red-600 hover:bg-red-500 hover:text-white px-10">Reject</Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    );

}
