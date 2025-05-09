import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getSessionToken } from "@/lib/auth";

interface DeleteUserModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string | null;
    email?: string;
    onDeleted: () => void;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ open, onOpenChange, userId, email, onDeleted }) => {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!userId) return;
        setLoading(true);
        const token = getSessionToken();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error("Failed to delete user");
            toast.success("User deleted successfully");
            onDeleted();
            onOpenChange(false);
        } catch {
            toast.error("Failed to delete user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete User</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the user- <b>{email}</b>? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={loading}>Cancel</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteUserModal; 