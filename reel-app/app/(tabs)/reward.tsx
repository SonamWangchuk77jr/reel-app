import { View, Text, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { icons } from '@/constants/icons'

const Reward = () => {
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
                        <Text className="text-white text-[15px] font-thin">20,000</Text>
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
                        <Text className="text-white text-lg font-semibold mt-4">+ 100</Text>
                    </View>
                    <View className='bg-primary/40 rounded-2xl p-4 w-[25%] h-[120px] flex-col justify-center items-center'>
                        <Image source={icons.rewardPoints} className="size-[58px]" />
                        <Text className="text-white text-lg font-semibold mt-4">+ 300</Text>
                    </View>
                </View>
                {/* Reward Watch Button */}
                <View className='flex-row mt-[15px] px-6'>
                    <TouchableOpacity className='bg-primary/40 rounded-[18px] h-[45px] w-[25%] flex justify-center items-center'>
                        <Text className="text-white text-lg font-semibold text-center">Watch</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className='bg-primary/40 rounded-[20px] p-4 h-[55px] w-[40%] flex justify-center items-center mx-auto mt-10'>
                        <Text className="text-white text-lg font-semibold text-center">Watch</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className='bg-primary/40 rounded-[18px] w-[25%] h-[45px] flex justify-center items-center'>
                        <Text className="text-white text-lg font-semibold text-center">Watch</Text>
                    </TouchableOpacity>
                </View>
                <View className='px-6 mt-[20px]'>
                    <TouchableOpacity className='bg-primary rounded-[30px] w-full h-[50px] flex justify-center items-center'>
                        <Text className="text-white text-lg font-semibold text-center">Watch</Text>
                    </TouchableOpacity>
                </View>


                {/* daily reward point claim */}
                <View className='flex-row justify-between items-start gap-1 px-6 mt-10'>
                    <View className='w-[48px]'>
                        <View className='bg-primary/40 rounded-lg w-full py-3 flex-col justify-center items-center relative'>
                            <Image source={icons.rewardPoints} className="size-[35px]" />
                            <Text className="text-white text-[12px] font-semibold mt-2">+ 100</Text>

                            {/* Status */}
                            <View className='absolute top-[-7px] right-0'>
                                <Image source={icons.status} />
                            </View>

                        </View>
                        <TouchableOpacity className='w-full h-[30px] bg-primary/40 rounded-lg mt-2 flex justify-center items-center'>
                            <Text className='text-white text-[12px]'>Day 1</Text>
                        </TouchableOpacity>
                    </View>
                    <View className='w-[48px]'>
                        <View className='bg-primary/40 rounded-lg w-full py-3 flex-col justify-center items-center relative'>
                            <Image source={icons.rewardPoints} className="size-[35px]" />
                            <Text className="text-white text-[12px] font-semibold mt-2">+ 100</Text>

                            {/* Status */}
                            <View className='absolute top-[-7px] right-0'>
                                <Image source={icons.status} />
                            </View>

                        </View>
                        <TouchableOpacity className='w-full h-[30px] bg-primary/40 rounded-lg mt-2 flex justify-center items-center'>
                            <Text className='text-white text-[12px]'>Day 2</Text>
                        </TouchableOpacity>
                    </View>
                    <View className='w-[48px]'>
                        <View className='bg-primary/40 rounded-lg w-full py-3 flex-col justify-center items-center relative'>
                            <Image source={icons.rewardPoints} className="size-[35px]" />
                            <Text className="text-white text-[12px] font-semibold mt-2">+ 100</Text>

                            {/* Status */}
                            <View className='absolute top-[-7px] right-0'>
                                <Image source={icons.status} />
                            </View>

                        </View>
                        <TouchableOpacity className='w-full h-[30px] bg-primary/40 rounded-lg mt-2 flex justify-center items-center'>
                            <Text className='text-white text-[12px]'>Day 3</Text>
                        </TouchableOpacity>
                    </View>
                    <View className='w-[48px]'>
                        <View className='bg-primary/40 rounded-lg w-full py-3 flex-col justify-center items-center relative'>
                            <Image source={icons.rewardPoints} className="size-[35px]" />
                            <Text className="text-white text-[12px] font-semibold mt-2">+ 100</Text>

                            {/* Status */}
                            <View className='absolute top-[-7px] right-0'>
                                <Image source={icons.status} />
                            </View>

                        </View>
                        <TouchableOpacity className='w-full h-[30px] bg-primary/40 rounded-lg mt-2 flex justify-center items-center'>
                            <Text className='text-white text-[12px]'>Day 4</Text>
                        </TouchableOpacity>
                    </View>
                    <View className='w-[48px]'>
                        <View className='bg-primary/40 rounded-lg w-full py-3 flex-col justify-center items-center relative'>
                            <Image source={icons.rewardPoints} className="size-[35px]" />
                            <Text className="text-white text-[12px] font-semibold mt-2">+ 100</Text>

                            {/* Status */}
                            <View className='absolute top-[-7px] right-0'>
                                <Image source={icons.status} />
                            </View>

                        </View>
                        <TouchableOpacity className='w-full h-[30px] bg-primary/40 rounded-lg mt-2 flex justify-center items-center'>
                            <Text className='text-white text-[12px]'>Day 5</Text>
                        </TouchableOpacity>
                    </View>
                    <View className='w-[48px]'>
                        <View className='bg-primary rounded-lg w-full py-3 flex-col justify-center items-center relative'>
                            <Image source={icons.rewardPoints} className="size-[35px]" />
                            <Text className="text-white text-[12px] font-semibold mt-2">+ 100</Text>
                        </View>
                        <TouchableOpacity className='w-full h-[30px] bg-primary rounded-lg mt-2 flex justify-center items-center'>
                            <Text className='text-white text-[12px]'>Claim</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Reward