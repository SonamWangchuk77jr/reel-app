import axios from "axios";

const baseURL = process.env.EXPO_PUBLIC_API_URL;

export const getRandomAds = async (point: number, token: string) => {
    const response = await axios.get(`${baseURL}/api/ads/random/${point}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};


