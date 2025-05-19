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
import { getApprovedReels, Reel, toggleLike, toggleSave, hasLiked, hasSaved } from '@/api/reels';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { followUser, getIsFollowing, unfollowUser } from '@/api/userFollowers';
import Toast from 'react-native-toast-message';

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

const VideoItem = ({ item, index, onShare, onFollow, isVisible }: {
    item: Reel;
    index: number;
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
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [likeCount, setLikeCount] = useState(item.likeCount || 0);
    const [saveCount, setSaveCount] = useState(item.saveCount || 0);
    const { token } = useAuth();
    const queryClient = useQueryClient();
    const lastPlayAttemptRef = useRef<number>(0);
    const playbackErrorCountRef = useRef<number>(0);

    // Check if user has liked the reel
    const { data: likedStatus } = useQuery({
        queryKey: ['hasLiked', item._id],
        queryFn: () => hasLiked(token ? token : '', item._id),
        enabled: !!token && !!item._id,
    });

    // Update liked state when data changes
    React.useEffect(() => {
        if (likedStatus !== undefined) {
            setLiked(likedStatus);
        }
    }, [likedStatus]);

    // Check if user has saved the reel
    const { data: savedStatus } = useQuery({
        queryKey: ['hasSaved', item._id],
        queryFn: () => hasSaved(token ? token : '', item._id),
        enabled: !!token && !!item._id,
    });

    // Update saved state when data changes
    React.useEffect(() => {
        if (savedStatus !== undefined) {
            setSaved(savedStatus);
        }
    }, [savedStatus]);

    const handleLike = async () => {
        if (!token) return;
        try {
            // Optimistically update UI
            setLiked(prev => !prev);
            setLikeCount(prev => liked ? prev - 1 : prev + 1);

            await toggleLike(token, item._id);

            if (Platform.OS !== 'web') {
                Haptics.notificationAsync(
                    liked ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success
                );
            }
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['hasLiked', item._id] });
            queryClient.invalidateQueries({ queryKey: ['reels'] });
        } catch (error) {
            // Revert optimistic update on error
            setLiked(prev => !prev);
            setLikeCount(prev => liked ? prev + 1 : prev - 1);
            console.error('Error toggling like:', error);
        }
    };

    const handleSave = async () => {
        if (!token) return;
        try {
            // Optimistically update UI
            setSaved(prev => !prev);
            setSaveCount(prev => saved ? prev - 1 : prev + 1);

            await toggleSave(token, item._id);

            if (Platform.OS !== 'web') {
                Haptics.notificationAsync(
                    saved ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success
                );
            }
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['hasSaved', item._id] });
            queryClient.invalidateQueries({ queryKey: ['reels'] });
        } catch (error) {
            // Revert optimistic update on error
            setSaved(prev => !prev);
            setSaveCount(prev => saved ? prev + 1 : prev - 1);
            console.error('Error toggling save:', error);
        }
    };

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

        // Throttle play attempts to prevent rapid consecutive calls
        const now = Date.now();
        if (now - lastPlayAttemptRef.current < 300) {
            return;
        }
        lastPlayAttemptRef.current = now;

        try {
            if (isAndroid) {
                setIsBuffering(true);
            }
            await playerRef.current?.play();
            setIsPlaying(true);
            setIsBuffering(false);
            // Reset error count on successful play
            playbackErrorCountRef.current = 0;
        } catch (error) {
            console.log('Error playing video:', error);
            setIsBuffering(false);
            playbackErrorCountRef.current += 1;

            // Only show error after multiple failures
            if (playbackErrorCountRef.current >= 3) {
                handlePlaybackError();
            } else {
                // Try again after a short delay
                setTimeout(() => {
                    if (mountedRef.current && isVisible && isFocused && !userPaused) {
                        playVideo();
                    }
                }, 1000);
            }
        }
    }, [userPaused, isAndroid, isPlayerValid, isVisible, isFocused]);

    // Handle app state changes
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (!mountedRef.current) return;

            if (nextAppState !== 'active') {
                // App going to background
                setUserPaused(true);
                pauseVideo();
            } else if (appState.current !== 'active' && nextAppState === 'active') {
                // App coming to foreground
                if (isVisible && isFocused && !userPaused) {
                    // Small delay to ensure app is fully active
                    setTimeout(() => {
                        if (mountedRef.current) {
                            setUserPaused(false);
                            playVideo();
                        }
                    }, 500);
                }
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [pauseVideo, playVideo, isVisible, isFocused, userPaused]);

    // Play/pause based on visibility and focus
    useEffect(() => {
        if (!mountedRef.current) return;

        const shouldPlay = isFocused && isVisible && !userPaused;

        if (shouldPlay) {
            // Small delay to ensure component is fully mounted
            setTimeout(() => {
                if (mountedRef.current) {
                    playVideo();
                }
            }, 100);
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

    //check if user is following
    const { data: followingStatus } = useQuery({
        queryKey: ['isFollowing', item.userId?._id],
        queryFn: () => token && item.userId?._id ? getIsFollowing(token, item.userId._id) : null,
        enabled: !!token && !!item.userId?._id,
    });

    // Update following state when data changes
    React.useEffect(() => {
        if (followingStatus !== undefined) {
            setIsFollowing(followingStatus.success);
        }
    }, [followingStatus]);

    const handleFollow = async () => {
        if (!token || !item.userId?._id) return;
        try {
            // Optimistically update UI
            setIsFollowing(prev => !prev);
            if (isFollowing) {
                await unfollowUser(token, item.userId._id);
            } else {
                await followUser(token, item.userId._id);
            }


        } catch (error) {
            // Revert optimistic update on error
            setIsFollowing(prev => !prev);
            Toast.show({
                type: 'error',
                text1: 'Warning',
                text2: 'You cannot follow yourself',
            });
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

    // Move the token check here, after all hooks are called
    if (!token) {
        return <Text>No token</Text>
    }

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
            {/* Right Side Stats */}
            <View className="absolute right-4 bottom-72 bg-white/20 p-2.5 rounded-xl items-center gap-5">
                <SocialButton
                    icon={liked ? 'heart' : 'heart-outline'}
                    count={`${likeCount}`}
                    onPress={handleLike}
                    isActive={liked}
                    activeColor="#ff3040"
                />

                <SocialButton
                    icon={saved ? "star" : "star-outline"}
                    count={`${saveCount}`}
                    onPress={handleSave}
                    isActive={saved}
                    activeColor="#FFFF00"
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
    const [visibleIndex, setVisibleIndex] = useState(0);
    const [reelData, setReelData] = useState<Reel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const { token } = useAuth();
    const isFocused = useIsFocused();
    const queryClient = useQueryClient();
    const appState = useRef(AppState.currentState);
    const lastFocusTimeRef = useRef<number>(Date.now());

    // Fetch reels with React Query for better caching and auto-refresh
    const { data, refetch } = useQuery({
        queryKey: ['explore-reels'],
        queryFn: async () => {
            if (!token) return [];
            setIsLoading(true);
            try {
                const reels = await getApprovedReels(token);
                return reels;
            } catch (error) {
                console.error('Error fetching reels:', error);
                Alert.alert('Error', 'Failed to load reels. Please try again.');
                return [];
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        },
        enabled: !!token && isFocused,
    });

    // Update reelData when query data changes
    useEffect(() => {
        if (data) {
            setReelData(data);
        }
    }, [data]);

    // Handle app state changes (background/foreground)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            // Auto refresh when app comes to foreground after being in background
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active' &&
                isFocused
            ) {
                const now = Date.now();
                // Only refresh if it's been more than 2 minutes since last focus
                if (now - lastFocusTimeRef.current > 2 * 60 * 1000) {
                    refetch();
                }
                lastFocusTimeRef.current = now;
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [refetch, isFocused]);

    // Auto refresh when screen comes into focus
    useEffect(() => {
        if (isFocused) {
            const now = Date.now();
            // Only refresh if it's been more than 30 seconds since last focus
            if (now - lastFocusTimeRef.current > 30 * 1000) {
                refetch();
            }
            lastFocusTimeRef.current = now;
        }
    }, [isFocused, refetch]);

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        refetch();
    }, [refetch]);

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

    const toggleFollow = useCallback((username: string) => {
        // Invalidate relevant queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
    }, [queryClient]);

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
            onShare={handleShare}
            onFollow={toggleFollow}
            isVisible={index === visibleIndex}
        />
    ), [visibleIndex, toggleFollow]);

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
