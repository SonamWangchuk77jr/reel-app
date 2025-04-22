import axios from "axios";

const baseURL = process.env.EXPO_PUBLIC_API_URL;

export interface Reel {
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


export const getReelByUserId = async ( userId: string): Promise<Reel[]> => {
    try {
        const response = await axios.get(`${baseURL}/api/reels/user/${userId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get reel by user ID");
    }
};

