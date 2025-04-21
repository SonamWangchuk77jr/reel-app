import axios from "axios";

const baseURL = process.env.EXPO_PUBLIC_API_URL;

export const signup = async (formData: { 
    name: string; 
    email: string; 
    password: string 
}) => {
    try {
        const response = await axios.post(`${baseURL}/api/auth/register`, formData);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to sign up");
    }
};

export const login = async (formData: {
    email: string;
    password: string;
}) => {
    try {
        const response = await axios.post(`${baseURL}/api/auth/login`, formData);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to login");
    }
};