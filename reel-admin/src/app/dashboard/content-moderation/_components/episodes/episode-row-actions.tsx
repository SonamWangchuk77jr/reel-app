"use client";
import { MoreHorizontal, Trash2, CheckCircle, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Episode } from "./episode-columns";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { getUser } from "@/lib/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EpisodeRowActionsProps {
    row: Episode;
}

export function EpisodeRowActions({ row }: EpisodeRowActionsProps) {
    const userToken = getUser();
    const [dialog, setDialog] = useState<null | "approve" | "reject" | "delete">(null);
    const router = useRouter();
    const handleAction = async (action: "approve" | "reject" | "delete") => {
        let url = "";
        let options: RequestInit = {};
        if (action === "approve") {
            url = `${process.env.NEXT_PUBLIC_API_URL}/api/episodes/${row._id}/status`;
            options = {
                method: "PATCH",
                headers: {
                    "accept": "*/*",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${userToken?.token}`,
                },
                body: JSON.stringify({ status: "approved" }),
            };
        } else if (action === "reject") {
            url = `${process.env.NEXT_PUBLIC_API_URL}/api/episodes/${row._id}/status`;
            options = {
                method: "PATCH",
                headers: {
                    "accept": "*/*",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${userToken?.token}`,
                },
                body: JSON.stringify({ status: "rejected" }),
            };
        } else if (action === "delete") {
            url = `${process.env.NEXT_PUBLIC_API_URL}/api/episodes/${row._id}`;
            options = {
                method: "DELETE",
                headers: {
                    "accept": "*/*",
                    "Authorization": `Bearer ${userToken?.token}`,
                },
            };
        }

        try {
            const res = await fetch(url, options);
            if (!res.ok) throw new Error("Failed to perform action");

            // Only show success toast and refresh data if the action succeeded
            if (action === "approve") {
                toast.success("Reel approved successfully");
            } else if (action === "reject") {
                toast.success("Reel rejected successfully");
            } else if (action === "delete") {
                toast.success("Reel deleted successfully");
            }
        } catch (error) {
            console.log(error);
            if (action === "approve") {
                toast.error("Failed to approve reel");
            } else if (action === "reject") {
                toast.error("Failed to reject reel");
            } else if (action === "delete") {
                toast.error("Failed to delete reel");
            }
        } finally {
            setDialog(null);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="space-y-2 p-3">
                {row.status === "pending" && (
                    <>
                        <DropdownMenuItem onClick={() => setDialog("approve")}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDialog("reject")}>
                            <XCircle className="mr-2 h-4 w-4 text-yellow-500" /> Reject
                        </DropdownMenuItem>
                    </>
                )}
                <DropdownMenuItem onClick={() => router.push(`/dashboard/content-moderation/episodes/${row._id}`)}>
                    <Eye className="mr-2 h-4 w-4 text-blue-500" /> View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDialog("delete")}>
                    <Trash2 className="mr-2 h-4 w-4 text-red-500" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>

            {/* Approve Dialog */}
            <Dialog open={dialog === "approve"} onOpenChange={open => !open && setDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Episode</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to approve <b>{row.episodeName}</b>?</p>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button variant="default" onClick={() => handleAction("approve")}>Approve</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={dialog === "reject"} onOpenChange={open => !open && setDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Episode</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to reject <b>{row.episodeName}</b>?</p>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={() => handleAction("reject")}>Reject</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={dialog === "delete"} onOpenChange={open => !open && setDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Episode</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete <b>{row.episodeName}</b>? This action cannot be undone.</p>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={() => handleAction("delete")}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DropdownMenu>
    );
}