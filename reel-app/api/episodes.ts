import axios from "axios";

const baseURL = process.env.EXPO_PUBLIC_API_URL;

export interface Episode {
    _id: string;
    episodeNumber: number;
    episodeName: string;
    description: string;
    caption: string;
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