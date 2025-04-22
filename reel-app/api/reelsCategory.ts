import axios from "axios";

const baseURL = process.env.EXPO_PUBLIC_API_URL;

export const getReelsCategory = async () => {
    const response = await axios.get(`${baseURL}/api/category/getAll`);
    return response.data;
};

