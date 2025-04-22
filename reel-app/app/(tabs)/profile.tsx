import {
    View, Text,
    SafeAreaView, ImageBackground,
    ScrollView, TextInput,
    Dimensions, Image,
    TouchableOpacity, KeyboardAvoidingView,
    Platform,
    Keyboard
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { images } from '@/constants/image'
import { Feather, FontAwesome } from "@expo/vector-icons";
import { icons } from '@/constants/icons';
import { router } from 'expo-router';
import TabView from '@/components/ProfileTab';
import { useAuth } from '@/context/AuthContext';

const { height } = Dimensions.get('window');

const profile = () => {
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const { user, isLoading } = useAuth();
    // console.log(user?.id);

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    if (!user) {
        return <Text>Not logged in</Text>;
    }
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        // Clean up listeners on unmount
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);
    return (
        <SafeAreaView className="bg-secondary h-full flex-1 relative">

            <ScrollView className="flex-1 h-full" showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View className="w-full px-1" style={{ borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
                    <ImageBackground
                        source={images.bgImage}
                        resizeMode="cover"
                        className="w-full pt-0 mt-0"
                        style={{ height: height * 0.20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, overflow: 'hidden', }}
                    >
                        <View className="flex-row justify-between items-center w-full px-4 mt-10">
                            {/* Back Button */}
                            <TouchableOpacity onPress={() => router.push('/')}>
                                <View className="border-2 border-primary rounded-full h-11 w-11 items-center justify-center">
                                    <FontAwesome name="angle-left" size={25} color="#fff" />
                                </View>
                            </TouchableOpacity>
                            {/* Search Bar */}
                            <View className="flex-1 mx-3">
                                <View className="relative w-full rounded-full justify-center">
                                    <Feather
                                        name="search"
                                        size={18}
                                        color="#fff"
                                        style={{ position: 'absolute', left: 12, top: 13 }}
                                    />
                                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                    >
                                        <TextInput
                                            className="text-white pl-10 pr-4 w-full py-[10px] border-2  border-primary rounded-full text-[16px]"
                                            placeholder="Search"
                                            placeholderTextColor="#fff"
                                            autoFocus={false}
                                            returnKeyType="search"
                                        />
                                    </KeyboardAvoidingView>
                                </View>
                            </View>

                            {/* Settings & Notifications */}
                            <View className="flex-row gap-3">
                                <View className="border-2 border-primary rounded-full h-11 w-11 items-center justify-center">
                                    <FontAwesome name="gear" size={20} color="#fff" />
                                </View>
                                <View className="border-2 border-primary rounded-full h-11 w-11 items-center justify-center">
                                    <FontAwesome name="bell" size={20} color="#fff" />
                                </View>
                            </View>
                        </View>
                    </ImageBackground>
                </View>

                {/* Profile Section */}
                <View className='w-full px-6'>
                    <View className='flex-row justify-center items-center mt-[-40px]'>
                        <View className='flex-row gap-3 items-center'>
                            <Image source={images.gankarPhuensum} className="w-[100px] h-[100px] border-2 border-white rounded-full" />
                        </View>
                    </View>
                    <View className='flex-row justify-center items-center mt-3'>
                        <Text className="text-white text-[18px] font-semibold">{user?.name}</Text>
                    </View>
                </View>
                <View className='flex-row justify-center gap-20 items-center mt-5'>
                    <View className='flex-col justify-between items-center'>
                        <Text className="text-2xl text-white font-bold">
                            120
                        </Text>
                        <Text className="text-lg text-[#A7A7A7] font-semibold mt-2">
                            Following
                        </Text>
                    </View>
                    <View className='flex-col justify-between items-center'>
                        <Text className="text-2xl text-white font-bold">
                            20K
                        </Text>
                        <Text className="text-lg text-[#A7A7A7] font-semibold mt-2">
                            Followers
                        </Text>
                    </View>
                </View>
                <View className='flex-row justify-center items-center mt-4'>
                    <View className='bg-white/75 rounded-full h-11 w-[100px] flex-row items-center justify-center gap-2'>
                        <FontAwesome name="edit" size={20} color="#606060" />
                        <Text className='text-[#606060]'>Edit</Text>
                    </View>
                </View>

                {/* Karma Point */}
                <View className='flex-row justify-center items-center gap-1 px-6 mt-5'>
                    <View className='w-[85%] bg-primary/50 px-6 py-3 rounded-[30px] flex-row justify-between items-center'>
                        <View>
                            <View className='pt-2'>
                                <Text className="text-white text-[16px] font-[400]">Karma Point</Text>
                            </View>
                            <View className='w-full py-3 flex-row justify-start items-center gap-2'>
                                <Image source={icons.rewardPoints} className="size-[20px]" />
                                <Text className="text-white text-[20px] font-semibold">1000</Text>
                            </View>
                        </View>
                        <View>
                            <TouchableOpacity className='w-full h-[50px] px-4 bg-primary rounded-[30px] flex justify-center items-center'>
                                <Text className='text-white text-[16px]'>Refill Coins</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                {/* Profile Tab view  */}
                <TabView userId={user?.id} />

            </ScrollView>
            {!keyboardVisible && (
                <View className='flex-row justify-center w-full items-center absolute bottom-10 z-50'>
                    <View className='flex-row justify-between items-center w-[85%] bg-[#9E8EB8]/50 rounded-[35px] px-3 mt-10 py-3'>
                        <View className='w-[48%]'>
                            <TouchableOpacity className='w-full h-[50px] bg-primary rounded-[30px] flex justify-center items-center'>
                                <Text className='text-white text-[16px]'>LIVE</Text>
                            </TouchableOpacity>
                        </View>
                        <View className='w-[48%]'>
                            <TouchableOpacity
                                className='w-full h-[50px] bg-[#B9CDEE]/20 rounded-[30px] flex justify-center items-center'
                                onPress={() => router.push('/reels/reels-upload')}
                            >
                                <Text className='text-white text-[16px]'>UPLOAD</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>

    )
}

export default profile