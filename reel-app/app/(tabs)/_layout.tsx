import React from 'react'
import { Tabs } from 'expo-router'
import { images } from '@/constants/image';
import { Image, View, Text, Platform } from 'react-native';
import { icons } from '@/constants/icons';

function TabIcon({ focused, icon, title }: any) {
    if (focused) {
        return (
            <View
                className="flex flex-row w-full h-full flex-1 min-w-[112px] min-h-14 mt-4 justify-center items-center rounded-full"
            >
                <View className='h-10 w-full absolute top-[-3px]'>
                    <Image source={images.curve} tintColor="#0C1319" className="w-full h-full" />
                </View>
                <View className='flex-col items-center justify-center'>
                    <View className='h-[50px] w-[50px] bg-primary rounded-full justify-center items-center absolute top-[-50px]'>
                        <Image source={icon} tintColor="#fff" className="size-8" />
                    </View>
                    <Text className="text-white text-base font-semibold ml-2 absolute bottom-[-35px]">
                        {title}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View className="size-full justify-center items-center mt-8 rounded-full ">
            <Image source={icon} tintColor="#fff" className="size-8" />
        </View>
    );
}

const _Layout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarItemStyle: {
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",

                },
                tabBarStyle: {
                    backgroundColor: "#28487B",
                    borderWidth: 1,
                    borderColor: "#0F0D23",
                    borderTopColor: '#0F0D23',
                    height: Platform.OS === 'ios' ? 77 : 77,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.home} title="Home" />
                    ),
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: "Explore",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.explore} title="Explore" />
                    ),
                }}
            />
            <Tabs.Screen
                name="reward"
                options={{
                    title: "Rewards",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.reward} title="Reward" />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    headerShown: false,
                    tabBarStyle: { display: 'none' }, // <- hides the tab bar
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.profile} title="Profile" />
                    ),
                }}
            />
        </Tabs>
    )
}
export default _Layout
