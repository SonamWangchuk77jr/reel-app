import { View, Text, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { icons } from '@/constants/icons'
import { getKarmaPoints, claimDailyReward } from '@/api/karmaPoints';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

const Reward = () => {

    const { token } = useAuth();
    if (!token) {
        return <Text>No token</Text>
    }

    const queryClient = useQueryClient();

    const { data: karmaPoints } = useQuery({
        queryKey: ['karmaPoints'],
        queryFn: () => getKarmaPoints(token),
    });

    const { mutate: claimDailyRewardMutation } = useMutation({
        mutationFn: () => claimDailyReward(token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['karmaPoints'] });
        },
    });

    const points = [100, 300, 200];

    return (
        <SafeAreaView className="bg-secondary h-full flex-1">
            <ScrollView className="flex-1 h-full" showsVerticalScrollIndicator={false}>
                <View className="px-6 mt-10">
                    <Text className="text-white text-2xl font-bold">Rewards</Text>
                </View>
                <View className='flex-row justify-between px-6 mt-4'>
                    <View>
                        <Text className="text-white text-lg font-medium">Coin Balance</Text>
                    </View>
                    <View className='bg-white/30 flex-row gap-2 items-center px-4 py-2 rounded-full'>
                        <Image source={icons.rewardPoints} className="size-5" />
                        <Text className="text-white text-[15px] font-thin">{karmaPoints?.points || 0}</Text>
                    </View>
                </View>

                {/* Reward point Section */}
                <View className='mt-10 px-6 flex-row items-end  gap-5'>
                    <View className='bg-primary/40 rounded-2xl p-4 w-[25%] h-[120px] flex-col justify-center  items-center'>
                        <Image source={icons.rewardPoints} className="size-[58px]" />
                        <Text className="text-white text-lg font-semibold mt-4">+ 100</Text>
                    </View>
                    <View className='bg-primary/40 rounded-2xl p-4 w-[40%] h-[200px] flex-col justify-center items-center'>
                        <Image source={icons.rewardPoints} className="size-[98px]" />
                        <Text className="text-white text-lg font-semibold mt-4">+ 300</Text>
                    </View>
                    <View className='bg-primary/40 rounded-2xl p-4 w-[25%] h-[120px] flex-col justify-center items-center'>
                        <Image source={icons.rewardPoints} className="size-[58px]" />
                        <Text className="text-white text-lg font-semibold mt-4">+ 200</Text>
                    </View>
                </View>

                {/* Reward Watch Button */}
                <View className='flex-row mt-[15px] px-6'>
                    {points.map((point, idx) => (
                        <TouchableOpacity
                            key={point}
                            className={`bg-primary/40 rounded-[18px] h-[45px] flex justify-center items-center ${idx === 1 ? 'w-[40%] mx-auto mt-10 rounded-[20px] p-4 h-[55px]' : 'w-[25%]'}`}
                            onPress={() => router.push(`/adsVideo/${point}`)}
                        >
                            <Text className="text-white text-lg font-semibold text-center">Watch</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View className='px-6 mt-[20px]'>
                    <TouchableOpacity className='bg-primary rounded-[30px] w-full h-[50px] flex justify-center items-center'>
                        <Text className="text-white text-lg font-semibold text-center">Check In</Text>
                    </TouchableOpacity>
                </View>

                {/* daily reward point claim */}
                <View className='flex-row justify-between items-start gap-1 px-6 mt-10'>
                    {[1, 2, 3, 4, 5, 6].map((day) => {
                        // Determine the state for each day
                        const isCurrent = karmaPoints?.currentStreakDay === day;
                        const isClaimedToday = karmaPoints?.dailyPoints === true && isCurrent;
                        const isClaimable = isCurrent && karmaPoints?.dailyPoints === false;
                        const isCompleted = day < karmaPoints?.currentStreakDay;

                        return (
                            <View className='w-[48px]' key={day}>
                                <View className={`rounded-lg w-full py-3 flex-col justify-center items-center relative ${isCurrent ? 'bg-primary' : 'bg-primary/40'
                                    }`}>
                                    <Image source={icons.rewardPoints} className="size-[35px]" />
                                    <Text className="text-white text-[12px] font-semibold mt-2">+ 100</Text>

                                    {/* Status */}
                                    {(isCompleted || isClaimedToday) && (
                                        <View className='absolute top-[-7px] right-0'>
                                            <Image source={icons.status} />
                                        </View>
                                    )}
                                </View>
                                {isClaimable ? (
                                    <TouchableOpacity
                                        className='w-full h-[30px] bg-primary rounded-lg mt-2 flex justify-center items-center'
                                        onPress={() => claimDailyRewardMutation()}
                                    >
                                        <Text className='text-white text-[12px]'>Claim</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        className={`w-full h-[30px] rounded-lg mt-2 flex justify-center items-center bg-primary/40`}
                                        disabled
                                    >
                                        <Text className='text-white text-[12px]'>
                                            {isCompleted || isClaimedToday ? `Day ${day}` : `Day ${day}`}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Reward