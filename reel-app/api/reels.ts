import axios from "axios";

const baseURL = process.env.EXPO_PUBLIC_API_URL;

export interface Reel {
    category: string;
    _id: string;
    title: string;
    description: string;
    video: string;
    likeCount: number;
    saveCount: number;
    status: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        profilePicture: string;
    };
    createdAt: string;
    updatedAt: string;
    likes: string[];
    saves: string[];
}

export const getApprovedReels = async (token: string): Promise<Reel[]> => {
    try {
        const response = await axios.get(`${baseURL}/api/reels/approved`, {
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch approved reels");
    }
};

export const createReel = async (
    token: string,
    formData: FormData
): Promise<any> => {
    try {
        const response = await axios.post(`${baseURL}/api/reels/create`, formData, {
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to create reel");
    }
};


export const getReelByUserId = async ( token: any): Promise<Reel[]> => {
    try {
        const response = await axios.get(`${baseURL}/api/reels/user`,
            {
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get reel by user ID");
    }
};

export const getReelById = async (reelId: string): Promise<Reel> => {
    try {
        const response = await axios.get(`${baseURL}/api/reels/${reelId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get reel");
    }
};

//toggle like
export const toggleLike = async (token: string, reelId: string): Promise<void> => {
    try {
        const response = await fetch(`${baseURL}/api/reels/${reelId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to like reel');
        }
    } catch (error: any) {
        throw new Error(error.message || 'Failed to like reel');
    }
};

export const hasLiked = async (token: string, reelId: string): Promise<boolean> => {
    try {
        const response = await fetch(`${baseURL}/api/reels/${reelId}/liked-check`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to check like status');
        }
        
        const data = await response.json();
        return data.hasLiked;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to check like status');
    }
};

// toggle save
export const toggleSave = async (token: string, reelId: string): Promise<void> => {
    try {
        const response = await fetch(`${baseURL}/api/reels/${reelId}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save reel');
        }
    } catch (error: any) {
        throw new Error(error.message || 'Failed to save reel');
    }
};

export const hasSaved = async (token: string, reelId: string): Promise<boolean> => {
    try {
        const response = await fetch(`${baseURL}/api/reels/${reelId}/saved-check`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to check save status');
        }
        
        const data = await response.json();
        return data.hasSaved;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to check save status');
    }
};

