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

interface Episode {
    _id: string;
    episodeNumber: number;
    episodeName: string;
    description: string;
    caption: string;
    videoUrl: string;
    likes: string[];
    saves: string[];
    userId: {
        _id: string;
        name: string;
        email: string;
    };
    status: string;
    reelId: {
        _id: string;
        title: string;
        description: string;
    };
    createdAt: string;
    updatedAt: string;
    __v: number;
}

const getStatusVariant = (status: string | undefined) => {
    if (status === "pending") return "secondary"
    if (status === "approved") return "default"
    return "destructive"
}

const formatDateTime = (dateString: string | number | Date) => new Date(dateString).toLocaleString()

export default function EpisodePage() {
    const { id } = useParams();

    const [episode, setEpisode] = useState<Episode | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        const fetchReel = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/episodes/${id}`);
                if (!res.ok) throw new Error("Failed to fetch episode");
                const data = await res.json();
                setEpisode(data);
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

    const handleEpisodeStatusChange = async (status: "approved" | "rejected") => {
        const userToken = getUser();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/episodes/${id}/status`, {
                method: "PATCH",
                headers: {
                    "accept": "*/*",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${userToken?.token}`,
                },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error(`Failed to ${status} episode`);
            const updatedEpisode = await res.json();
            setEpisode((prev) => prev ? { ...prev, status, updatedAt: updatedEpisode.updatedAt } : prev);
            toast.success(`Episode ${status} successfully`);
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
                            <Button variant="secondary" size="sm">Back</Button>
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
                        {episode?.episodeName || 'Episode Details'}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {episode?.videoUrl ? (
                    <div>
                        <Label className="mb-2 block">Video Preview</Label>
                        <video
                            src={episode.videoUrl}
                            controls
                            className="w-full rounded-lg border border-muted shadow-sm bg-black"
                            style={{ maxHeight: 400 }}
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                ) : (
                    <div className="mb-4 text-destructive">No video available for this episode.</div>
                )}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">Episode Details</h2>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-start gap-3">
                            <FileTextIcon className="w-5 h-5 text-muted-foreground mt-1" />
                            <div>
                                <p className="text-sm text-muted-foreground">Description</p>
                                <p className="font-medium text-gray-900">{episode?.description || "—"}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex items-start gap-3 bg-muted p-2 rounded-md">
                                <TagIcon className="w-5 h-5 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Category</p>
                                    <p className="font-medium capitalize text-gray-900">{episode?.reelId?.title || "—"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 bg-muted p-2 rounded-md">
                                {episode?.status === "approved" ? (
                                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1" />
                                ) : episode?.status === "pending" ? (
                                    <ClockIcon className="w-5 h-5 text-yellow-500 mt-1" />
                                ) : (
                                    <XCircleIcon className="w-5 h-5 text-red-500 mt-1" />
                                )}
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge variant={getStatusVariant(episode?.status)} className="capitalize">
                                        {episode?.status}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 bg-muted p-2 rounded-md">
                                <CalendarIcon className="w-5 h-5 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Created At</p>
                                    <p className="font-medium text-gray-900">{episode?.createdAt ? formatDateTime(episode.createdAt) : "—"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 bg-muted p-2 rounded-md">
                                <Edit3Icon className="w-5 h-5 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Updated At</p>
                                    <p className="font-medium text-gray-900">{episode?.updatedAt ? formatDateTime(episode.updatedAt) : "—"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <UserIcon className="w-5 h-5 text-muted-foreground mt-1" />
                            <div>
                                <p className="text-sm text-muted-foreground">User</p>
                                <p className="font-medium text-gray-900">{episode?.userId?.name || "—"}</p>
                                <p className="text-xs text-muted-foreground">{episode?.userId?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                {episode?.status === 'pending' && (
                    <div className="flex gap-4 w-full justify-start">
                        <Button variant="outline" onClick={() => handleEpisodeStatusChange("approved")} className="border-green-500 px-10 text-green-600 hover:bg-green-500 hover:text-white">Approve</Button>
                        <Button variant="outline" onClick={() => handleEpisodeStatusChange("rejected")} className="border-red-500 px-10 text-red-600 hover:bg-red-500 hover:text-white">Reject</Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    );

}
