import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Reel } from '@/types';
import { getReelByUserId } from '@/api/reels';
import { useAuth } from '@/context/AuthContext';

interface ReelsContextType {
    reels: Reel[];
    setReels: (reels: Reel[]) => void;
    refreshReels: (userId: string) => Promise<void>;
    isLoading: boolean;
}

const ReelsContext = createContext<ReelsContextType | undefined>(undefined);

export const ReelsProvider = ({ children }: { children: ReactNode }) => {
    const [reels, setReels] = useState<Reel[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { token, refreshToken } = useAuth();

    const refreshReels = async (userId: string) => {
        if (!token) {
            console.error('No token available for refreshing reels');
            return;
        }

        setIsLoading(true);
        try {
            // Try to refresh the token first
            await refreshToken();

            // Then fetch the reels
            const fetchedReels = await getReelByUserId(token);
            setReels(fetchedReels);
        } catch (error) {
            console.error('Error refreshing reels:', error);
            // Don't throw the error further to prevent app crashes
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ReelsContext.Provider value={{ reels, setReels, refreshReels, isLoading }}>
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
