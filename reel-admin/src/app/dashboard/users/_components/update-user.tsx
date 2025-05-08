import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getSessionToken } from "@/lib/auth";

interface UpdateUserModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string | null;
    initialName?: string;
    initialEmail?: string;
    onUpdated: () => void;
}

const UpdateUserModal: React.FC<UpdateUserModalProps> = ({ open, onOpenChange, userId, initialName, initialEmail, onUpdated }) => {
    const [name, setName] = useState(initialName || "");
    const [email, setEmail] = useState(initialEmail || "");
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        setName(initialName || "");
        setEmail(initialEmail || "");
    }, [initialName, initialEmail, open]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !name.trim()) return;
        setLoading(true);
        const token = getSessionToken();
        try {
            const res = await fetch(`http://localhost:5001/api/users/${userId}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ name, email }),
            });
            if (!res.ok) throw new Error("Failed to update user");
            toast.success("User updated successfully");
            onUpdated();
            onOpenChange(false);
        } catch {
            toast.error("Failed to update user");
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
                        Update the user name below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdate} className="space-y-4">
                    <Input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Name"
                        disabled={loading}
                        required
                    />
                    <Input
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email"
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

export default UpdateUserModal; 