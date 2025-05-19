import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    Image,
    TouchableOpacity,
} from 'react-native';
import React from 'react';
import { icons } from '@/constants/icons';
import { getKarmaPoints, claimDailyReward } from '@/api/karmaPoints';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

const Reward = () => {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    const { data: karmaPoints } = useQuery({
        queryKey: ['karmaPoints'],
        queryFn: () => getKarmaPoints(token || ''),
    });

    const { mutate: claimDailyRewardMutation, isPending: isClaimingReward } = useMutation({
        mutationFn: () => claimDailyReward(token || ''),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['karmaPoints'] });
            // You can add a toast or alert to show the success message
            console.log('Claim success:', data.message);
        },
        onError: (error: any) => {
            // Show error message
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to claim daily reward',
            });
        }
    });

    const points = [100, 300, 200];

    return (
        <SafeAreaView className="bg-secondary h-full flex-1">
            <ScrollView className="flex-1 h-full" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-6 mt-10">
                    <Text className="text-white text-2xl font-bold">Rewards</Text>
                </View>

                {/* Coin Balance */}
                <View className="flex-row justify-between px-6 mt-4">
                    <Text className="text-white text-lg font-medium">Coin Balance</Text>
                    <View className="bg-white/30 flex-row gap-2 items-center px-4 py-2 rounded-full">
                        <Image source={icons.rewardPoints} className="size-5" />
                        <Text className="text-white text-[15px] font-thin">
                            {karmaPoints?.points || 0}
                        </Text>
                    </View>
                </View>

                {/* Static Rewards Cards */}
                <View className="mt-10 px-6 flex-row items-end gap-5">
                    {points.map((point, index) => {
                        const width = index === 1 ? 'w-[40%]' : 'w-[25%]';
                        const height = index === 1 ? 'h-[200px]' : 'h-[120px]';
                        const imageSize = index === 1 ? 'size-[98px]' : 'size-[58px]';

                        return (
                            <View
                                key={point}
                                className={`bg-primary/40 rounded-2xl p-4 ${width} ${height} flex-col justify-center items-center`}
                            >
                                <Image source={icons.rewardPoints} className={imageSize} />
                                <Text className="text-white text-lg font-semibold mt-4">+ {point}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* Watch Ads Buttons */}
                <View className="flex-row mt-[15px] px-6">
                    {points.map((point, idx) => (
                        <TouchableOpacity
                            key={point}
                            className={`bg-primary/40 rounded-[18px] h-[45px] justify-center items-center ${idx === 1
                                ? 'w-[40%] mx-auto mt-10 rounded-[20px] p-4 h-[55px]'
                                : 'w-[25%]'
                                }`}
                            onPress={() => router.push(`/adsVideo/${point}`)}
                        >
                            <Text className="text-white text-lg font-semibold text-center">Watch</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Check In Button */}
                <View className="px-6 mt-[20px]">
                    <TouchableOpacity
                        className="bg-primary rounded-[30px] w-full h-[50px] justify-center items-center"
                        onPress={() => claimDailyRewardMutation()}
                        disabled={isClaimingReward}
                    >
                        <Text className="text-white text-lg font-semibold text-center">
                            {isClaimingReward ? "Claiming..." : "Check In"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Daily Rewards Progress */}
                <View className="flex-row justify-between items-start gap-1 px-6 mt-10">
                    {[1, 2, 3, 4, 5, 6].map((day) => {
                        const isCurrent = karmaPoints?.currentStreakDay === day;

                        // Check if the last claim was today
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const lastClaimDate = karmaPoints?.lastDailyPointsDate ? new Date(karmaPoints.lastDailyPointsDate) : null;
                        if (lastClaimDate) lastClaimDate.setHours(0, 0, 0, 0);

                        const claimedToday = lastClaimDate && lastClaimDate.getTime() === today.getTime();

                        const isClaimedToday = claimedToday && isCurrent;
                        const isClaimable = isCurrent && !claimedToday;
                        const isCompleted = day < karmaPoints?.currentStreakDay;

                        return (
                            <View className="w-[48px]" key={day}>
                                <View
                                    className={`rounded-lg w-full py-3 justify-center items-center relative ${isCurrent ? 'bg-primary' : 'bg-primary/40'
                                        }`}
                                >
                                    <Image source={icons.rewardPoints} className="size-[35px]" />
                                    <Text className="text-white text-[12px] font-semibold mt-2">+ 100</Text>

                                    {(isCompleted || isClaimedToday) && (
                                        <View className="absolute top-[-7px] right-0">
                                            <Image source={icons.status} />
                                        </View>
                                    )}
                                </View>

                                {/* Claim Button or Day Label */}
                                <TouchableOpacity
                                    className={`w-full h-[30px] mt-2 rounded-lg justify-center items-center ${isClaimable ? 'bg-primary' : 'bg-primary/40'}`}
                                    disabled={!isClaimable}
                                    onPress={() => isClaimable && claimDailyRewardMutation()}
                                >
                                    <Text className="text-white text-[12px]">
                                        {isClaimable ? 'Claim' : `Day ${day}`}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Reward;
