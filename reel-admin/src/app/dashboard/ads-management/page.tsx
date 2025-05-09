'use client'

import React from 'react'
import AdsCard from './_components/ads-card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useState } from 'react';
import Link from 'next/link';

export interface AdsType {
    id: string;
    name: string;
    adsVideoUrl: string;
    points: number;
    createdAt: string;
    updatedAt: string;
}

const ads: AdsType[] = [
    {
        id: '1',
        name: 'Ad 1',
        adsVideoUrl: 'https://videos.pexels.com/video-files/28990235/12539585_2560_1440_30fps.mp4',
        points: 100,
        createdAt: '2021-01-01',
        updatedAt: '2021-01-01',
    },
    {
        id: '2',
        name: 'Ad 2',
        adsVideoUrl: 'https://videos.pexels.com/video-files/9329511/9329511-uhd_1440_2732_25fps.mp4',
        points: 200,
        createdAt: '2021-01-01',
        updatedAt: '2021-01-01',
    },
    {
        id: '3',
        name: 'Ad 3',
        adsVideoUrl: 'https://videos.pexels.com/video-files/30393112/13025095_1080_1920_24fps.mp4',
        points: 300,
        createdAt: '2021-01-01',
        updatedAt: '2021-01-01',
    },
    {
        id: '4',
        name: 'Ad 4',
        adsVideoUrl: 'https://videos.pexels.com/video-files/30393112/13025095_1080_1920_24fps.mp4',
        points: 400,
        createdAt: '2021-01-01',
        updatedAt: '2021-01-01',
    },
    {
        id: '5',
        name: 'Ad 1',
        adsVideoUrl: 'https://videos.pexels.com/video-files/28990235/12539585_2560_1440_30fps.mp4',
        points: 100,
        createdAt: '2021-01-01',
        updatedAt: '2021-01-01',
    },
    {
        id: '6',
        name: 'Ad 2',
        adsVideoUrl: 'https://videos.pexels.com/video-files/9329511/9329511-uhd_1440_2732_25fps.mp4',
        points: 200,
        createdAt: '2021-01-01',
        updatedAt: '2021-01-01',
    },
    {
        id: '7',
        name: 'Ad 3',
        adsVideoUrl: 'https://videos.pexels.com/video-files/30393112/13025095_1080_1920_24fps.mp4',
        points: 300,
        createdAt: '2021-01-01',
        updatedAt: '2021-01-01',
    },
    {
        id: '8',
        name: 'Ad 4',
        adsVideoUrl: 'https://videos.pexels.com/video-files/30393112/13025095_1080_1920_24fps.mp4',
        points: 400,
        createdAt: '2021-01-01',
        updatedAt: '2021-01-01',
    },
]

function AdsManagementPage() {
    const [playAd, setPlayAd] = useState<AdsType | null>(null);
    const [deleteAd, setDeleteAd] = useState<AdsType | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!deleteAd) return;
        setDeleting(true);
        // TODO: Replace with actual API call
        setTimeout(() => {
            setDeleting(false);
            setDeleteAd(null);
            // Optionally: refresh list or show toast
        }, 1000);
    };

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
                        key={ad.id}
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