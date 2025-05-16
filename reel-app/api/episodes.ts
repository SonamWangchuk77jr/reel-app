import axios from "axios";

const baseURL = process.env.EXPO_PUBLIC_API_URL;

export interface Episode {
    _id: string;
    episodeNumber: number;
    episodeName: string;
    description: string;
    caption: string;
    isFree: boolean;
    isLocked: boolean;
    unlockedBy: string[];
    videoUrl: string;
    likes: string[];
    saves: string[];
    status: string;
    reelId: {
        _id: string;
        title: string;
        description: string;
    };
    createdAt: string;
    updatedAt: string;
    likeCount: number;
    saveCount: number;
    userId: {
        _id: string;
        name: string;
        email: string;
        profilePicture: string;
    };
}

export const createEpisode = async (
    token: string,
    reelId: string,
    formData: FormData
): Promise<Episode> => {
    try {
        const response = await axios.post(
            `${baseURL}/api/episodes/${reelId}/episodes`,
            formData,
            {
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to create episode");
    }
};

export const getEpisodesByReelId = async (reelId: string): Promise<Episode[]> => {
    try {
        const response = await axios.get(`${baseURL}/api/episodes/${reelId}/episodes`);
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch episodes");
    }
};

export const getApprovedEpisodesByReelId = async (reelId: string): Promise<Episode[]> => {
    try {
        const response = await axios.get(`${baseURL}/api/episodes/${reelId}/episodes/approved`);
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch episodes");
    }
};


export const unlockEpisode = async (token: string, episodeId: string): Promise<Episode> => {
    try {
        const response = await axios.patch(
            `${baseURL}/api/episodes/${episodeId}/episodes/unlocked`,
            {},
            {
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to unlock episode");
    }
};

export const getEpisodeById = async (episodeId: string, token?: string): Promise<Episode> => {
    try {
        const response = await fetch(`${baseURL}/api/episodes/${episodeId}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch episode');
        }
        
        const data = await response.json();
        
        // The API returns the episode data directly, not in an episode property
        return data;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch episode');
    }
};



export const toggleLike = async (token: string, episodeId: string): Promise<void> => {
    try {
        const response = await fetch(`${baseURL}/api/episodes/${episodeId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to like episode');
        }
    } catch (error: any) {
        throw new Error(error.message || 'Failed to like episode');
    }
};


export const toggleSave = async (token: string, episodeId: string): Promise<void> => {
    try {
        const response = await fetch(`${baseURL}/api/episodes/${episodeId}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save episode');
        }
    } catch (error: any) {
        throw new Error(error.message || 'Failed to save episode');
    }
};

export const hasLiked = async (token: string, episodeId: string): Promise<boolean> => {
    try {
        const response = await fetch(`${baseURL}/api/episodes/${episodeId}/liked-check`, {
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

export const hasSaved = async (token: string, episodeId: string): Promise<boolean> => {
    try {
        const response = await fetch(`${baseURL}/api/episodes/${episodeId}/saved-check`, {
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
