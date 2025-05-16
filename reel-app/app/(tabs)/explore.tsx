import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    FlatList,
    Text,
    TouchableOpacity,
    Share,
    Image,
    useWindowDimensions,
    ActivityIndicator,
    Animated,
    Platform,
    RefreshControl,
    Alert,
    AppState,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { getApprovedReels, Reel } from '@/api/reels';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

type IconName = keyof typeof Ionicons.glyphMap;

const SocialButton = ({ icon, count, onPress, isActive, activeColor = 'red' }: {
    icon: IconName;
    count: string;
    onPress: () => void;
    isActive?: boolean;
    activeColor?: string;
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.2,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
        onPress();
    };

    return (
        <TouchableOpacity
            className="items-center"
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons
                    name={icon}
                    size={28}
                    color={isActive ? activeColor : 'white'}
                />
            </Animated.View>
            <Text className="text-white text-xs mt-1">{count}</Text>
        </TouchableOpacity>
    );
};

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
    const [isBuffering, setIsBuffering] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [userPaused, setUserPaused] = useState(false);
    const retryCount = useRef(0);
    const maxRetries = 3;
    const playerRef = useRef<any>(null);
    const appState = useRef(AppState.currentState);
    const isAndroid = Platform.OS === 'android';
    const mountedRef = useRef(true);

    const player = useVideoPlayer(item.video, (p) => {
        if (!mountedRef.current) return;
        playerRef.current = p;
        p.loop = true;
        p.muted = false;
        p.volume = 1.0;
        p.playbackRate = 1.0;
        // @ts-ignore - Native configuration
        p.style = {
            resizeMode: 'cover'
        };
    });

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            mountedRef.current = false;
            if (playerRef.current) {
                try {
                    playerRef.current.pause();
                } catch (error) {
                    // Ignore cleanup errors
                }
                playerRef.current = null;
            }
        };
    }, []);

    const isPlayerValid = useCallback(() => {
        return mountedRef.current && playerRef.current && !isError;
    }, [isError]);

    const pauseVideo = useCallback(async () => {
        if (!isPlayerValid()) return;

        try {
            if (isAndroid) {
                setIsPlaying(false);
                setIsBuffering(false);
            }
            await playerRef.current?.pause();
            if (!isAndroid) {
                setIsPlaying(false);
                setIsBuffering(false);
            }
        } catch (error) {
            console.log('Error pausing video:', error);
            // Reset states on error
            setIsPlaying(false);
            setIsBuffering(false);
        }
    }, [isAndroid, isPlayerValid]);

    const playVideo = useCallback(async () => {
        if (!isPlayerValid() || userPaused) return;

        try {
            if (isAndroid) {
                setIsBuffering(true);
            }
            await playerRef.current?.play();
            setIsPlaying(true);
            setIsBuffering(false);
        } catch (error) {
            console.log('Error playing video:', error);
            setIsBuffering(false);
            handlePlaybackError();
        }
    }, [userPaused, isAndroid, isPlayerValid]);

    // Handle app state changes
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (!mountedRef.current) return;

            if (isAndroid && nextAppState !== 'active') {
                setUserPaused(true);
                pauseVideo();
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [pauseVideo, isAndroid]);

    useEffect(() => {
        if (!mountedRef.current) return;

        const shouldPlay = isFocused && isVisible && !userPaused;

        if (shouldPlay) {
            playVideo();
        } else {
            pauseVideo();
        }
    }, [isVisible, isFocused, userPaused, playVideo, pauseVideo]);

    const handlePlaybackStatusUpdate = useCallback((status: any) => {
        if (!mountedRef.current || isAndroid) return;

        if (status.isPlaying) {
            setIsPlaying(true);
            setIsBuffering(false);
        } else if (status.isBuffering && !isPlaying) {
            setIsBuffering(true);
        } else {
            setIsBuffering(false);
        }
    }, [isPlaying, isAndroid]);

    const handlePlaybackError = useCallback(async () => {
        if (retryCount.current < maxRetries) {
            retryCount.current += 1;
            try {
                await playerRef.current?.play();
                setIsPlaying(true);
            } catch (error) {
                console.error('Error retrying playback:', error);
                setIsError(true);
            }
        } else {
            setIsError(true);
        }
    }, [playerRef]);

    const handleFollow = () => {
        setIsFollowing(!isFollowing);
        onFollow(item.userId.name);
        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(
                isFollowing ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
            );
        }
    };

    const handleShare = async () => {
        try {
            await onShare(item.video);
            if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to share video');
        }
    };

    const handlePlayPause = useCallback(async () => {
        if (!mountedRef.current || !isPlayerValid()) return;

        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        try {
            if (isPlaying) {
                await pauseVideo();
                setUserPaused(true);
            } else {
                setUserPaused(false);
                await playVideo();
            }
        } catch (error) {
            console.log('Error toggling play/pause:', error);
            // Reset states on error
            setIsPlaying(false);
            setIsBuffering(false);
        }
    }, [isPlaying, pauseVideo, playVideo, isPlayerValid]);

    return (
        <View style={{ height, width }}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={handlePlayPause}
                style={{ flex: 1 }}
                delayPressIn={0}
                delayPressOut={0}
            >
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
                            nativeControls={false}
                        />
                        {/* Loading Indicator */}
                        {isBuffering && (
                            <View className="absolute inset-0 justify-center items-center bg-black/30">
                                <ActivityIndicator size="large" color="white" />
                            </View>
                        )}
                        {isError && (
                            <View className="absolute inset-0 justify-center items-center bg-black/30">
                                <Text className="text-white text-lg">Failed to load video</Text>
                                <TouchableOpacity
                                    className="mt-4 bg-primary px-4 py-2 rounded-full"
                                    onPress={() => {
                                        setIsError(false);
                                        retryCount.current = 0;
                                        handlePlaybackError();
                                    }}
                                >
                                    <Text className="text-white">Retry</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {/* Play Icon */}
                        {(!isPlaying || userPaused) && !isBuffering && !isError && (
                            <View
                                className="absolute inset-0 justify-center items-center"
                                pointerEvents="none"
                            >
                                <View className="w-16 h-16 rounded-full bg-black/50 justify-center items-center">
                                    <Ionicons
                                        name={isPlaying ? "pause" : "play"}
                                        size={32}
                                        color="white"
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>

            {/* Top Navigation */}
            <View className="absolute top-[60px] left-0 right-0 flex-row justify-between px-10 z-10">
                <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-white/20 justify-center items-center"
                    onPress={() => {
                        if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                    }}
                >
                    <Ionicons name="chevron-back" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-white/20 justify-center items-center"
                    onPress={() => {
                        if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                    }}
                >
                    <Ionicons name="search" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* Right Side Stats */}
            <View className="absolute right-4 bottom-72 bg-white/20 p-2.5 rounded-xl items-center gap-5">
                <SocialButton
                    icon={liked[index] ? 'heart' : 'heart-outline'}
                    count={`${item.likeCount}`}
                    onPress={() => onLike(index)}
                    isActive={liked[index]}
                />

                <SocialButton
                    icon="star-outline"
                    count={`${item.saveCount}`}
                    onPress={() => { }}
                />

                <SocialButton
                    icon="grid"
                    count={`Episodes`}
                    onPress={() => { router.push(`/reels-episodes/${item._id}`) }}
                />

                <SocialButton
                    icon="paper-plane-outline"
                    count={`Share`}
                    onPress={handleShare}
                />
            </View>

            {/* Bottom User Info */}
            <View className="absolute bottom-[100px] left-0 right-0 h-40 justify-end pb-4 pr-10">
                <View className="p-4">
                    <View className="flex-row mb-3">
                        {!item.userId?.profilePicture ? (
                            <View className="w-10 h-10 rounded-full bg-secondary/20 border border-white/50 flex items-center justify-center mr-3">
                                <Text className="text-white text-lg font-bold">
                                    {item.userId?.name
                                        ? item.userId.name
                                            .split(' ')
                                            .slice(0, 2)
                                            .map((n) => n[0])
                                            .join('')
                                        : '?'}
                                </Text>
                            </View>
                        ) : (
                            <Image
                                source={{ uri: item.userId.profilePicture }}
                                className="w-10 h-10 rounded-full mr-3"
                            />
                        )}
                        <View className="flex-row gap-4 items-center">
                            <Text className="text-white text-base font-bold">
                                {item.userId?.name ? item.userId.name : 'Unknown User'}
                            </Text>
                            <TouchableOpacity
                                className={`px-5 py-2 rounded-full ${isFollowing ? 'bg-gray-500' : 'bg-primary'}`}
                                onPress={item.userId?.name ? handleFollow : undefined}
                                disabled={!item.userId?.name}
                            >
                                <Text className="text-white font-bold">
                                    {isFollowing ? 'Following' : 'Follow'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text className="text-white text-sm leading-5">{item.description}</Text>
                </View>
            </View>
        </View>
    );
};

const ExploreReel = () => {
    const { height } = useWindowDimensions();
    const [liked, setLiked] = useState<boolean[]>([]);
    const [visibleIndex, setVisibleIndex] = useState(0);
    const [reelData, setReelData] = useState<Reel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const { token } = useAuth();
    const isFocused = useIsFocused();

    const fetchReels = useCallback(async () => {
        if (token) {
            try {
                const reels = await getApprovedReels(token);
                setReelData(reels);
                setLiked(new Array(reels.length).fill(false));
            } catch (error) {
                console.error('Error fetching reels:', error);
                Alert.alert('Error', 'Failed to load reels. Please try again.');
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        } else {
            console.log('No token available');
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [token]);

    useEffect(() => {
        if (isFocused) {
            fetchReels();
        }
    }, [isFocused, fetchReels]);

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchReels();
    }, [fetchReels]);

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
            Alert.alert('Error', 'Failed to share video');
        }
    };

    const toggleFollow = (username: string) => {
        console.log(`Follow ${username}`);
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            const newIndex = viewableItems[0].index;
            setVisibleIndex(newIndex);
        }
    });

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
        minimumViewTime: 300,
    });

    const renderItem = useCallback(({ item, index }: { item: Reel; index: number }) => (
        <VideoItem
            item={item}
            index={index}
            liked={liked}
            onLike={toggleLike}
            onShare={handleShare}
            onFollow={toggleFollow}
            isVisible={index === visibleIndex}
        />
    ), [liked, visibleIndex]);

    const keyExtractor = useCallback((item: Reel) => item._id, []);

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
                <TouchableOpacity
                    className="mt-4 bg-primary px-4 py-2 rounded-full"
                    onPress={handleRefresh}
                >
                    <Text className="text-white">Refresh</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <FlatList
            ref={flatListRef}
            data={reelData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            pagingEnabled
            horizontal={false}
            showsVerticalScrollIndicator={false}
            snapToInterval={height}
            decelerationRate="fast"
            onViewableItemsChanged={onViewableItemsChanged.current}
            viewabilityConfig={viewabilityConfig.current}
            contentContainerStyle={{ flexGrow: 1 }}
            style={{ flex: 1 }}
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    tintColor="white"
                    colors={['white']}
                />
            }
            maxToRenderPerBatch={2}
            windowSize={3}
            removeClippedSubviews={Platform.OS === 'android'}
            initialNumToRender={1}
            getItemLayout={(data, index) => ({
                length: height,
                offset: height * index,
                index,
            })}
        />
    );
};

export default ExploreReel;
