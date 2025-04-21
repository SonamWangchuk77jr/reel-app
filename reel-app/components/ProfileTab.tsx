import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { images } from '@/constants/image';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const GAP = 4;
const PADDING = 16;
const IMAGE_SIZE = (width - (PADDING * 2) - (GAP * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

const TabView = () => {
    const [activeTab, setActiveTab] = useState<'post' | 'list'>('post');
    const [tabAnimation] = useState(new Animated.Value(0));

    const handleTabChange = (tab: 'post' | 'list') => {
        setActiveTab(tab);
        Animated.timing(tabAnimation, {
            toValue: tab === 'post' ? 0 : 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const tabIndicatorStyle = {
        transform: [
            {
                translateX: tabAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 100],
                }),
            },
        ],
    };

    // Create array of images
    const imageArray = [
        images.bhudhaPoint,
        images.cham,
        images.paroTakstang,
        images.cham2,
        images.gankarPhuensum,
        images.bhudhaPoint
    ];

    // Group images into rows of 3
    const imageRows = [];
    for (let i = 0; i < imageArray.length; i += COLUMN_COUNT) {
        imageRows.push(imageArray.slice(i, i + COLUMN_COUNT));
    }

    return (
        <View className='w-full bg-black'>
            {/* Post & List Tabs */}
            <View className='flex-row justify-center items-center mt-4'>
                <View className='w-[85%]'>
                    <View
                        className='flex-row justify-between items-center relative'
                        style={{
                            borderBottomWidth: 1,
                            borderBottomColor: '#2A2A2A',
                            paddingBottom: 8
                        }}
                    >
                        {/* Tab Indicator */}
                        <Animated.View
                            className='absolute bottom-0 h-0.5 bg-white w-[50%]'
                            style={tabIndicatorStyle}
                        />

                        {/* List Tab */}
                        <TouchableOpacity
                            onPress={() => handleTabChange('list')}
                            className='flex-1 items-center py-3'
                        >
                            <View className='flex-row items-center gap-2 py-3'
                                style={{
                                    borderBottomWidth: activeTab === 'list' ? 2 : 0,
                                    borderBottomColor: activeTab === 'list' ? '#fff' : '#AEAEAE',
                                }}
                            >
                                <Feather
                                    name="eye-off"
                                    size={22}
                                    color={activeTab === 'list' ? '#fff' : '#AEAEAE'}
                                />
                                <Text
                                    className="text-[15px] font-semibold"
                                    style={{ color: activeTab === 'list' ? '#fff' : '#AEAEAE' }}
                                >
                                    List
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Post Tab */}
                        <TouchableOpacity
                            onPress={() => handleTabChange('post')}
                            className='flex-1 items-center'
                        >
                            <View className='flex-row items-center gap-2 py-3'
                                style={{
                                    borderBottomWidth: activeTab === 'post' ? 2 : 0,
                                    borderBottomColor: activeTab === 'post' ? '#fff' : '#AEAEAE',
                                }}
                            >
                                <Feather
                                    name="video"
                                    size={22}
                                    color={activeTab === 'post' ? '#fff' : '#AEAEAE'}
                                />
                                <Text
                                    className="text-[15px] font-semibold"
                                    style={{ color: activeTab === 'post' ? '#fff' : '#AEAEAE' }}
                                >
                                    Post
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Content Area */}
            <View>
                {activeTab === 'post' ? (
                    <View style={{ padding: PADDING }}>
                        {imageRows.map((row, rowIndex) => (
                            <View
                                key={rowIndex}
                                className="flex-row justify-between"
                                style={{
                                    gap: GAP,
                                    marginBottom: rowIndex !== imageRows.length - 1 ? GAP : 0
                                }}
                            >
                                {row.map((imgSrc, colIndex) => (
                                    <TouchableOpacity
                                        key={`${rowIndex}-${colIndex}`}
                                        style={{
                                            width: IMAGE_SIZE,
                                            height: IMAGE_SIZE,
                                        }}
                                        className="overflow-hidden rounded-md"
                                        activeOpacity={0.8}
                                    >
                                        <Image
                                            source={imgSrc}
                                            style={{ width: '100%', height: '100%' }}
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
                    </View>
                ) : (
                    <View className="px-6 mt-6">
                        <Text className="text-white text-lg font-medium">List content goes here...</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export default TabView;
