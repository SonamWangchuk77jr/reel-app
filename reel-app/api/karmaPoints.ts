import axios from "axios";

const baseURL = process.env.EXPO_PUBLIC_API_URL;

export const getKarmaPoints = async (token: string) => {
    const response = await axios.get(`${baseURL}/api/karma-points/get`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const claimDailyReward = async (token: string) => {
    const response = await axios.post(
        `${baseURL}/api/karma-points/claim-daily`,
        {}, // No body needed
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};

export const addKarmaPoints = async (token: string, points: number) => {
    const response = await axios.post(`${baseURL}/api/karma-points/add`, {
        points,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};