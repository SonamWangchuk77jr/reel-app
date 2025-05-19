import React, { useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, StatusBar, TouchableOpacity, Image, Dimensions, Platform, Share } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { getEpisodeById, hasLiked, hasSaved, toggleLike, toggleSave } from '@/api/episodes';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getIsFollowing, unfollowUser, followUser } from '@/api/userFollowers';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

export default function EpisodePlayer() {
    const { episodeId } = useLocalSearchParams<{ episodeId: string }>();
    const { token } = useAuth();
    const [isPlaying, setIsPlaying] = useState(true);
    const [userPaused, setUserPaused] = useState(false);
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);

    // If no token, render early return
    if (!token) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <Text style={styles.errorText}>No token</Text>
            </View>
        );
    }

    const { data: episode, isLoading, error, refetch } = useQuery({
        queryKey: ['episode', episodeId],
        queryFn: () => getEpisodeById(episodeId, token),
        enabled: !!episodeId && !!token,
    });

    const { data: likedStatus } = useQuery({
        queryKey: ['hasLiked', episodeId],
        queryFn: () => hasLiked(token, episodeId),
        enabled: !!episodeId && !!token,
    });

    // Set liked state when data changes
    React.useEffect(() => {
        if (likedStatus !== undefined) {
            setLiked(likedStatus);
        }
    }, [likedStatus]);

    const { data: hasSavedStatus } = useQuery({
        queryKey: ['hasSaved', episodeId],
        queryFn: () => hasSaved(token, episodeId),
        enabled: !!episodeId && !!token,
    });

    // Set saved state when data changes
    React.useEffect(() => {
        if (hasSavedStatus !== undefined) {
            setSaved(hasSavedStatus);
        }
    }, [hasSavedStatus]);

    const videoPlayer = useVideoPlayer(episode?.videoUrl || null, (p) => {
        if (episode?.videoUrl) {
            p.loop = true;
            p.muted = false;
            p.play();
        }
    });

    const handlePlayPause = useCallback(async () => {
        try {
            if (isPlaying) {
                videoPlayer?.pause();
                setUserPaused(true);
            } else {
                setUserPaused(false);
                videoPlayer?.play();
            }
            setIsPlaying(!isPlaying);
        } catch (error) {
            console.log('Error toggling play/pause:', error);
        }
    }, [isPlaying, videoPlayer]);

    const handleLike = async () => {
        try {
            await toggleLike(token, episodeId);
            setLiked(prev => !prev);
            refetch(); // Refetch episode data after liking
        } catch (error) {
            console.log('Error toggling like:', error);
        }
    };

    const handleSave = async () => {
        try {
            await toggleSave(token, episodeId);
            setSaved(prev => !prev);
            refetch(); // Refetch episode data after saving
        } catch (error) {
            console.log('Error toggling save:', error);
        }
    };

    const handleShare = async () => {
        try {
            const shareUrl = `${process.env.EXPO_PUBLIC_APP_URL || 'reel-app://'}episode/${episodeId}`;
            const result = await Share.share({
                message: `Check out this awesome episode: ${episode?.episodeName}`,
                url: shareUrl,
                title: episode?.episodeName || 'Cool episode'
            });

            if (result.action === Share.sharedAction) {
                console.log('Content shared successfully');
            }
        } catch (error) {
            console.log('Error sharing:', error);
        }
    };


    // check if user is following
    const { data: followingStatus } = useQuery({
        queryKey: ['isFollowing', episode?.userId?._id],
        queryFn: () => token && episode?.userId?._id ? getIsFollowing(token, episode.userId._id) : null,
        enabled: !!token && !!episode?.userId?._id,
    });

    // Update following state when data changes
    React.useEffect(() => {
        if (followingStatus !== undefined) {
            setIsFollowing(followingStatus.success);
        }
    }, [followingStatus]);

    const [isFollowing, setIsFollowing] = useState(false);
    const handleFollow = async () => {
        if (!token || !episode?.userId?._id) return;
        try {
            //check if following or not
            const followingStatus = await getIsFollowing(token, episode.userId._id);

            console.log('followingStatus', followingStatus);

            // Optimistically update UI
            setIsFollowing(!followingStatus.success);

            // Call the appropriate API based on current following state
            if (followingStatus.success) {
                await unfollowUser(token, episode.userId._id);
            } else {
                await followUser(token, episode.userId._id);
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

    if (isLoading) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <Stack.Screen
                    options={{
                        headerShown: false,
                        title: "Loading...",
                        animation: Platform.OS === 'ios' ? 'fade' : 'fade',
                        presentation: 'card',
                        animationDuration: 200,
                    }}
                />
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    if (error || !episode) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <Stack.Screen
                    options={{
                        headerShown: false,
                        title: "Error",
                        animation: Platform.OS === 'ios' ? 'fade' : 'fade',
                        presentation: 'card',
                        animationDuration: 200,
                    }}
                />
                <Text style={styles.errorText}>Failed to load episode</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <Stack.Screen
                options={{
                    headerShown: false,
                    title: episode?.episodeName || "Episode",
                    animation: Platform.OS === 'ios' ? 'fade' : 'fade',
                    presentation: 'card',
                    animationDuration: 200,
                    gestureEnabled: true,
                }}
            />

            <TouchableOpacity
                activeOpacity={1}
                onPress={handlePlayPause}
                style={{ flex: 1 }}
                delayPressIn={0}
                delayPressOut={0}
            >
                <VideoView
                    player={videoPlayer}
                    style={styles.video}
                    contentFit="cover"
                    nativeControls={false}
                />

                {/* Top gradient overlay */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.5)', 'transparent']}
                    style={styles.topGradient}
                />

                {/* Bottom gradient overlay */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.bottomGradient}
                />

                {/* Back button */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>

                {/* Right side social buttons */}
                <View className='bg-white/20 p-4 rounded-2xl' style={styles.socialButtonsContainer}>
                    <TouchableOpacity style={styles.socialButton} onPress={handleLike}>
                        <Ionicons
                            name={liked ? "heart" : "heart-outline"}
                            size={28}
                            color={liked ? "#ff3040" : "white"}
                        />
                        <Text style={styles.socialButtonText}>
                            {episode.likeCount || 0}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.socialButton} onPress={handleSave}>
                        <Ionicons name={saved ? "star" : "star-outline"} size={26} color={saved ? "#FFFF00" : "white"} />
                        <Text style={styles.socialButtonText}>
                            {episode.saveCount || 0}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.socialButton} onPress={handleShare}>
                        <Feather name="send" size={26} color="white" />
                        <Text style={styles.socialButtonText}>Share</Text>
                    </TouchableOpacity>
                </View>

                {/* User info at bottom */}
                <View style={styles.userInfoContainer}>
                    <View style={styles.userInfoContent}>
                        <TouchableOpacity style={styles.userAvatarContainer}>
                            {episode.userId?.profilePicture ? (
                                <Image
                                    source={{ uri: episode.userId.profilePicture }}
                                    style={styles.userAvatar}
                                />
                            ) : (
                                <View style={styles.userAvatar}>
                                    <Ionicons name="person" size={20} color="#fff" />
                                </View>
                            )}
                        </TouchableOpacity>
                        <Text style={styles.userName}>
                            {episode.userId?.name || "User"}
                        </Text>
                        {isFollowing ? (
                            <TouchableOpacity style={styles.followButton} onPress={handleFollow}>
                                <Text style={styles.followButtonText}>Following</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.followButton} onPress={handleFollow}>
                                <Text style={styles.followButtonText}>Follow</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text style={styles.episodeDescription} numberOfLines={2}>
                        {episode.description || episode.episodeName}
                    </Text>
                </View>

                {/* Play/Pause Icon */}
                {!isPlaying && (
                    <View style={styles.playPauseOverlay}>
                        <View style={styles.playPauseButton}>
                            <Ionicons name="play" size={36} color="white" />
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    topGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        left: 15,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    socialButtonsContainer: {
        position: 'absolute',
        right: 10,
        bottom: "35%",
        alignItems: 'center',
    },
    socialButton: {
        alignItems: 'center',
        marginBottom: 20,
    },
    socialButtonText: {
        color: 'white',
        marginTop: 3,
        fontSize: 12,
        fontWeight: '500',
    },
    audioContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#fff',
        overflow: 'hidden',
        marginTop: 10,
    },
    audioImage: {
        width: '100%',
        height: '100%',
    },
    userInfoContainer: {
        position: 'absolute',
        bottom: 30,
        left: 15,
        right: 80,
    },
    userInfoContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    userAvatarContainer: {
        marginRight: 10,
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
        flex: 1,
    },
    verifiedBadge: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#3897f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 5,
    },
    followButton: {
        borderWidth: 1,
        borderColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 4,
        marginLeft: 10,
    },
    followButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 12,
    },
    episodeDescription: {
        color: 'white',
        fontSize: 14,
        marginBottom: 10,
    },
    musicContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    musicText: {
        color: 'white',
        fontSize: 13,
        marginLeft: 5,
    },
    playPauseOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    playPauseButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
});
