import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { login as apiLogin } from '@/api/auth';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const [storedToken, storedUser] = await Promise.all([
                AsyncStorage.getItem('token'),
                AsyncStorage.getItem('user')
            ]);

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            }
        } catch (error) {
            console.error('Error loading user:', error);
        } finally {
            setIsLoading(false);
            setIsInitialized(true);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await apiLogin({ email, password });
            const { token, user } = response;

            console.log('role', user.role)

            if (user.role === 'Admin') {
                throw new Error('Admin users cannot login through this interface');
            }

            // Proceed only for non-admin users
            await Promise.all([
                AsyncStorage.setItem('token', token),
                AsyncStorage.setItem('user', JSON.stringify(user))
            ]);

            setToken(token);
            setUser(user);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            router.replace('/(tabs)');

        } catch (error: any) {
            throw new Error(error?.message || 'Invalid email or password');
        }
    };


    const logout = async () => {
        try {
            await AsyncStorage.multiRemove(['token', 'user']);
            setToken(null);
            setUser(null);
            delete axios.defaults.headers.common['Authorization'];
            router.replace('/(auth)/login');
        } catch (error: any) {
            console.error('Logout error:', error);
            throw new Error(error.message || 'Failed to logout');
        }
    };

    const refreshToken = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            if (!storedToken) {
                throw new Error('No token found');
            }

            // Here you could add additional token validation logic if needed
            // For example, checking token expiration if you store that information

            // If token exists and is valid, update axios headers
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        } catch (error) {
            console.error('Token validation error:', error);
            // If token validation fails, logout the user
            await logout();
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading: isLoading || !isInitialized, login, logout, refreshToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 