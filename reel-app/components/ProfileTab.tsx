import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Animated, AppState } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getReelByUserId, getSavedReels, Reel } from '@/api/reels';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useReels } from '@/context/ReelsContext';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useIsFocused } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const GAP = 4;
const PADDING = 16;
const ITEM_SIZE = Math.floor((width - (PADDING * 2) - (GAP * (COLUMN_COUNT - 1))) / COLUMN_COUNT);

const VideoItem = ({ videoUrl }: { videoUrl: string }) => {
    const player = useVideoPlayer(videoUrl, (p) => {
        p.loop = false;
        p.muted = true;
        // @ts-ignore - Native configuration
        p.style = {
            resizeMode: 'cover',
            width: '100%',
            height: '100%'
        };
        // Pause the video immediately after initialization
        p.pause();
    });

    return (
        <View
            style={{
                width: ITEM_SIZE,
                height: ITEM_SIZE,
                overflow: 'hidden',
                backgroundColor: 'gray'
            }}
            pointerEvents="none"
        >
            <VideoView
                player={player}
                style={{
                    width: ITEM_SIZE * 2,
                    height: ITEM_SIZE * 2,
                    position: 'absolute',
                    top: -ITEM_SIZE * 0.5,
                    left: -ITEM_SIZE * 0.5,
                    transform: [{ scale: 1.2 }]
                }}
                pointerEvents="none"
            />
        </View>
    );
};

const TabView = ({ userId }: { userId: string }) => {
    const [activeTab, setActiveTab] = useState<'post' | 'list'>('post');
    const [tabAnimation] = useState(new Animated.Value(0));
    const [loading, setLoading] = useState(true);
    const { reels, setReels, refreshReels } = useReels();
    const [savedReels, setSavedReels] = useState<Reel[]>([]);
    const isFocused = useIsFocused();
    const appState = useRef(AppState.currentState);
    const lastFocusTimeRef = useRef<number>(Date.now());

    // token
    const token = useAuth().token;
    if (!token) {
        return <Text>No token</Text>
    }

    // Auto refresh when screen comes into focus
    useEffect(() => {
        if (isFocused) {
            const fetchData = async () => {
                try {
                    setLoading(true);
                    if (activeTab === 'post') {
                        const fetchedReels = await getReelByUserId(token);
                        setReels(fetchedReels);
                    } else {
                        const savedReelsData = await getSavedReels(token);
                        setSavedReels(savedReelsData);
                    }
                } catch (error) {
                    console.error('Error refreshing data:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
            lastFocusTimeRef.current = Date.now();
        }
    }, [isFocused, token, activeTab]);

    const handleTabChange = (tab: 'post' | 'list') => {
        setActiveTab(tab);
        Animated.timing(tabAnimation, {
            toValue: tab === 'post' ? 0 : 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // Refresh data when tab is clicked
        setLoading(true);
        if (tab === 'post') {
            const fetchReels = async () => {
                try {
                    const fetchedReels = await getReelByUserId(token);
                    setReels(fetchedReels);
                } catch (error) {
                    console.error('Error refreshing reels:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchReels();
        } else {
            const fetchSavedReels = async () => {
                try {
                    const savedReelsData = await getSavedReels(token);
                    setSavedReels(savedReelsData);
                } catch (error) {
                    console.error('Error refreshing saved reels:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchSavedReels();
        }
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

    // Group reels into rows of 3
    const reelRows = [];
    for (let i = 0; i < reels.length; i += COLUMN_COUNT) {
        reelRows.push(reels.slice(i, i + COLUMN_COUNT));
    }

    const renderSkeleton = () => {
        const skeletonRows = [];
        for (let i = 0; i < 3; i++) {
            skeletonRows.push(
                <View
                    key={i}
                    className="flex-row flex-wrap"
                    style={{
                        gap: GAP,
                        marginBottom: i !== 2 ? GAP : 0
                    }}
                >
                    {[...Array(COLUMN_COUNT)].map((_, j) => (
                        <View
                            key={j}
                            style={{
                                width: ITEM_SIZE,
                                height: ITEM_SIZE,
                            }}
                            className="bg-primary rounded-md animate-pulse"
                        />
                    ))}
                </View>
            );
        }
        return skeletonRows;
    };

    return (
        <View className='w-full'>
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

                        {/* Reels Post Tab */}
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
                        {loading ? (
                            renderSkeleton()
                        ) : reelRows.length === 0 ? (
                            <View className="flex-1 justify-center items-center min-h-[200px]">
                                <Text className="text-white text-lg">No reels found</Text>
                            </View>
                        ) : (
                            reelRows.map((row, rowIndex) => (
                                <View
                                    key={rowIndex}
                                    className="flex-row flex-wrap"
                                    style={{
                                        gap: GAP,
                                        marginBottom: rowIndex !== reelRows.length - 1 ? GAP : 0
                                    }}
                                >
                                    {row.map((reel, colIndex) => (
                                        <TouchableOpacity
                                            key={`${rowIndex}-${colIndex}`}
                                            style={{
                                                width: ITEM_SIZE,
                                                height: ITEM_SIZE,
                                            }}
                                            className="overflow-hidden bg-white"
                                            activeOpacity={0.8}
                                            onPress={() => router.push(`/reels/${reel._id}`)}
                                        >
                                            <VideoItem videoUrl={reel.video} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ))
                        )}
                    </View>
                ) : (
                    <View style={{ padding: PADDING }}>
                        {loading ? (
                            renderSkeleton()
                        ) : savedReels.length === 0 ? (
                            <View className="flex-1 justify-center items-center min-h-[200px]">
                                <Text className="text-white text-lg">No saved reels found</Text>
                            </View>
                        ) : (
                            // Create rows for saved reels similar to how we do for regular reels
                            (() => {
                                const savedReelRows = [];
                                for (let i = 0; i < savedReels.length; i += COLUMN_COUNT) {
                                    savedReelRows.push(savedReels.slice(i, i + COLUMN_COUNT));
                                }

                                return savedReelRows.map((row, rowIndex) => (
                                    <View
                                        key={rowIndex}
                                        className="flex-row flex-wrap"
                                        style={{
                                            gap: GAP,
                                            marginBottom: rowIndex !== savedReelRows.length - 1 ? GAP : 0
                                        }}
                                    >
                                        {row.map((reel, colIndex) => (
                                            <TouchableOpacity
                                                key={`${rowIndex}-${colIndex}`}
                                                style={{
                                                    width: ITEM_SIZE,
                                                    height: ITEM_SIZE,
                                                }}
                                                className="overflow-hidden bg-white"
                                                activeOpacity={0.8}
                                                onPress={() => router.push(`/reels/${reel._id}`)}
                                            >
                                                <VideoItem videoUrl={reel.video} />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ));
                            })()
                        )}
                    </View>
                )}
            </View>
        </View>
    );
};

export default TabView;
