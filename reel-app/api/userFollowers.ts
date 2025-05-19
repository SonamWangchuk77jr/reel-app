
import axios from "axios";

const baseURL = process.env.EXPO_PUBLIC_API_URL;

export const followUser = async (token: string, userId: string) => {
    const response = await axios.post(`${baseURL}/api/user-followers/follow/${userId}`, {}, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const unfollowUser = async (token: string, userId: string) => {
    const response = await axios.delete(`${baseURL}/api/user-followers/unfollow/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getFollowers = async (token: string, userId: string) => {
    const response = await axios.get(`${baseURL}/api/user-followers/followers/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getFollowing = async (token: string, userId: string) => {
    const response = await axios.get(`${baseURL}/api/user-followers/following/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getIsFollowing = async (token: string, userId: string) => {
    try {
        const response = await axios.get(`${baseURL}/api/user-followers/is-following/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        // Return a default object with success: false instead of throwing
        return { success: false, message: "Not following" };
    }
};
