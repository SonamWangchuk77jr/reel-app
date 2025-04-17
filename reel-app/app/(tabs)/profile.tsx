import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const profile = () => {
    const handleLogout = async () => {
        await AsyncStorage.removeItem("token");
        router.replace("/(auth)/login");
    };
    return (
        <View className="flex-1 items-center justify-center bg-[#0C1319]">
            <Text className="text-2xl text-white font-bold">
                Profile
            </Text>
            <TouchableOpacity
                className="bg-red-500 px-8 py-4 rounded-full mt-4"
                onPress={handleLogout}
            >
                <Text className="text-white text-lg font-bold">Logout</Text>
            </TouchableOpacity>
        </View>
    )
}

export default profile