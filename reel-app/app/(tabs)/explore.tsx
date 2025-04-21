import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    FlatList,
    Text,
    TouchableOpacity,
    Share,
    Image,
    useWindowDimensions,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

// Sample data for multiple reels
const reelData = [
    {
        id: '1',
        videoUrl: 'https://cdn.pixabay.com/video/2022/07/24/125314-733046618_large.mp4',
        username: 'Doro Bai',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
        description: 'True Detective Is A Gripping Anthology Series Exploring Crime Morality And Human Nature',
        stats: {
            likes: 12,
            stars: 200,
            shares: 45
        },
        verified: true,
    },
    {
        id: '2',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        username: 'resorttours',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        description: 'Explore nature like never before 🍃',
        stats: {
            likes: 8,
            stars: 150,
            shares: 32
        },
        verified: false,
    },
    // Add more reels here as needed
];

const VideoItem = ({ item, index, liked, onLike, onShare, onFollow, isVisible }: {
    item: any;
    index: number;
    liked: boolean[];
    onLike: (index: number) => void;
    onShare: (url: string) => void;
    onFollow: (username: string) => void;
    isVisible: boolean;
}) => {
    const { height, width } = useWindowDimensions();
    const isFocused = useIsFocused();
    const player = useVideoPlayer(item.videoUrl, (p) => {
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
            player.pause();
        }

        return () => {
            player.pause();
        };
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
                    <Text className="text-white text-xs mt-1">{item.stats.likes}</Text>
                </TouchableOpacity>

                <TouchableOpacity className="items-center">
                    <Ionicons name="star-outline" size={28} color="white" />
                    <Text className="text-white text-xs mt-1">{item.stats.stars}</Text>
                </TouchableOpacity>

                <TouchableOpacity className="items-center">
                    <Ionicons name="grid" size={28} color="white" />
                    <Text className="text-white text-xs mt-1">Episodes</Text>
                </TouchableOpacity>

                <TouchableOpacity className="items-center" onPress={() => onShare(item.videoUrl)}>
                    <Ionicons name="paper-plane-outline" size={28} color="white" />
                    <Text className="text-white text-xs mt-1">{item.stats.shares}</Text>
                </TouchableOpacity>
            </View>

            {/* Bottom User Info */}
            <View
                className="absolute bottom-[100px] left-0 right-0 h-40 justify-end pb-4 pr-10"
            >
                <View className="p-4">
                    <View className="flex-row items-center justify-center mb-3">
                        <Image source={{ uri: item.avatar }} className="w-10 h-10 rounded-full mr-3" />
                        <View className="flex-1 flex-row gap-4 items-center">
                            <Text className="text-white text-base font-bold">
                                {item.username}
                            </Text>
                            <TouchableOpacity
                                className="bg-primary px-5 py-2 rounded-full"
                                onPress={() => onFollow(item.username)}
                            >
                                <Text className="text-white font-bold">Follow</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text className="text-white text-sm leading-5">{item.description}</Text>
                </View>
            </View>
        </View>
    );
};

const InstagramReel = () => {
    const { height } = useWindowDimensions();
    const [liked, setLiked] = useState<boolean[]>(reelData.map(() => false));
    const [visibleIndex, setVisibleIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

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

    const renderItem = ({ item, index }: { item: any; index: number }) => (
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

    return (
        <FlatList
            ref={flatListRef}
            data={reelData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
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

export default InstagramReel;
