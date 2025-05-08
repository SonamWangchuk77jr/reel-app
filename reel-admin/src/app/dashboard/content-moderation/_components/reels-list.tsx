"use client";
import { useEffect, useState } from "react";
import { Reel, columns } from "./reels/reels-columns";
import { DataTable } from "./reels/reels-data-table";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReelsList() {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const [data, setData] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        setLoading(true);
        fetch(`${baseUrl}/api/reels`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch reels");
                return res.json();
            })
            .then((json) => {
                setData(json);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [baseUrl]);

    // Filtered data
    const filteredData = data.filter((reel) => {
        const matchesSearch = reel.title.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = status ? reel.status === status : true;
        return matchesSearch && matchesStatus;
    });

    if (loading) return (
        <div className="space-y-2">
            <div className="flex gap-2 mb-4">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-9 w-36" />
            </div>
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        </div>
    );
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <div className="flex gap-2 mb-4">
                <Input
                    type="text"
                    placeholder="Search by title"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="min-w-[140px] justify-between">
                            {status ? status.charAt(0).toUpperCase() + status.slice(1) : "All Statuses"}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuLabel>Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => setStatus("")}>All Statuses</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatus("pending")}>Pending</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatus("approved")}>Approved</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatus("rejected")}>Rejected</DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <DataTable columns={columns} data={filteredData} />
        </div>
    );
}