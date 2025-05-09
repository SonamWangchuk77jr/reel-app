'use client'

import React, { useCallback, useEffect } from 'react'
import AdsCard from './_components/ads-card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useState } from 'react';
import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export interface AdsType {
    _id: string;
    name: string;
    adsVideoUrl: string;
    points: number;
    createdAt: string;
    updatedAt: string;
}



function AdsManagementPage() {
    const [ads, setAds] = useState<AdsType[]>([]);
    const [playAd, setPlayAd] = useState<AdsType | null>(null);
    const [deleteAd, setDeleteAd] = useState<AdsType | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [loading, setLoading] = useState(true);
    const user = getUser();

    const fetchAds = useCallback(async () => {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ads`, {
            headers: {
                'Authorization': `Bearer ${user?.token}`
            }
        });
        const data = await response.json();
        setAds(data);
        setLoading(false);
    }, [user?.token]);

    useEffect(() => {
        fetchAds();
    }, [fetchAds, user?.token]);

    console.log(ads);

    const handleDelete = async () => {
        if (!deleteAd) return;
        setDeleting(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ads/${deleteAd._id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${user?.token}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            toast.success('Ads deleted successfully');
            // Refresh ads list instead of reloading the page
            fetchAds();
        } else {
            toast.error(data.message);
        }
        setTimeout(() => {
            setDeleting(false);
            setDeleteAd(null);
        }, 1000);
    };

    if (loading) {
        return (
            <div>
                <div className='flex justify-between items-center  w-full rounded-lg shadow-lg border border-primary/30 md:mb-10 p-3'>
                    <h2 className=' text-xl font-bold'>Ads List</h2>
                    <Link href="/dashboard/ads-management/add">
                        <Button>Create Ad</Button>
                    </Link>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4 md:mt-8 mt-4'>
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="aspect-[1/1] w-full h-full rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    if (ads.length === 0) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <h2 className=' text-xl font-bold'>No ads found</h2>
            </div>
        )
    }

    return (
        <div>
            <div className='flex justify-between items-center  w-full rounded-lg shadow-lg border border-primary/30 md:mb-10 p-3'>
                <h2 className=' text-xl font-bold'>Ads List</h2>
                <Link href="/dashboard/ads-management/add">
                    <Button>Create Ad</Button>
                </Link>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 md:mt-8 mt-4'>
                {ads.map((ad) => (
                    <AdsCard
                        key={ad._id}
                        ad={ad}
                        onPlay={() => setPlayAd(ad)}
                        onDelete={() => setDeleteAd(ad)}
                    />
                ))}
            </div>

            {/* Play Dialog */}
            <Dialog open={!!playAd} onOpenChange={() => setPlayAd(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{playAd?.name}</DialogTitle>
                    </DialogHeader>
                    {playAd && (
                        <video src={playAd.adsVideoUrl} controls autoPlay={true} className="w-full h-[70vh] rounded" />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={!!deleteAd} onOpenChange={() => setDeleteAd(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Ad</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the ad <b>{deleteAd?.name}</b>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" disabled={deleting}>Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                            {deleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AdsManagementPage
