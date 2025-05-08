import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getSessionToken } from "@/lib/auth";

interface UpdateCategoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categoryId: string | null;
    initialName?: string;
    onUpdated: () => void;
}

const UpdateCategoryModal: React.FC<UpdateCategoryModalProps> = ({ open, onOpenChange, categoryId, initialName, onUpdated }) => {
    const [name, setName] = useState(initialName || "");
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        setName(initialName || "");
    }, [initialName, open]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryId || !name.trim()) return;
        setLoading(true);
        const token = getSessionToken();
        try {
            const res = await fetch(`http://localhost:5001/api/category/update/${categoryId}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ name }),
            });
            if (!res.ok) throw new Error("Failed to update category");
            toast.success("Category updated successfully");
            onUpdated();
            onOpenChange(false);
        } catch {
            toast.error("Failed to update category");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Category</DialogTitle>
                    <DialogDescription>
                        Update the category name below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdate} className="space-y-4">
                    <Input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Category name"
                        disabled={loading}
                        required
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button" disabled={loading}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateCategoryModal; 