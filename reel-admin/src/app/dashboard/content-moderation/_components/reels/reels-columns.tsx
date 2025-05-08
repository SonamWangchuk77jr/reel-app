"use client";
import { ColumnDef } from "@tanstack/react-table";
import { ReelRowActions } from "./reel-row-actions";
import { Badge } from "@/components/ui/badge";

export type Reel = {
    _id: string;
    id: string;
    title: string;
    description: string;
    video: string;
    category: string;
    likes: unknown[];
    saves: unknown[];
    status: "pending" | "approved" | "rejected";
    userId: {
        _id: string;
        name: string;
        email: string;
    } | null;
    createdAt: string;
    updatedAt: string;
    __v: number;
    likeCount: number;
    saveCount: number;
};

export const columns: ColumnDef<Reel>[] = [
    { accessorKey: "title", header: "Title" },
    {
        accessorKey: "userId.name",
        header: "Creator",
        cell: ({ row }) => row.original.userId?.name || "-",
    },
    {
        accessorKey: "status", header: "Status", cell: ({ row }) => row.original.status === "pending" ?
            <Badge variant="outline" className="bg-yellow-500 text-white">Pending</Badge> : row.original.status === "approved" ?
                <Badge variant="outline" className="bg-green-500 text-white">Approved</Badge> :
                <Badge variant="outline" className="bg-red-500 text-white">Rejected</Badge>
    },
    { accessorKey: "category", header: "Category" },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <ReelRowActions row={row.original} />,
    },
];