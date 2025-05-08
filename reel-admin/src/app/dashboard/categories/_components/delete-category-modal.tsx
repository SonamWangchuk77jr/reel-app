import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getSessionToken } from "@/lib/auth";

interface DeleteCategoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categoryId: string | null;
    categoryName?: string;
    onDeleted: () => void;
}

const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({ open, onOpenChange, categoryId, categoryName, onDeleted }) => {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!categoryId) return;
        setLoading(true);
        const token = getSessionToken();
        try {
            const res = await fetch(`http://localhost:5001/api/category/delete/${categoryId}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error("Failed to delete category");
            toast.success("Category deleted successfully");
            onDeleted();
            onOpenChange(false);
        } catch {
            toast.error("Failed to delete category");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Category</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the category <b>{categoryName}</b>? This action cannot be undone.
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

export default DeleteCategoryModal; 