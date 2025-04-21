import { TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { icons } from '@/constants/icons';
import { useAuth } from '@/context/AuthContext';

export default function Logout() {
    const { logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <TouchableOpacity
            onPress={handleLogout}
        >
            <Image source={icons.logout} className="size-8" />
        </TouchableOpacity>
    );
}