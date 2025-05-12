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
        if (axios.isAxiosError(error)) {
            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Login failed with server error";
            throw new Error(errorMessage);
        } else {
            throw new Error("An unexpected error occurred");
        }
    }
};

export const forgotPassword = async (email: string) => {
    try {
        const response = await axios.post(`${baseURL}/api/users/forgot-password`, { email });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to send confirmation code");
    }
};

export const resetPasswordConfirmationCode = async (email: string, confirmationCode: string) => {
    try {
        const response = await axios.post(`${baseURL}/api/users/confirm-reset-code`, { email, confirmationCode });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to reset password confirmation code");
    }
};

export const resetPassword = async (email: string, newPassword: string) => {
    try {
        const response = await axios.post(`${baseURL}/api/users/reset-password`, { email, newPassword });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to reset password");
    }
};




