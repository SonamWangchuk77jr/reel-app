import { Text, TouchableOpacity, View, Image } from 'react-native'
import React from 'react'
import { icons } from '@/constants/icons'

interface ReelPlayCardProps {
    title: string;
    image: any;
}

const ReelPlayCard = ({ title, image }: ReelPlayCardProps) => {
    return (
        <View className="bg-primary w-[160px] h-[200px] rounded-[15px]">
            <Image source={image} className="w-full h-full rounded-[15px]" />
            <View className="absolute bottom-0 left-0 right-0  px-3 py-4">
                <Text className="text-white text-[15px] font-font-[300]">{title}</Text>
            </View>
            <View className="absolute bottom-10 right-0 px-3 py-4">
                <TouchableOpacity className="bg-primary rounded-full p-3">
                    <Image source={icons.play} tintColor="#ffff" className="size-4" />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default ReelPlayCard

