import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    FlatList,
    Text,
    TouchableOpacity,
    Share,
    Image,
    useWindowDimensions,
    ActivityIndicator,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { getApprovedReels, Reel } from '@/api/reels';
import { useAuth } from '@/context/AuthContext';

const VideoItem = ({ item, index, liked, onLike, onShare, onFollow, isVisible }: {
    item: Reel;
    index: number;
    liked: boolean[];
    onLike: (index: number) => void;
    onShare: (url: string) => void;
    onFollow: (username: string) => void;
    isVisible: boolean;
}) => {
    const { height, width } = useWindowDimensions();
    const isFocused = useIsFocused();
    const player = useVideoPlayer(item.video, (p) => {
        p.loop = true;
        p.muted = false;
        // @ts-ignore - Native configuration
        p.style = {
            resizeMode: 'cover'
        };
    });

    useEffect(() => {
        if (isFocused && isVisible) {
            player.play();
        } else {
            try {
                player.pause();
            } catch (error) {
                console.log('Error pausing video:', error);
            }
        }
    }, [isVisible, isFocused]);

    return (
        <View style={{ height, width }}>
            <View className="flex-1 bg-secondary relative" style={{ marginTop: -50, marginBottom: -77 }}>
                <View style={{ flex: 1, overflow: 'hidden' }}>
                    <VideoView
                        player={player}
                        style={{
                            position: 'absolute',
                            top: -50,
                            left: 0,
                            right: 0,
                            bottom: -77,
                            overflow: 'hidden',
                            width: '100%',
                            height: height + 127,
                            transform: [{ scale: 1.2 }]
                        }}
                        pointerEvents="none"
                    />
                </View>
            </View>

            {/* Top Navigation */}
            <View className="absolute top-[60px] left-0 right-0 flex-row justify-between px-10 z-10">
                <TouchableOpacity className="w-10 h-10 rounded-full bg-white/20 justify-center items-center">
                    <Ionicons name="chevron-back" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity className="w-10 h-10 rounded-full bg-white/20 justify-center items-center">
                    <Ionicons name="search" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* Right Side Stats */}
            <View className="absolute right-4 bottom-72 bg-white/20 p-2.5 rounded-xl items-center gap-5">
                <TouchableOpacity className="items-center" onPress={() => onLike(index)}>
                    <Ionicons name={liked[index] ? 'heart' : 'heart-outline'} size={28} color={liked[index] ? 'red' : 'white'} />
                    <Text className="text-white text-xs mt-1">{item.likeCount}</Text>
                </TouchableOpacity>

                <TouchableOpacity className="items-center">
                    <Ionicons name="star-outline" size={28} color="white" />
                    <Text className="text-white text-xs mt-1">{item.saveCount}</Text>
                </TouchableOpacity>

                <TouchableOpacity className="items-center">
                    <Ionicons name="grid" size={28} color="white" />
                    <Text className="text-white text-xs mt-1">Episodes</Text>
                </TouchableOpacity>

                <TouchableOpacity className="items-center" onPress={() => onShare(item.video)}>
                    <Ionicons name="paper-plane-outline" size={28} color="white" />
                    <Text className="text-white text-xs mt-1">Share</Text>
                </TouchableOpacity>
            </View>

            {/* Bottom User Info */}
            <View
                className="absolute bottom-[100px] left-0 right-0 h-40 justify-end pb-4 pr-10"
            >
                <View className="p-4">
                    <View className="flex-row items-center justify-center mb-3">
                        {item.userId.profilePicture === "" && (
                            <View className="w-10 h-10 rounded-full mr-3 bg-secondary/20 border border-white/50 flex items-center justify-center" >
                                <Text className="text-white text-lg font-bold">
                                    {item.userId.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                                </Text>
                            </View>
                        )}
                        {item.userId.profilePicture !== "" && (
                            <Image source={{ uri: item.userId.profilePicture }} className="w-10 h-10 rounded-full mr-3" />
                        )}
                        <View className="flex-1 flex-row gap-4 items-center">
                            <Text className="text-white text-base font-bold">
                                {item.userId.name}
                            </Text>
                            <TouchableOpacity
                                className="bg-primary px-5 py-2 rounded-full"
                                onPress={() => onFollow(item.userId.name)}
                            >
                                <Text className="text-white font-bold">Follow</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text className="text-white text-sm leading-5">{item.description}</Text>
                </View>
            </View>
        </View >
    );
};

const ExploreReel = () => {
    const { height } = useWindowDimensions();
    const [liked, setLiked] = useState<boolean[]>([]);
    const [visibleIndex, setVisibleIndex] = useState(0);
    const [reelData, setReelData] = useState<Reel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);
    const { token } = useAuth();
    const isFocused = useIsFocused();

    useEffect(() => {
        const fetchReels = async () => {
            if (token) {
                try {
                    setIsLoading(true);
                    console.log('Fetching reels with token:', token);
                    console.log('API URL:', process.env.EXPO_PUBLIC_API_URL);
                    const reels = await getApprovedReels(token);
                    console.log('Received reels:', reels);
                    setReelData(reels);
                    setLiked(new Array(reels.length).fill(false));
                } catch (error) {
                    console.error('Error fetching reels:', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                console.log('No token available');
            }
        };

        if (isFocused) {
            fetchReels();
        }
    }, [token, isFocused]);

    const toggleLike = (index: number) => {
        const newLikes = [...liked];
        newLikes[index] = !newLikes[index];
        setLiked(newLikes);
    };

    const handleShare = async (videoUrl: string) => {
        try {
            await Share.share({
                message: 'Check out this reel!',
                url: videoUrl,
            });
        } catch (err) {
            console.error(err);
        }
    };

    const toggleFollow = (username: string) => {
        console.log(`Follow ${username}`);
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setVisibleIndex(viewableItems[0].index);
        }
    });

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    });

    const renderItem = ({ item, index }: { item: Reel; index: number }) => (
        <VideoItem
            item={item}
            index={index}
            liked={liked}
            onLike={toggleLike}
            onShare={handleShare}
            onFollow={toggleFollow}
            isVisible={index === visibleIndex}
        />
    );

    if (isLoading) {
        return (
            <View className="flex-1 bg-secondary justify-center items-center">
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="text-white mt-4">Loading reels...</Text>
            </View>
        );
    }

    if (reelData.length === 0) {
        return (
            <View className="flex-1 bg-secondary justify-center items-center">
                <Text className="text-white text-lg">No reels available</Text>
            </View>
        );
    }

    return (
        <FlatList
            ref={flatListRef}
            data={reelData}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            pagingEnabled
            horizontal={false}
            showsVerticalScrollIndicator={false}
            snapToInterval={height}
            decelerationRate="fast"
            onViewableItemsChanged={onViewableItemsChanged.current}
            viewabilityConfig={viewabilityConfig.current}
            contentContainerStyle={{ flexGrow: 1 }}
            style={{ flex: 1 }}
        />
    );
};

export default ExploreReel;
