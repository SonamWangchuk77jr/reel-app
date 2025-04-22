import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Reel } from '@/types';
import { getReelByUserId } from '@/api/reels';

interface ReelsContextType {
    reels: Reel[];
    setReels: (reels: Reel[]) => void;
    refreshReels: (userId: string) => Promise<void>;
}

const ReelsContext = createContext<ReelsContextType | undefined>(undefined);

export const ReelsProvider = ({ children }: { children: ReactNode }) => {
    const [reels, setReels] = useState<Reel[]>([]);

    const refreshReels = async (userId: string) => {
        try {
            const fetchedReels = await getReelByUserId(userId);
            setReels(fetchedReels);
        } catch (error) {
            console.error('Error refreshing reels:', error);
        }
    };

    return (
        <ReelsContext.Provider value={{ reels, setReels, refreshReels }}>
            {children}
        </ReelsContext.Provider>
    );
};

export const useReels = () => {
    const context = useContext(ReelsContext);
    if (context === undefined) {
        throw new Error('useReels must be used within a ReelsProvider');
    }
    return context;
}; 