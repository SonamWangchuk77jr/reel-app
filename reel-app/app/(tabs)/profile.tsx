import {
    View, Text,
    SafeAreaView, ImageBackground,
    ScrollView, TextInput,
    Dimensions, Image,
    TouchableOpacity, KeyboardAvoidingView,
    Platform,
    Keyboard,
    AppState
} from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { images } from '@/constants/image'
import { Feather, FontAwesome } from "@expo/vector-icons";
import { icons } from '@/constants/icons';
import { router } from 'expo-router';
import TabView from '@/components/ProfileTab';
import { useAuth } from '@/context/AuthContext';
import { getKarmaPoints } from '@/api/karmaPoints';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { getFollowers, getFollowing } from '@/api/userFollowers';
import { useIsFocused } from '@react-navigation/native';

const { height } = Dimensions.get('window');

const profile = () => {
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const { user, isLoading, token } = useAuth();
    const queryClient = useQueryClient();
    const isFocused = useIsFocused();
    const appState = useRef(AppState.currentState);
    const lastFocusTimeRef = useRef<number>(Date.now());

    // Move the token check inside the query function instead of using early returns
    const { data: karmaPoints, refetch: refetchKarmaPoints } = useQuery({
        queryKey: ['karmaPoints'],
        queryFn: () => token ? getKarmaPoints(token) : null,
        enabled: !!token
    });

    //get follower
    const { data: followers, refetch: refetchFollowers } = useQuery({
        queryKey: ['followers'],
        queryFn: () => token ? getFollowers(token, user?.id || '') : null,
        enabled: !!token && !!user?.id
    });

    //get following
    const { data: following, refetch: refetchFollowing } = useQuery({
        queryKey: ['following'],
        queryFn: () => token ? getFollowing(token, user?.id || '') : null,
        enabled: !!token && !!user?.id
    });

    // Auto refresh when screen comes into focus
    useEffect(() => {
        if (isFocused && token) {
            const refreshData = async () => {
                // Refresh all profile data
                if (user?.id) {
                    refetchKarmaPoints();
                    refetchFollowers();
                    refetchFollowing();

                    // Invalidate related queries to ensure fresh data
                    queryClient.invalidateQueries({ queryKey: ['karmaPoints'] });
                    queryClient.invalidateQueries({ queryKey: ['followers'] });
                    queryClient.invalidateQueries({ queryKey: ['following'] });
                }
            };

            refreshData();
            lastFocusTimeRef.current = Date.now();
        }
    }, [isFocused, token, user?.id]);

    // Handle app state changes (background/foreground)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            // Auto refresh when app comes to foreground after being in background
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active' &&
                isFocused &&
                token
            ) {
                const now = Date.now();
                // Only refresh if it's been more than 1 minute since last focus
                if (now - lastFocusTimeRef.current > 60 * 1000) {
                    if (user?.id) {
                        refetchKarmaPoints();
                        refetchFollowers();
                        refetchFollowing();
                    }
                }
                lastFocusTimeRef.current = now;
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [isFocused, token, user?.id, refetchKarmaPoints, refetchFollowers, refetchFollowing]);

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

    // Render loading/error states after all hooks have been called
    const renderContent = () => {
        if (isLoading) {
            return <Text>Loading...</Text>;
        }
        if (!user) {
            return <Text>Not logged in</Text>;
        }
        if (!token) {
            return <Text>No token</Text>;
        }
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
                                {/* <View className="flex-1 mx-3">
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
                                </View> */}

                                {/* Settings & Notifications */}
                                <View className="flex-row gap-3">
                                    <View className="border-2 border-primary rounded-full h-11 w-11 items-center justify-center">
                                        <FontAwesome name="gear" size={20} color="#fff" />
                                    </View>
                                    {/* <View className="border-2 border-primary rounded-full h-11 w-11 items-center justify-center">
                                        <FontAwesome name="bell" size={20} color="#fff" />
                                    </View> */}
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
                                {following}
                            </Text>
                            <Text className="text-lg text-[#A7A7A7] font-semibold mt-2">
                                Following
                            </Text>
                        </View>
                        <View className='flex-col justify-between items-center'>
                            <Text className="text-2xl text-white font-bold">
                                {followers}
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
                                    <Text className="text-white text-[20px] font-semibold">{karmaPoints?.points}</Text>
                                </View>
                            </View>
                            <View>
                                <TouchableOpacity onPress={() => router.push('/reward')} className='w-full h-[50px] px-4 bg-primary rounded-[30px] flex justify-center items-center'>
                                    <Text className='text-white text-[16px]'>Refill Coins</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    {/* Profile Tab view  */}
                    <TabView userId={user?.id || ''} />

                </ScrollView>
                {!keyboardVisible && (
                    <View className='flex-row justify-center w-full items-center absolute bottom-10 z-50'>
                        <View className='flex-row justify-center items-center w-[85%]'>
                            <View className='w-[80%]'>
                                <TouchableOpacity
                                    className='w-full h-[50px] bg-primary rounded-[30px] flex justify-center items-center'
                                    onPress={() => router.push('/upload/reels-upload')}
                                >
                                    <Text className='text-white text-[16px]'>UPLOAD</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </SafeAreaView>
        );
    };

    // Return the content after all hooks have been called
    return renderContent();
}

export default profile
