import { TouchableOpacity, Image } from 'react-native'
import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { icons } from '@/constants/icons';

export default function Logout() {
    const handleLogout = async () => {
        await AsyncStorage.removeItem("token");
        router.replace("/(auth)/login");
    };
    return (
        <TouchableOpacity
            onPress={handleLogout}
        >
            <Image source={icons.logout} className="size-8" />
        </TouchableOpacity>
    )

}