"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { EpisodeRowActions } from "./episode-row-actions";
import { format } from "date-fns";

export type Episode = {
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
};

export const columns: ColumnDef<Episode>[] = [
    {
        accessorKey: "slNo",
        header: "SL No.",
        cell: ({ row }) => row.index + 1 || "-",
    },
    {
        accessorKey: "episodeName",
        header: "Episode Name",
        cell: ({ row }) => row.original.episodeName || "-",
    },
    {
        accessorKey: "createdBy",
        header: "Created By",
        cell: ({ row }) => row.original?.userId?.name || "-",
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => format(new Date(row.original.createdAt), "dd MMM yyyy") || "-",
    },
    {
        accessorKey: "status", header: "Status", cell: ({ row }) => row.original.status === "pending" ?
            <Badge variant="outline" className="bg-yellow-500 text-white">Pending</Badge> : row.original.status === "approved" ?
                <Badge variant="outline" className="bg-green-500 text-white">Approved</Badge> :
                <Badge variant="outline" className="bg-red-500 text-white">Rejected</Badge>
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <EpisodeRowActions row={row.original} />,
    },
];